# backend/app.py

from flask import Flask, request, jsonify
from flask_cors import CORS
from models import db, GroceryItem, PurchaseHistory
import os
import time
import psycopg2

app = Flask(__name__)
CORS(app)

# Database config from Docker env
app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get("DATABASE_URL")
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db.init_app(app)


def wait_for_db():
    while True:
        try:
            conn = psycopg2.connect(os.environ["DATABASE_URL"])
            conn.close()
            print("✅ Database is ready!")
            break
        except psycopg2.OperationalError:
            print("⏳ Waiting for database...")
            time.sleep(1)

#get items in current grocery list from GroceryItem table
@app.route("/api/items", methods=["GET"])
def get_items():
    items = GroceryItem.query.order_by(GroceryItem.created_at.desc()).all()
    return jsonify(
        [
            {
                "id": item.id,
                "name": item.name,
                "quantity": item.quantity,
                "added_to_cart": item.added_to_cart,
            }
            for item in items
        ]
    )

# Add item to GroceryItem table with name and quantity when user adds item
@app.route("/api/items", methods=["POST"])
def add_item():
    data = request.get_json()

    name = data.get("name", "").strip()
    quantity = data.get("quantity", 1)

    if not name:
        return jsonify({"error": "Name is required"}), 400

    if not isinstance(quantity, int) or quantity <= 0:
        return jsonify({"error": "Quantity must be a positive integer"}), 400

    try:
        item = GroceryItem(name=name, quantity=quantity)
        db.session.add(item)
        db.session.commit()

        return jsonify(
            {
                "id": item.id,
                "name": item.name,
                "quantity": item.quantity,
                "added_to_cart": item.added_to_cart,
            }
        )
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Failed to add item"}), 500

# toggle item in GroceryItem table using item_id when user adds/removes item from cart
@app.route("/api/items/<int:item_id>/cart", methods=["PATCH"])
def toggle_cart(item_id):
    try:
        item = GroceryItem.query.get_or_404(item_id)
        item.added_to_cart = not item.added_to_cart
        db.session.commit()
        return jsonify({
            "id": item.id,
            "name": item.name,
            "quantity": item.quantity,
            "added_to_cart": item.added_to_cart,
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Failed to toggle cart status"}), 500

# update item using item_id when user edits the item
@app.route("/api/items/<int:item_id>", methods=["PUT"])
def update_item(item_id):
    data = request.get_json()
    item = GroceryItem.query.get_or_404(item_id)

    name = data.get("name", item.name).strip()
    quantity = data.get("quantity", item.quantity)

    if not name:
        return jsonify({"error": "Name is required"}), 400

    if not isinstance(quantity, int) or quantity <= 0:
        return jsonify({"error": "Quantity must be a positive integer"}), 400

    try:
        item.name = name
        item.quantity = quantity
        db.session.commit()

        return jsonify(
            {
                "id": item.id,
                "name": item.name,
                "quantity": item.quantity,
                "added_to_cart": item.added_to_cart,
            }
        )
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Failed to update item"}), 500

#delete item from GroceryItem table using item_id
@app.route("/api/items/<int:item_id>", methods=["DELETE"])
def delete_item(item_id):
    try:
        item = GroceryItem.query.get_or_404(item_id)
        db.session.delete(item)
        db.session.commit()
        return jsonify({"message": "Deleted"})
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Failed to delete item"}), 500


# delete items in cart from GroceryItem table and add them to PurchaseHistory table
@app.route("/api/purchase", methods=["POST"])
def finalize_purchase():
    try:
        cart_items = GroceryItem.query.filter_by(added_to_cart=True).all()

        if not cart_items:
            return jsonify({"message": "No items in cart"}), 400

        # history entries to be created
        history_records = [
            PurchaseHistory(item_name=item.name, quantity=item.quantity)
            for item in cart_items
        ]

        # bulk insert into PurchaseHistory
        db.session.bulk_save_objects(history_records)

        # bulk delete from GroceryItem
        item_ids = [item.id for item in cart_items]
        GroceryItem.query.filter(GroceryItem.id.in_(item_ids)).delete(
            synchronize_session=False
        )

        db.session.commit()

        return jsonify({"message": "Purchase recorded"})
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Failed to finalize purchase"}), 500

# get purchase history from PurchaseHistory table
# returns the 20 most recent unique timestamps and their items
@app.route("/api/history", methods=["GET"])
def get_history():

    # get the 20 most recent unique timestamps
    recent_timestamps = (
        db.session.query(PurchaseHistory.purchased_at)
        .distinct()
        .order_by(PurchaseHistory.purchased_at.desc())
        .limit(20)
        .all()
    )
    timestamps = [ts[0] for ts in recent_timestamps]

    if not timestamps:
        return jsonify([])

    # get teh history records from those timestamps
    history = (
        PurchaseHistory.query.filter(PurchaseHistory.purchased_at.in_(timestamps))
        .order_by(PurchaseHistory.purchased_at.desc())
        .all()
    )

    # group by timestamp
    grouped = {}
    for item in history:
        ts = item.purchased_at
        grouped.setdefault(ts, []).append(
            {"name": item.item_name, "quantity": item.quantity}
        )

    result = [
        {"timestamp": ts.strftime("%B %d, %Y %H:%M"), "items": grouped[ts]}
        for ts in sorted(grouped, reverse=True)
    ]

    return jsonify(result)

# get the latest purchase history from PurchaseHistory table
@app.route("/api/history/latest", methods=["GET"])
def get_latest_history():
    # latest timestamp
    latest_timestamp = db.session.query(
        db.func.max(PurchaseHistory.purchased_at)
    ).scalar()

    if not latest_timestamp:
        return jsonify(None)

    # get all items purchased at that timestamp
    items = (
        PurchaseHistory.query.filter(PurchaseHistory.purchased_at == latest_timestamp)
        .order_by(PurchaseHistory.id.asc())
        .all()
    )

    return jsonify(
        {
            "timestamp": latest_timestamp.strftime("%B %d, %Y %H:%M"),
            "items": [
                {"name": item.item_name, "quantity": item.quantity} for item in items
            ],
        }
    )


if __name__ == "__main__":
    wait_for_db()
    with app.app_context():
        db.create_all()
    app.run(debug=True, host="0.0.0.0")

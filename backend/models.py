from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class GroceryItem(db.Model):
    __tablename__ = 'grocery_items'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    quantity = db.Column(db.Integer, nullable=False, default=1)
    added_to_cart = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, server_default=db.func.now())

class PurchaseHistory(db.Model):
    __tablename__ = 'purchase_history'

    id = db.Column(db.Integer, primary_key=True)
    item_name = db.Column(db.String(100), nullable=False)
    quantity = db.Column(db.Integer, nullable=False, default=1)
    purchased_at = db.Column(db.DateTime, server_default=db.func.now(), index=True)

import { useState, useEffect, useCallback } from "react";
import {
  ShoppingCart,
  Plus,
  Minus,
} from "lucide-react";
import {
  fetchItems,
  addItem,
  deleteItem,
  updateItem,
  toggleCartStatus,
  purchaseItems,
  fetchHistory,
  fetchLatestHistory,
} from "../api/groceryApi";
import GroceryItemCard from "./GroceryItemCard";
import PurchaseHistory from "./PurchaseHistory";

const GroceryList = () => {
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [itemsData, historyData] = await Promise.all([
          fetchItems(),
          fetchHistory(),
        ]);

        setItems(itemsData);
        setHistory(historyData);
        setLoading(false);
      } catch (error) {
        console.error("Error loading data:", error);
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (newItem.trim() === "") return;

    const item = { name: newItem.trim(), quantity: Number(quantity) || 1 };
    try {
      const added = await addItem(item);
      setItems([added, ...items]);
      setNewItem("");
      setQuantity(1);
    } catch (error) {
      console.error("Failed to add item:", error);
      alert("Failed to add item. Please try again.");
    }
  };

  const handleToggle = useCallback(async (id) => {
    const prevItems = [...items]; // backup
    const optimisticItems = items.map((i) =>
      i.id === id ? { ...i, added_to_cart: !i.added_to_cart } : i
    );
    setItems(optimisticItems);

    try {
      await toggleCartStatus(id);
    } catch (error) {
      console.error("Failed to toggle cart status:", error);
      alert("Error updating item. Reverting changes.");
      setItems(prevItems);// rollback
    }
  }, [items]);

  const handleDelete = useCallback(async (id) => {
    const prevItems = [...items]; // backup
    const updatedItems = items.filter((i) => i.id !== id);
    setItems(updatedItems);

    try {
      await deleteItem(id);
    } catch (error) {
      console.error("Failed to delete item:", error);
      alert("Could not delete item. Restoring...");
      setItems(prevItems);
    }
  }, [items]);

  const handlePurchase = async () => {
    const prevItems = [...items]; // backup
    const updatedItems = items.filter((item) => !item.added_to_cart);
    setItems(updatedItems);

    try {
      await purchaseItems();

      const latest = await fetchLatestHistory();
      if (latest) {
        setHistory((prev) => [latest, ...prev]);
      }
    } catch (error) {
      console.error("Purchase failed:", error);
      alert("Purchase failed. Restoring cart items...");
      setItems(prevItems); // rollback
    }
  };

  const handleSaveEdit = useCallback(async (id, name, quantity) => {
    const updatedItem = { name: name.trim(), quantity };
    const prev = [...items];

    setItems(items.map((i) => (i.id === id ? { ...i, ...updatedItem } : i)));

    try {
      const saved = await updateItem(id, updatedItem);
      setItems(items.map((i) => (i.id === id ? saved : i)));
      setEditingId(null);
    } catch (error) {
      console.error("Update failed:", error);
      alert("Could not update item.");
      setItems(prev);
    }
  }, [items]);

  const cartItems = items.filter((item) => item.added_to_cart);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Add Item */}
      <div className="mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              placeholder="Add new item..."
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddItem(e)}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500"
            />

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, Number(quantity) - 1))}
                className="p-2 border border-gray-300 rounded-full"
              >
                <Minus className="w-4 h-4" />
              </button>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-16 px-3 py-2 border text-center border-gray-300 rounded-full [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <button
                type="button"
                onClick={() => setQuantity(Number(quantity) + 1)}
                className="p-2 border border-gray-300 rounded-full"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={handleAddItem}
              className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-full"
            >
              Add Item
            </button>
          </div>
        </div>
      </div>

      {/* Item List */}
      <div className="space-y-3 mb-8">
        {items.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border p-8 text-center">
            <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">Your grocery list is empty</p>
          </div>
        ) : (
          items.map((item) => (
            <GroceryItemCard
              key={item.id}
              item={item}
              isEditing={editingId === item.id}
              setEditingId={setEditingId}
              onToggle={handleToggle}
              onDelete={handleDelete}
              onSave={handleSaveEdit}
            />
          ))
        )}
      </div>

      {/* Purchase Button */}
      {cartItems.length > 0 && (
        <div className="mb-8">
          <button
            onClick={handlePurchase}
            className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-full text-lg"
          >
            Purchased Items
          </button>
        </div>
      )}

      {/* Purchase History */}
      <PurchaseHistory history={history} />
    </div>
  );
};

export default GroceryList;

import React, {  useState } from "react";
import { Check, X, Edit2, Trash2, Minus, Plus } from "lucide-react";

const GroceryItemCard = ({
  item,
  onToggle,
  onDelete,
  onSave,
  isEditing,
  setEditingId,
}) => {
  const [editedName, setEditedName] = useState(item.name);
  const [editedQuantity, setEditedQuantity] = useState(item.quantity);


  return (
    <div
      className={`rounded-xl shadow-sm border p-4 transition-all duration-200 hover:shadow-md ${
        item.added_to_cart
          ? "bg-gray-50 border-gray-300"
          : "bg-white border-gray-200"
      }`}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          {!isEditing && (
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={item.added_to_cart}
                onChange={() => onToggle(item.id)}
                className="sr-only"
              />
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                  item.added_to_cart
                    ? "bg-green-500 border-green-500"
                    : "border-gray-300 hover:border-green-400"
                }`}
              >
                {item.added_to_cart && <Check className="w-3 h-3 text-white" />}
              </div>
            </label>
          )}

          <div className="flex-1 min-w-0">
            {isEditing ? (
              <div className="space-y-3">
                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setEditedQuantity(Math.max(1, Number(editedQuantity) - 1))
                    }
                    className="p-1 border border-gray-300 rounded-full hover:bg-gray-50"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <input
                    type="number"
                    value={editedQuantity}
                    min="1"
                    onChange={(e) => setEditedQuantity(Number(e.target.value))}
                    className="w-16 px-1 py-1 border border-gray-300 rounded-full text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setEditedQuantity(Number(editedQuantity) + 1)
                    }
                    className="p-1 border border-gray-300 rounded-full hover:bg-gray-50"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <>
                <span
                  className={`text-lg font-medium ${
                    item.added_to_cart
                      ? "text-gray-500 line-through"
                      : "text-gray-800"
                  }`}
                >
                  {item.name}
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`text-sm px-2 py-1 rounded-full ${
                      item.added_to_cart
                        ? "bg-gray-200 text-gray-600"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    Qty: {item.quantity}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <button
                onClick={() => {
                  onSave(item.id, editedName, editedQuantity);
                }}
                className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={() => setEditingId(null)}
                className="p-2 bg-gray-500 text-white rounded-full hover:bg-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setEditingId(item.id)}
                className="p-2 bg-gray-300 text-black rounded-full hover:bg-gray-400"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete(item.id)}
                className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(GroceryItemCard);

import { useState} from "react";
import {History, Package } from "lucide-react";

const PurchaseHistory = ({ history }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!history || history.length === 0) {
    return (
      <div className="bg-gray-50 rounded-xl p-6 text-center">
        <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600">No purchase history yet</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-orange-50 to-yellow-50 hover:from-orange-100 hover:to-yellow-100 transition-all duration-200"
      >
        <div className="flex items-center gap-3">
          <History className="w-5 h-5 text-gray-700" />
          <h3 className="text-lg font-semibold text-gray-800">Purchase History</h3>
        </div>
        <div className={`transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
          <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>
      
      {isExpanded && (
        <div className="max-h-80 overflow-y-auto">
          {history.map((record, index) => (
            <div key={index} className="border-b border-gray-100 last:border-b-0 p-4">
              <div className="text-sm font-medium text-gray-800 mb-2">
                {record.timestamp}
              </div>
              <div className="space-y-2">
                {record.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-sm bg-gray-50 rounded-lg px-3 py-2">
                    <span className="text-black">{item.name}</span>
                    <span className="bg-orange-100 text-black px-2 py-1 rounded-full text-xs font-medium">
                      Qty: {item.quantity}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PurchaseHistory;
import GroceryList from "./components/GroceryList";
import { ShoppingCart } from "lucide-react";

function App() {
  return (
    <div className="min-h-screen bg-gray-50 ">
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-3 rounded-full">
              <ShoppingCart className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Grocery List
            </h1>
          </div>
        </div>
        <GroceryList />
      </div>
    </div>
  );
}

export default App;

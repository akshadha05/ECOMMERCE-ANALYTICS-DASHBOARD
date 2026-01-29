import React from 'react';
import { 
  LayoutDashboard, 
  TrendingUp, 
  ShoppingCart, 
  Package, 
  Search, 
  PieChart, 
  Smartphone,
  Settings,
  LogOut
} from 'lucide-react';

const Sidebar = ({ activeView, setActiveView, onLogout, tenant }) => {
  const menuItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'revenue', label: 'Revenue Trends', icon: TrendingUp },
    { id: 'products', label: 'Top Products', icon: Package },
    { id: 'funnel', label: 'Conversion Funnel', icon: ShoppingCart },
    { id: 'categories', label: 'Categories', icon: PieChart },
    { id: 'devices', label: 'Devices', icon: Smartphone },
    { id: 'search', label: 'Search Analytics', icon: Search },
  ];

  return (
    <div className="w-64 bg-gradient-to-b from-gray-900 to-gray-800 text-white h-screen flex flex-col">
      <div className="p-6 border-b border-gray-700">
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-sm text-gray-400 mt-1">{tenant?.storeName}</p>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                activeView === item.id
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              <Icon size={20} />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-700 space-y-2">
        <button
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-700 transition-all duration-200"
        >
          <Settings size={20} />
          <span>Settings</span>
        </button>
        <button
          onClick={onLogout}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-900/20 transition-all duration-200"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
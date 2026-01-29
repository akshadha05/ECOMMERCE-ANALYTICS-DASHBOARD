import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import DateRangePicker from './components/DateRangePicker';
import Overview from './components/views/Overview';
import RevenueTrends from './components/views/RevenueTrends';
import TopProducts from './components/views/TopProducts';
import ConversionFunnel from './components/views/ConversionFunnel';
import CategoryPerformance from './components/views/CategoryPerformance';
import DeviceBreakdown from './components/views/DeviceBreakdown';
import SearchAnalytics from './components/views/SearchAnalytics';
import { authAPI, eventsAPI } from './services/api';
import { RefreshCw } from 'lucide-react';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [tenant, setTenant] = useState(null);
  const [activeView, setActiveView] = useState('overview');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date().toISOString(),
  });
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    const storedTenant = localStorage.getItem('tenant');
    
    if (token && storedTenant) {
      setTenant(JSON.parse(storedTenant));
      setIsAuthenticated(true);
    }
  }, []);

  const handleLoginSuccess = (tenantData) => {
    setTenant(tenantData);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('tenant');
    setIsAuthenticated(false);
    setTenant(null);
  };

  const handleProcessData = async () => {
    setProcessing(true);
    try {
      await eventsAPI.processData(dateRange);
      alert('Data processed successfully! Refresh to see updated metrics.');
      window.location.reload();
    } catch (error) {
      alert('Error processing data: ' + (error.response?.data?.error || error.message));
    } finally {
      setProcessing(false);
    }
  };

  const renderView = () => {
    switch (activeView) {
      case 'overview':
        return <Overview dateRange={dateRange} />;
      case 'revenue':
        return <RevenueTrends dateRange={dateRange} />;
      case 'products':
        return <TopProducts dateRange={dateRange} />;
      case 'funnel':
        return <ConversionFunnel dateRange={dateRange} />;
      case 'categories':
        return <CategoryPerformance dateRange={dateRange} />;
      case 'devices':
        return <DeviceBreakdown dateRange={dateRange} />;
      case 'search':
        return <SearchAnalytics dateRange={dateRange} />;
      default:
        return <Overview dateRange={dateRange} />;
    }
  };

  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar 
        activeView={activeView} 
        setActiveView={setActiveView} 
        onLogout={handleLogout}
        tenant={tenant}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">E-Commerce Analytics Dashboard</h1>
              <p className="text-sm text-gray-600 mt-1">Multi-tenant analytics with Medallion Architecture</p>
            </div>
            <div className="flex items-center space-x-4">
              <DateRangePicker onDateChange={setDateRange} />
              <button
                onClick={handleProcessData}
                disabled={processing}
                className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:bg-gray-400"
              >
                <RefreshCw size={18} className={processing ? 'animate-spin' : ''} />
                <span>{processing ? 'Processing...' : 'Process Data'}</span>
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-8">
          {renderView()}
        </main>
      </div>
    </div>
  );
}

export default App;
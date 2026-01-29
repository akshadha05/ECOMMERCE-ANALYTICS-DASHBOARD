import React, { useEffect, useState } from 'react';
import { analyticsAPI } from '../../services/api';
import KPICard from '../KPICard';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DollarSign, ShoppingBag, TrendingUp, Users, Eye, ShoppingCart, MousePointer } from 'lucide-react';
import { format } from 'date-fns';

const Overview = ({ dateRange }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [dateRange]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await analyticsAPI.getOverview(dateRange);
      setData(response.data);
    } catch (error) {
      console.error('Error fetching overview:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!data) return null;

  const { overview, dailyMetrics } = data;

  const chartData = dailyMetrics.map(metric => ({
    date: format(new Date(metric.date), 'MMM dd'),
    revenue: metric.totalRevenue,
    orders: metric.totalOrders,
    visitors: metric.uniqueVisitors,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-800">Dashboard Overview</h2>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Total Revenue"
          value={overview.totalRevenue}
          format="currency"
          icon={DollarSign}
          color="green"
        />
        <KPICard
          title="Total Orders"
          value={overview.totalOrders}
          icon={ShoppingBag}
          color="blue"
        />
        <KPICard
          title="Avg Order Value"
          value={overview.averageOrderValue}
          format="currency"
          icon={TrendingUp}
          color="purple"
        />
        <KPICard
          title="Conversion Rate"
          value={overview.conversionRate}
          format="percentage"
          icon={MousePointer}
          color="orange"
        />
      </div>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Unique Visitors"
          value={overview.uniqueVisitors}
          icon={Users}
          color="indigo"
        />
        <KPICard
          title="Total Page Views"
          value={overview.totalPageViews}
          icon={Eye}
          color="blue"
        />
        <KPICard
          title="Add to Cart Rate"
          value={overview.addToCartRate}
          format="percentage"
          icon={ShoppingCart}
          color="green"
        />
        <KPICard
          title="Cart Abandonment"
          value={overview.cartAbandonmentRate}
          format="percentage"
          icon={ShoppingCart}
          color="red"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" stroke="#666" style={{ fontSize: '12px' }} />
              <YAxis stroke="#666" style={{ fontSize: '12px' }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '8px' }}
                formatter={(value) => `$${value.toFixed(2)}`}
              />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', r: 4 }} name="Revenue" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Orders Trend */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Orders & Visitors</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" stroke="#666" style={{ fontSize: '12px' }} />
              <YAxis stroke="#666" style={{ fontSize: '12px' }} />
              <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '8px' }} />
              <Legend />
              <Bar dataKey="orders" fill="#10b981" name="Orders" radius={[8, 8, 0, 0]} />
              <Bar dataKey="visitors" fill="#8b5cf6" name="Visitors" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Overview;

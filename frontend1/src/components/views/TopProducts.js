import React, { useEffect, useState } from 'react';
import { analyticsAPI } from '../../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

const TopProducts = ({ dateRange }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [dateRange]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await analyticsAPI.getTopProducts({ ...dateRange, limit: 10 });
      setData(response.data.topProducts);
    } catch (error) {
      console.error('Error fetching top products:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-96"><div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div></div>;
  }

  if (!data || data.length === 0) {
    return <div className="text-center text-gray-500 py-12">No product data available</div>;
  }

  const pieData = data.slice(0, 5).map(product => ({
    name: product.productName,
    value: product.totalRevenue,
  }));

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-800">Top Products</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by Product Bar Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Revenue by Product</h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" stroke="#666" />
              <YAxis dataKey="productName" type="category" width={150} stroke="#666" style={{ fontSize: '12px' }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '8px' }}
                formatter={(value) => `$${value.toFixed(2)}`}
              />
              <Bar dataKey="totalRevenue" fill="#3b82f6" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue Distribution Pie Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Revenue Distribution (Top 5)</h3>
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Rank</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Product</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Revenue</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Quantity Sold</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Views</th>
              </tr>
            </thead>
           <tbody className="divide-y divide-gray-200">
            {data.map((product, index) => (
              <tr key={product.productId} className="hover:bg-gray-50 transition-colors">
<td className="px-6 py-4 whitespace-nowrap">
<div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-sm">
{index + 1}
</div>
</td>
<td className="px-6 py-4">
<div className="text-sm font-medium text-gray-900">{product.productName}</div>
<div className="text-xs text-gray-500">{product.productId}</div>
</td>
<td className="px-6 py-4 whitespace-nowrap text-right">
<span className="text-sm font-semibold text-green-600">
${product.totalRevenue.toFixed(2)}
</span>
</td>
<td className="px-6 py-4 whitespace-nowrap text-right">
<span className="text-sm text-gray-700">{product.totalQuantity}</span>
</td>
<td className="px-6 py-4 whitespace-nowrap text-right">
<span className="text-sm text-gray-700">{product.totalViews}</span>
</td>
</tr>
))}
</tbody>
</table>
</div>
</div>
</div>
);
};
export default TopProducts;
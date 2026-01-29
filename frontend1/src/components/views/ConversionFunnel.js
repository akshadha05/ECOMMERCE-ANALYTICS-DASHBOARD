import React, { useEffect, useState } from 'react';
import { analyticsAPI } from '../../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const ConversionFunnel = ({ dateRange }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [dateRange]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await analyticsAPI.getConversionFunnel(dateRange);
      setData(response.data.funnel);
    } catch (error) {
      console.error('Error fetching conversion funnel:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-96"><div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div></div>;
  }

  if (!data) return null;

  const funnelData = [
    { stage: 'Page Views', count: data.pageViews, percentage: 100 },
    { stage: 'Product Views', count: data.productViews, percentage: data.pageViews > 0 ? (data.productViews / data.pageViews) * 100 : 0 },
    { stage: 'Add to Cart', count: data.addToCarts, percentage: data.productViews > 0 ? (data.addToCarts / data.productViews) * 100 : 0 },
    { stage: 'Checkout', count: data.checkouts, percentage: data.addToCarts > 0 ? (data.checkouts / data.addToCarts) * 100 : 0 },
    { stage: 'Purchase', count: data.purchases, percentage: data.checkouts > 0 ? (data.purchases / data.checkouts) * 100 : 0 },
  ];

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-800">Conversion Funnel</h2>

      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <ResponsiveContainer width="100%" height={500}>
          <BarChart data={funnelData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis type="number" stroke="#666" />
            <YAxis dataKey="stage" type="category" width={150} stroke="#666" />
            <Tooltip 
              contentStyle={{ backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '8px' }}
              formatter={(value, name, props) => [
                `${value.toLocaleString()} (${props.payload.percentage.toFixed(1)}%)`,
                'Count'
              ]}
            />
            <Bar dataKey="count" radius={[0, 8, 8, 0]}>
              {funnelData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Funnel Steps Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {funnelData.map((step, index) => (
          <div key={step.stage} className="bg-white rounded-xl shadow-lg p-6 border-l-4" style={{ borderColor: COLORS[index] }}>
            <p className="text-sm font-medium text-gray-600 mb-2">{step.stage}</p>
            <p className="text-3xl font-bold text-gray-900">{step.count.toLocaleString()}</p>
            <p className="text-sm text-gray-500 mt-2">{step.percentage.toFixed(1)}% of previous</p>
            {index > 0 && (
              <p className="text-xs text-gray-400 mt-1">
                Drop-off: {((funnelData[index - 1].count - step.count) / funnelData[index - 1].count * 100).toFixed(1)}%
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Conversion Rates */}
      <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-8 text-white">
        <h3 className="text-2xl font-bold mb-6">Key Conversion Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm opacity-90">Product View Rate</p>
            <p className="text-4xl font-bold mt-2">
              {data.pageViews > 0 ? ((data.productViews / data.pageViews) * 100).toFixed(1) : 0}%
            </p>
          </div>
          <div>
            <p className="text-sm opacity-90">Add to Cart Rate</p>
            <p className="text-4xl font-bold mt-2">
              {data.productViews > 0 ? ((data.addToCarts / data.productViews) * 100).toFixed(1) : 0}%
            </p>
          </div>
          <div>
            <p className="text-sm opacity-90">Purchase Conversion</p>
            <p className="text-4xl font-bold mt-2">
              {data.pageViews > 0 ? ((data.purchases / data.pageViews) * 100).toFixed(1) : 0}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConversionFunnel;
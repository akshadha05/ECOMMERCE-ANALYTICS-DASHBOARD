import React, { useEffect, useState } from 'react';
import { analyticsAPI } from '../../services/api';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Smartphone, Tablet, Monitor } from 'lucide-react';

const COLORS = {
  Mobile: '#3b82f6',
  Tablet: '#10b981',
  Desktop: '#f59e0b',
};

const DeviceBreakdown = ({ dateRange }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [dateRange]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await analyticsAPI.getDeviceBreakdown(dateRange);
      setData(response.data.deviceBreakdown);
    } catch (error) {
      console.error('Error fetching device breakdown:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-96"><div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div></div>;
  }

  if (!data || data.length === 0) {
    return <div className="text-center text-gray-500 py-12">No device data available</div>;
  }

  const totalCount = data.reduce((sum, device) => sum + device.count, 0);

  const getDeviceIcon = (device) => {
    switch (device) {
      case 'Mobile': return Smartphone;
      case 'Tablet': return Tablet;
      case 'Desktop': return Monitor;
      default: return Monitor;
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-800">Device Breakdown</h2>

      {/* Device Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {data.map((device) => {
          const Icon = getDeviceIcon(device.device);
          return (
            <div 
              key={device.device}
              className="bg-white rounded-xl shadow-lg p-6 border-t-4"
              style={{ borderColor: COLORS[device.device] }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-800">{device.device}</h3>
                <div 
                  className="p-3 rounded-lg"
                  style={{ backgroundColor: `${COLORS[device.device]}20` }}
                >
                  <Icon size={24} style={{ color: COLORS[device.device] }} />
                </div>
              </div>
              <p className="text-4xl font-bold text-gray-900 mb-2">{device.count.toLocaleString()}</p>
              <p className="text-sm text-gray-600">Sessions</p>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-2xl font-bold" style={{ color: COLORS[device.device] }}>
                  {device.percentage.toFixed(1)}%
                </p>
                <p className="text-xs text-gray-500">of total traffic</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Traffic Distribution</h3>
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ device, percentage }) => `${device}: ${percentage.toFixed(1)}%`}
                outerRadius={120}
                fill="#8884d8"
                dataKey="count"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[entry.device]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => value.toLocaleString()} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Sessions by Device</h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="device" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '8px' }}
                formatter={(value) => value.toLocaleString()}
              />
              <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[entry.device]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-lg p-8 text-white">
        <h3 className="text-2xl font-bold mb-6">Device Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm opacity-90">Total Sessions</p>
            <p className="text-4xl font-bold mt-2">{totalCount.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm opacity-90">Most Used Device</p>
            <p className="text-4xl font-bold mt-2">{data[0]?.device || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm opacity-90">Device Diversity</p>
            <p className="text-4xl font-bold mt-2">{data.filter(d => d.count > 0).length}</p>
            <p className="text-xs opacity-75 mt-1">Active device types</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeviceBreakdown;
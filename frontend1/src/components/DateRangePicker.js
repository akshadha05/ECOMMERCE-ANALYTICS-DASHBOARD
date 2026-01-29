import React, { useState } from 'react';
import { Calendar } from 'lucide-react';

const DateRangePicker = ({ onDateChange }) => {
  const [selectedRange, setSelectedRange] = useState('30');

  const handleRangeChange = (days) => {
    setSelectedRange(days);
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    
    onDateChange({
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    });
  };

  const ranges = [
    { label: 'Last 7 Days', value: '7' },
    { label: 'Last 30 Days', value: '30' },
    { label: 'Last 90 Days', value: '90' },
  ];

  return (
    <div className="flex items-center space-x-2">
      <Calendar size={20} className="text-gray-600" />
      <div className="flex space-x-2">
        {ranges.map((range) => (
          <button
            key={range.value}
            onClick={() => handleRangeChange(range.value)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              selectedRange === range.value
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {range.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default DateRangePicker;
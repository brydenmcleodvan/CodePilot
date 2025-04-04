import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { formatMetricDataForChart, generateChartColors, calculateMetricStats, determineMetricTrend } from '../utils/visualization_helpers';

const TrendIndicator = ({ trend }) => {
  if (trend === 'up') {
    return <span className="text-red-500">↑</span>;
  } else if (trend === 'down') {
    return <span className="text-green-500">↓</span>;
  }
  return <span className="text-gray-500">→</span>;
};

const HealthMetricsChart = ({ metricName, customData }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [metricsData, setMetricsData] = useState([]);
  const [selectedMetric, setSelectedMetric] = useState(metricName || '');
  const [availableMetrics, setAvailableMetrics] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [stats, setStats] = useState({ min: 0, max: 0, avg: 0, median: 0 });
  const [trend, setTrend] = useState('stable');

  // Fetch metrics data if not provided
  useEffect(() => {
    if (customData) {
      processData(customData);
      return;
    }

    const fetchMetricsData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/health-metrics');
        if (!response.ok) {
          throw new Error('Failed to fetch health metrics');
        }
        const data = await response.json();
        processData(data);
      } catch (err) {
        console.error('Error fetching health metrics:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchMetricsData();
  }, [customData]);

  // Process the metrics data
  const processData = (data) => {
    setMetricsData(data);
    
    // Get available metrics
    const metrics = data.map(metric => metric.name);
    setAvailableMetrics(metrics);
    
    // Set default selected metric if not specified
    const metricToUse = metricName || (metrics.length > 0 ? metrics[0] : '');
    setSelectedMetric(metricToUse);
    
    // Format chart data for the selected metric
    updateChartData(data, metricToUse);
    
    setLoading(false);
  };

  // Update chart data when selected metric changes
  useEffect(() => {
    if (metricsData.length > 0 && selectedMetric) {
      updateChartData(metricsData, selectedMetric);
    }
  }, [selectedMetric, metricsData]);

  // Update chart data based on selected metric
  const updateChartData = (data, metricName) => {
    const { labels, values } = formatMetricDataForChart(data, metricName);
    
    // Create data for recharts
    const formattedData = labels.map((date, index) => ({
      date,
      value: values[index]
    }));
    
    setChartData(formattedData);
    
    // Calculate statistics
    setStats(calculateMetricStats(values));
    
    // Determine trend
    setTrend(determineMetricTrend(values));
  };

  // Handle metric selection change
  const handleMetricChange = (e) => {
    setSelectedMetric(e.target.value);
  };

  if (loading) {
    return <div className="p-4 bg-gray-100 rounded-lg">Loading health metrics...</div>;
  }

  if (error) {
    return <div className="p-4 bg-red-100 text-red-700 rounded-lg">Error: {error}</div>;
  }

  if (!metricsData || metricsData.length === 0) {
    return <div className="p-4 bg-yellow-100 rounded-lg">No health metrics available</div>;
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Health Metrics</h2>
        
        {availableMetrics.length > 1 && (
          <select 
            className="border border-gray-300 rounded px-3 py-1"
            value={selectedMetric}
            onChange={handleMetricChange}
          >
            {availableMetrics.map(metric => (
              <option key={metric} value={metric}>{metric}</option>
            ))}
          </select>
        )}
      </div>
      
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-3 rounded">
          <div className="text-sm text-gray-600">Min</div>
          <div className="text-lg font-semibold">{stats.min}</div>
        </div>
        <div className="bg-blue-50 p-3 rounded">
          <div className="text-sm text-gray-600">Max</div>
          <div className="text-lg font-semibold">{stats.max}</div>
        </div>
        <div className="bg-blue-50 p-3 rounded">
          <div className="text-sm text-gray-600">Average</div>
          <div className="text-lg font-semibold">{stats.avg}</div>
        </div>
        <div className="bg-blue-50 p-3 rounded">
          <div className="text-sm text-gray-600">Trend</div>
          <div className="text-lg font-semibold flex items-center">
            {trend} <TrendIndicator trend={trend} />
          </div>
        </div>
      </div>
      
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip 
              contentStyle={{ backgroundColor: 'white', borderRadius: '4px' }}
              labelStyle={{ fontWeight: 'bold' }}
            />
            <Line 
              type="monotone" 
              dataKey="value" 
              name={selectedMetric}
              stroke="#4A90E2" 
              activeDot={{ r: 8 }} 
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 text-sm text-gray-500">
        Last updated: {chartData.length > 0 ? chartData[chartData.length - 1].date : 'N/A'}
      </div>
    </div>
  );
};

export default HealthMetricsChart;
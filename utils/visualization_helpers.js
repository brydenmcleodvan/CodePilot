/**
 * Health data visualization helper functions
 */

/**
 * Transforms health metric data into chart-friendly format
 * @param {Array} metricsData - Array of health metrics
 * @param {String} metricName - Name of the metric to extract
 * @returns {Object} Formatted data for charts
 */
export const formatMetricDataForChart = (metricsData, metricName) => {
  if (!metricsData || !Array.isArray(metricsData)) {
    return { labels: [], values: [] };
  }

  const metric = metricsData.find(m => m.name === metricName);
  if (!metric || !metric.readings) {
    return { labels: [], values: [] };
  }

  const labels = metric.readings.map(r => r.date);
  const values = metric.readings.map(r => {
    // Handle blood pressure which is formatted as "120/80"
    if (typeof r.value === 'string' && r.value.includes('/')) {
      return parseInt(r.value.split('/')[0]); // Return systolic value
    }
    return r.value;
  });

  return { labels, values };
};

/**
 * Generates color palette for charts
 * @param {Number} count - Number of colors needed
 * @returns {Array} Array of color strings
 */
export const generateChartColors = (count) => {
  const baseColors = [
    '#4A90E2', // Primary blue
    '#50E3C2', // Teal
    '#F5A623', // Orange
    '#D0021B', // Red
    '#7ED321', // Green
    '#9013FE', // Purple
    '#BD10E0', // Magenta
    '#4A4A4A'  // Dark gray
  ];

  // If we need more colors than base colors, interpolate
  if (count <= baseColors.length) {
    return baseColors.slice(0, count);
  }

  // Simple interpolation for more colors
  const result = [...baseColors];
  while (result.length < count) {
    const idx = result.length % baseColors.length;
    const baseColor = baseColors[idx];
    // Create a slightly different shade
    const lighterColor = adjustBrightness(baseColor, 20);
    result.push(lighterColor);
  }

  return result;
};

/**
 * Adjusts the brightness of a hex color
 * @param {String} hex - Hex color code
 * @param {Number} percent - Percentage to adjust (-100 to 100)
 * @returns {String} Adjusted hex color
 */
const adjustBrightness = (hex, percent) => {
  // Parse the hex string to RGB
  let r = parseInt(hex.slice(1, 3), 16);
  let g = parseInt(hex.slice(3, 5), 16);
  let b = parseInt(hex.slice(5, 7), 16);

  // Adjust brightness
  r = Math.min(255, Math.max(0, r + (percent * 2.55)));
  g = Math.min(255, Math.max(0, g + (percent * 2.55)));
  b = Math.min(255, Math.max(0, b + (percent * 2.55)));

  // Convert back to hex
  return `#${Math.round(r).toString(16).padStart(2, '0')}${Math.round(g).toString(16).padStart(2, '0')}${Math.round(b).toString(16).padStart(2, '0')}`;
};

/**
 * Calculates statistical data for a health metric
 * @param {Array} values - Array of numeric values
 * @returns {Object} Statistical data
 */
export const calculateMetricStats = (values) => {
  if (!values || !values.length) {
    return {
      min: 0,
      max: 0,
      avg: 0,
      median: 0
    };
  }

  const numericValues = values.filter(v => !isNaN(Number(v)));
  if (!numericValues.length) return { min: 0, max: 0, avg: 0, median: 0 };

  const min = Math.min(...numericValues);
  const max = Math.max(...numericValues);
  const sum = numericValues.reduce((a, b) => a + b, 0);
  const avg = sum / numericValues.length;
  
  // Calculate median
  const sorted = [...numericValues].sort((a, b) => a - b);
  const midpoint = Math.floor(sorted.length / 2);
  const median = sorted.length % 2 === 0
    ? (sorted[midpoint - 1] + sorted[midpoint]) / 2
    : sorted[midpoint];

  return {
    min: Math.round(min * 10) / 10,
    max: Math.round(max * 10) / 10,
    avg: Math.round(avg * 10) / 10,
    median: Math.round(median * 10) / 10
  };
};

/**
 * Determines trend direction based on recent values
 * @param {Array} values - Array of values
 * @param {Number} lookback - Number of values to consider for trend
 * @returns {String} "up", "down", or "stable"
 */
export const determineMetricTrend = (values, lookback = 3) => {
  if (!values || values.length < 2) {
    return "stable";
  }

  const recent = values.slice(-Math.min(lookback, values.length));
  const first = recent[0];
  const last = recent[recent.length - 1];
  
  const percentChange = ((last - first) / first) * 100;
  
  if (Math.abs(percentChange) < 5) {
    return "stable";
  }
  
  return percentChange > 0 ? "up" : "down";
};

/**
 * Formats medication data for display
 * @param {Array} medications - Medication data
 * @returns {Array} Formatted medication data
 */
export const formatMedications = (medications) => {
  if (!medications || !Array.isArray(medications)) {
    return [];
  }

  return medications.map(med => ({
    ...med,
    status: determineReminderStatus(med),
    nextDose: calculateNextDose(med)
  }));
};

/**
 * Helper function to determine medication reminder status
 * @param {Object} medication - Medication data
 * @returns {String} "due", "upcoming", or "taken"
 */
const determineReminderStatus = (medication) => {
  // This is a placeholder implementation
  // In a real app, this would check against actual medication logs
  const statuses = ["due", "upcoming", "taken"];
  return statuses[Math.floor(Math.random() * statuses.length)];
};

/**
 * Calculate next dose time based on medication frequency
 * @param {Object} medication - Medication data
 * @returns {String} Next dose time
 */
const calculateNextDose = (medication) => {
  // This is a placeholder implementation
  // In a real app, this would calculate based on frequency and last taken time
  const now = new Date();
  const hours = now.getHours();
  
  if (medication.frequency.includes("daily")) {
    if (hours < 8) return "8:00 AM";
    if (hours < 20) return "8:00 PM";
    return "8:00 AM tomorrow";
  }
  
  if (medication.frequency.includes("twice")) {
    if (hours < 8) return "8:00 AM";
    if (hours < 14) return "2:00 PM";
    if (hours < 20) return "8:00 PM";
    return "8:00 AM tomorrow";
  }
  
  return "As needed";
};
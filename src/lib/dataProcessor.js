/**
 * Data processing utilities
 */

/**
 * Calculate basic statistics for numeric columns
 */
export function calculateStatistics(data, column) {
  if (!data || data.length === 0) {
    return null;
  }

  const values = data
    .map(row => parseFloat(row[column]))
    .filter(val => !isNaN(val));

  if (values.length === 0) {
    return null;
  }

  const sorted = [...values].sort((a, b) => a - b);
  const sum = values.reduce((a, b) => a + b, 0);
  const mean = sum / values.length;
  const median = sorted.length % 2 === 0
    ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
    : sorted[Math.floor(sorted.length / 2)];

  return {
    column,
    count: values.length,
    mean: Math.round(mean * 100) / 100,
    median: Math.round(median * 100) / 100,
    min: Math.min(...values),
    max: Math.max(...values),
    sum: Math.round(sum * 100) / 100
  };
}

/**
 * Find anomalies in numeric columns (values outside 2 standard deviations)
 */
export function findAnomalies(data, column) {
  if (!data || data.length === 0) {
    return [];
  }

  const values = data
    .map((row, idx) => ({ value: parseFloat(row[column]), index: idx }))
    .filter(item => !isNaN(item.value));

  if (values.length < 3) {
    return [];
  }

  const numbers = values.map(v => v.value);
  const mean = numbers.reduce((a, b) => a + b, 0) / numbers.length;
  const variance = numbers.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / numbers.length;
  const stdDev = Math.sqrt(variance);

  const threshold = 2 * stdDev;
  const anomalies = values.filter(item => 
    Math.abs(item.value - mean) > threshold
  );

  return anomalies.map(anomaly => ({
    index: anomaly.index,
    value: anomaly.value,
    deviation: Math.round((anomaly.value - mean) / stdDev * 100) / 100
  }));
}

/**
 * Count missing values
 */
export function countMissingValues(data, columns) {
  const missing = {};
  columns.forEach(col => {
    const missingCount = data.filter(row => 
      row[col] === null || row[col] === undefined || row[col] === '' || row[col] === 'N/A'
    ).length;
    missing[col] = {
      count: missingCount,
      percentage: Math.round((missingCount / data.length) * 100 * 100) / 100
    };
  });
  return missing;
}

/**
 * Filter data based on conditions
 */
export function filterData(data, filters) {
  return data.filter(row => {
    return filters.every(filter => {
      const value = row[filter.column];
      const filterValue = filter.value;

      switch (filter.operator) {
        case 'equals':
          return String(value) === String(filterValue);
        case 'contains':
          return String(value).toLowerCase().includes(String(filterValue).toLowerCase());
        case 'greater':
          return parseFloat(value) > parseFloat(filterValue);
        case 'less':
          return parseFloat(value) < parseFloat(filterValue);
        default:
          return true;
      }
    });
  });
}

/**
 * Group data by column
 */
export function groupBy(data, column) {
  const groups = {};
  data.forEach(row => {
    const key = String(row[column] || 'null');
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(row);
  });
  return groups;
}

/**
 * Aggregate grouped data
 */
export function aggregateGroups(groups, aggregateColumn, operation = 'sum') {
  const result = [];
  Object.entries(groups).forEach(([key, rows]) => {
    const values = rows.map(r => parseFloat(r[aggregateColumn])).filter(v => !isNaN(v));
    let aggregated;

    switch (operation) {
      case 'sum':
        aggregated = values.reduce((a, b) => a + b, 0);
        break;
      case 'avg':
      case 'mean':
        aggregated = values.reduce((a, b) => a + b, 0) / values.length;
        break;
      case 'count':
        aggregated = values.length;
        break;
      case 'min':
        aggregated = Math.min(...values);
        break;
      case 'max':
        aggregated = Math.max(...values);
        break;
      default:
        aggregated = values.length;
    }

    result.push({
      group: key,
      value: Math.round(aggregated * 100) / 100,
      count: rows.length
    });
  });

  return result;
}

/**
 * Detect data types for columns
 */
export function detectColumnTypes(data, columns) {
  const types = {};
  columns.forEach(col => {
    const sample = data.slice(0, 100).map(row => row[col]).filter(v => v != null && v !== '');
    
    if (sample.length === 0) {
      types[col] = 'unknown';
      return;
    }

    const isNumeric = sample.every(v => !isNaN(parseFloat(v)) && isFinite(v));
    const isDate = sample.some(v => !isNaN(Date.parse(v)));
    const isBoolean = sample.every(v => ['true', 'false', '1', '0', 'yes', 'no'].includes(String(v).toLowerCase()));

    if (isNumeric) {
      types[col] = 'number';
    } else if (isDate) {
      types[col] = 'date';
    } else if (isBoolean) {
      types[col] = 'boolean';
    } else {
      types[col] = 'string';
    }
  });

  return types;
}


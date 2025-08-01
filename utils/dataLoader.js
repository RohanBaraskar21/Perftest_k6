// ...existing code...
/**
 * Utility to load CSV or JSON data for parameterized tests
 */
import { SharedArray } from 'k6/data';

export function loadCSV(path) {
  return new SharedArray('csv data', function () {
    const text = open(path);
    const [header, ...rows] = text.trim().split('\n');
    const keys = header.split(',');
    return rows.map(row => {
      const values = row.split(',');
      return Object.fromEntries(keys.map((k, i) => [k, values[i]]));
    });
  });
}

export function loadJSON(path) {
  return new SharedArray('json data', function () {
    return JSON.parse(open(path));
  });
}
// ...existing code...

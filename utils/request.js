// ...existing code...
/**
 * Utility for making HTTP requests with k6
 * @param {Object} params - { method, url, body, params, headers }
 * @returns {Object} k6 HTTP response
 */
import http from 'k6/http';

export function makeRequest({ method = 'GET', url, body = null, params = {}, headers = {} }) {
  const reqParams = { ...params, headers };
  switch (method.toUpperCase()) {
    case 'POST':
      return http.post(url, body, reqParams);
    case 'PUT':
      return http.put(url, body, reqParams);
    case 'DELETE':
      return http.del(url, body, reqParams);
    default:
      return http.get(url, reqParams);
  }
}
// ...existing code...

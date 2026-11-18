const BASE_URL = '/api';

async function request(url, options = {}) {
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(`${BASE_URL}${url}`, config);
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMsg = data?.error || data?.message || 'Server request failed';
    throw new Error(errorMsg);
  }

  return data;
}

export const api = {
  // Stockists
  getStockists: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/stockists${query ? `?${query}` : ''}`);
  },
  getStockist: (id) => request(`/stockists/${id}`),
  createStockist: (data) => request('/stockists', { method: 'POST', body: JSON.stringify(data) }),
  updateStockist: (id, data) => request(`/stockists/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteStockist: (id) => request(`/stockists/${id}`, { method: 'DELETE' }),

  // Retailers
  getRetailers: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/retailers${query ? `?${query}` : ''}`);
  },
  getRetailer: (id) => request(`/retailers/${id}`),
  createRetailer: (data) => request('/retailers', { method: 'POST', body: JSON.stringify(data) }),
  updateRetailer: (id, data) => request(`/retailers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteRetailer: (id) => request(`/retailers/${id}`, { method: 'DELETE' }),

  // Products
  getProducts: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/products${query ? `?${query}` : ''}`);
  },
  getProduct: (id) => request(`/products/${id}`),
  createProduct: (data) => request('/products', { method: 'POST', body: JSON.stringify(data) }),
  updateProduct: (id, data) => request(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteProduct: (id) => request(`/products/${id}`, { method: 'DELETE' }),

  // Orders
  getOrders: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/orders${query ? `?${query}` : ''}`);
  },
  getOrder: (id) => request(`/orders/${id}`),
  createOrder: (data) => request('/orders', { method: 'POST', body: JSON.stringify(data) }),
  updateOrder: (id, data) => request(`/orders/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  markOrderDelivered: (id, data = {}) => request(`/orders/${id}/deliver`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteOrder: (id) => request(`/orders/${id}`, { method: 'DELETE' }),

  // Receipt Download URLs
  getRetailerReceiptUrl: (orderId) => `${BASE_URL}/orders/${orderId}/receipt/retailer`,
  getStockistReceiptUrl: (orderId) => `${BASE_URL}/orders/${orderId}/receipt/stockist`,
  getDispatchedChallanUrl: (dispatchId) => `${BASE_URL}/dispatches/${dispatchId}/receipt/dispatched`,
  getPendingSlipUrl: (dispatchId) => `${BASE_URL}/dispatches/${dispatchId}/receipt/pending`,
  getPaymentReceiptUrl: (paymentId) => `${BASE_URL}/payments/${paymentId}/receipt`,

  // Dispatches
  processDispatch: (orderId, data) => request(`/dispatches/orders/${orderId}/dispatch`, { method: 'POST', body: JSON.stringify(data) }),

  // Payments & Ledger
  getPayments: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/payments${query ? `?${query}` : ''}`);
  },
  recordPayment: (data) => request('/payments', { method: 'POST', body: JSON.stringify(data) }),
  updatePayment: (id, data) => request(`/payments/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deletePayment: (id) => request(`/payments/${id}`, { method: 'DELETE' }),
  getLedgerSummary: () => request('/payments/ledger/summary'),
  getRetailerLedgerDetail: (retailerId) => request(`/payments/ledger/retailer/${retailerId}`),

  // Analytics
  getDashboardSummary: () => request('/analytics/dashboard'),
  getBiAnalytics: (timeframe = 'monthly') => request(`/analytics/bi?timeframe=${timeframe}`),

  // PJP
  getPjpVisits: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/pjp${query ? `?${query}` : ''}`);
  },
  createPjpVisit: (data) => request('/pjp', { method: 'POST', body: JSON.stringify(data) }),
  updatePjpVisit: (id, data) => request(`/pjp/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deletePjpVisit: (id) => request(`/pjp/${id}`, { method: 'DELETE' }),
};

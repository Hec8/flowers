import api from './api';

export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  getAddresses: () => api.get('/auth/addresses'),
  createAddress: (data) => api.post('/auth/addresses', data),
  updateAddress: (id, data) => api.put(`/auth/addresses/${id}`, data),
  deleteAddress: (id) => api.delete(`/auth/addresses/${id}`),
};

export const productService = {
  getAll: (params) => api.get('/products', { params }),
  getBySlug: (slug) => api.get(`/products/${slug}`),
  getCategories: () => api.get('/products/categories'),
  createReview: (productId, data) => api.post(`/products/${productId}/reviews`, data),
};

export const cartService = {
  get: () => api.get('/cart'),
  add: (data) => api.post('/cart', data),
  sync: (items) => api.post('/cart/sync', { items }),
  update: (id, quantity) => api.put(`/cart/${id}`, { quantity }),
  remove: (id) => api.delete(`/cart/${id}`),
  clear: () => api.delete('/cart'),
};

export const orderService = {
  create: (data) => api.post('/orders', data),
  getMyOrders: (params) => api.get('/orders', { params }),
  getById: (id) => api.get(`/orders/${id}`),
  checkPaymentStatus: (orderId, params) => api.get(`/orders/${orderId}/payment-status`, { params }),
  retryPayment: (orderId) => api.post(`/orders/${orderId}/retry-payment`),
};

export const wishlistService = {
  get: () => api.get('/wishlist'),
  add: (productId) => api.post('/wishlist', { productId }),
  remove: (productId) => api.delete(`/wishlist/${productId}`),
};

export const producerService = {
  getAll: (params) => api.get('/producers', { params }),
  getBySlug: (slug) => api.get(`/producers/${slug}`),
};

export const contactService = {
  submit: (data) => api.post('/contact', data),
  subscribe: (email) => api.post('/newsletter', { email }),
};

export const adminService = {
  getDashboard: () => api.get('/admin/dashboard'),
  getProducts: (params) => api.get('/products/admin', { params }),
  createProduct: (data) => api.post('/products/admin', data),
  updateProduct: (id, data) => api.put(`/products/admin/${id}`, data),
  deleteProduct: (id) => api.delete(`/products/admin/${id}`),
  uploadImage: (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post('/products/admin/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  createCategory: (data) => api.post('/products/admin/categories', data),
  updateCategory: (id, data) => api.put(`/products/admin/categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/products/admin/categories/${id}`),
  getOrders: (params) => api.get('/admin/orders', { params }),
  updateOrderStatus: (id, data) => api.patch(`/admin/orders/${id}/status`, data),
  getUsers: (params) => api.get('/admin/users', { params }),
  toggleUser: (id) => api.patch(`/admin/users/${id}/toggle`),
  getProducers: () => api.get('/producers'),
  createProducer: (data) => api.post('/producers/admin', data),
  updateProducer: (id, data) => api.put(`/producers/admin/${id}`, data),
  deleteProducer: (id) => api.delete(`/producers/admin/${id}`),
  uploadProducerImage: (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post('/producers/admin/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getContactMessages: (params) => api.get('/admin/contact-messages', { params }),
  markContactRead: (id) => api.patch(`/admin/contact-messages/${id}/read`),
  getNewsletterSubscriptions: (params) => api.get('/admin/newsletter', { params }),
  seedStaticProducts: (products) => api.post('/admin/seed-products', { products }),
};

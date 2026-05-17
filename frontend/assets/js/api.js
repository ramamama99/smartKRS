/* ============================================
   SmartKRS — API Helper
   Wrapper untuk fetch ke backend
   ============================================ */

// Base URL backend 
const API_BASE_URL = 'http://localhost:3000/api';

// ----- Token Management -----
function getToken() {
  return localStorage.getItem('smartkrs_token');
}

function setToken(token) {
  localStorage.setItem('smartkrs_token', token);
}

function removeToken() {
  localStorage.removeItem('smartkrs_token');
}

// ----- Main Fetch Helper -----
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;

  // Default headers
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Auto-attach Bearer token 
  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Parse JSON response
    const data = await response.json();

    // Kalo response gak OK (4xx/5xx), throw error
    if (!response.ok) {
      throw new Error(data.message || `HTTP ${response.status}`);
    }

    return data;
  } catch (error) {
    // Network error (BE mati, dll)
    if (error.message === 'Failed to fetch') {
      throw new Error('Gak bisa connect ke server. Pastikan backend nyala di port 3000.');
    }
    throw error;
  }
}

// ----- Auth Methods -----
const api = {
  // Register mahasiswa baru
  register: (data) => apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  // Login
  login: (data) => apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  // Profile
  getProfile: () => apiRequest('/profile'),

  // Token helpers
  setToken,
  getToken,
  removeToken,
  isLoggedIn: () => !!getToken(),
};
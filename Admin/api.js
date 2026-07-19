/* ============================================================
   api.js — shared API client for the JW Courtship Advisory
   Admin panel. Include this BEFORE any other admin script
   (admin-signin.js, admin-signup.js, admin.js).

   Set window.API_BASE_URL before this script loads if the API
   is not running on http://localhost:5000.
   ============================================================ */

const API_BASE_URL = window.API_BASE_URL || 'http://localhost:5000/api/v1';
const TOKEN_KEY = 'jwca_access_token';
const ADMIN_KEY = 'jwca_admin';

/* ---------- token storage ---------- */

function getAccessToken() {
  return sessionStorage.getItem(TOKEN_KEY);
}

function setAccessToken(token) {
  if (token) sessionStorage.setItem(TOKEN_KEY, token);
  else sessionStorage.removeItem(TOKEN_KEY);
}

function clearAccessToken() {
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(ADMIN_KEY);
}

function getStoredAdmin() {
  const raw = sessionStorage.getItem(ADMIN_KEY);
  return raw ? JSON.parse(raw) : null;
}

function setStoredAdmin(admin) {
  if (admin) sessionStorage.setItem(ADMIN_KEY, JSON.stringify(admin));
  else sessionStorage.removeItem(ADMIN_KEY);
}

/* ---------- core request handling ---------- */

async function refreshAccessToken() {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include', // sends the httpOnly refreshToken cookie
    });
    if (!res.ok) {
      clearAccessToken();
      return false;
    }
    const data = await res.json();
    const token = data && data.data && data.data.accessToken;
    if (!token) {
      clearAccessToken();
      return false;
    }
    setAccessToken(token);
    return true;
  } catch (err) {
    clearAccessToken();
    return false;
  }
}

async function apiRequest(path, options = {}, allowRetry = true) {
  const headers = Object.assign(
    { 'Content-Type': 'application/json' },
    options.headers || {}
  );
  const token = getAccessToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  // Silent refresh-and-retry once on 401, except for the auth endpoints
  // themselves (a failed login/refresh should never trigger another refresh).
  const isAuthEndpoint = path.startsWith('/auth/login') || path.startsWith('/auth/refresh');
  if (res.status === 401 && allowRetry && !isAuthEndpoint) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      return apiRequest(path, options, false);
    }
  }

  let data = null;
  try {
    data = await res.json();
  } catch (err) {
    /* no JSON body */
  }

  if (!res.ok) {
    const message = (data && data.message) || `Request failed (${res.status})`;
    const error = new Error(message);
    error.status = res.status;
    error.data = data;
    throw error;
  }

  return data;
}

/* ---------- public API ---------- */

const AdminAPI = {
  // auth
  login(email, password) {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },
  logout() {
    return apiRequest('/auth/logout', { method: 'POST' });
  },
  me() {
    return apiRequest('/auth/me');
  },
  forgotPassword(email) {
    return apiRequest('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  // generic verbs for everything else (profiles, matches, dashboard, etc.)
  get(path) {
    return apiRequest(path);
  },
  post(path, body) {
    return apiRequest(path, { method: 'POST', body: JSON.stringify(body) });
  },
  patch(path, body) {
    return apiRequest(path, { method: 'PATCH', body: JSON.stringify(body) });
  },
  delete(path) {
    return apiRequest(path, { method: 'DELETE' });
  },

  // token/session helpers
  getAccessToken,
  setAccessToken,
  clearAccessToken,
  refreshAccessToken,
  getStoredAdmin,
  setStoredAdmin,
};

/* Redirect helper for pages that require a signed-in admin.
   Call requireAuth() at the top of admin.js. */
function requireAuth() {
  if (!getAccessToken()) {
    window.location.href = 'admin-signin.html';
  }
}
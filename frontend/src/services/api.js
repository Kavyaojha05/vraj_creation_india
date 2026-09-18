// =====================================================
// VRAJ CREATION - API SERVICE
// Axios + Admin + Coupon + Spin + Shipping APIs
// =====================================================

import axios from "axios";

// =====================================================
// API BASE URL
// =====================================================

const api = axios.create({
  baseURL: "https://vraj-creation-india.onrender.com/api",

  headers: {
    "Content-Type": "application/json",
  },
});

// =====================================================
// ADMIN STORAGE KEYS
// =====================================================

export const ADMIN_TOKEN_KEY =
  "vraj_admin_token";

export const ADMIN_DATA_KEY =
  "vraj_admin_data";

// =====================================================
// ADMIN TOKEN HELPERS
// =====================================================

export const getAdminToken = () => {
  return localStorage.getItem(
    ADMIN_TOKEN_KEY
  );
};

export const saveAdminSession = (
  token,
  admin = null
) => {
  if (token) {
    localStorage.setItem(
      ADMIN_TOKEN_KEY,
      token
    );
  }

  if (admin) {
    localStorage.setItem(
      ADMIN_DATA_KEY,
      JSON.stringify(admin)
    );
  }
};

export const clearAdminSession = () => {
  localStorage.removeItem(
    ADMIN_TOKEN_KEY
  );

  localStorage.removeItem(
    ADMIN_DATA_KEY
  );
};

export const getAdminData = () => {
  try {
    const data =
      localStorage.getItem(
        ADMIN_DATA_KEY
      );

    return data
      ? JSON.parse(data)
      : null;
  } catch (error) {
    console.error(
      "Admin data parse error:",
      error
    );

    return null;
  }
};

// =====================================================
// CHECK WHETHER REQUEST NEEDS ADMIN AUTH
// =====================================================

const isProtectedAdminRequest = (
  config
) => {
  const method = String(
    config?.method || "get"
  ).toLowerCase();

  const url =
    config?.url || "";

  // ---------------------------------------------------
  // Admin login is PUBLIC
  // ---------------------------------------------------

  if (
    url.includes(
      "/admin/login"
    )
  ) {
    return false;
  }

  // ---------------------------------------------------
  // Admin verify
  // ---------------------------------------------------

  if (
    url.includes(
      "/admin/verify"
    )
  ) {
    return true;
  }

  // ---------------------------------------------------
  // Admin logout
  // ---------------------------------------------------

  if (
    url.includes(
      "/admin/logout"
    )
  ) {
    return true;
  }

  // ---------------------------------------------------
  // Spin campaign GET is PUBLIC
  // ---------------------------------------------------

  if (
    url === "/campaign/spin" ||
    url.startsWith(
      "/campaign/spin?"
    )
  ) {
    return false;
  }

  // ---------------------------------------------------
  // Spin campaign mutations require admin
  // ---------------------------------------------------

  if (
    url.includes(
      "/campaign/spin/activate"
    ) ||
    url.includes(
      "/campaign/spin/deactivate"
    ) ||
    url.includes(
      "/campaign/spin/update"
    )
  ) {
    return true;
  }

  return false;
};

// =====================================================
// AXIOS REQUEST INTERCEPTOR
// Attach JWT ONLY to protected admin requests
// =====================================================

api.interceptors.request.use(
  (config) => {
    const token =
      getAdminToken();

    if (
      token &&
      isProtectedAdminRequest(
        config
      )
    ) {
      config.headers =
        config.headers || {};

      config.headers.Authorization =
        `Bearer ${token}`;
    }

    return config;
  },

  (error) => {
    return Promise.reject(
      error
    );
  }
);

// =====================================================
// AXIOS RESPONSE INTERCEPTOR
// Handle expired / invalid ADMIN token
// =====================================================

api.interceptors.response.use(
  (response) => {
    return response;
  },

  (error) => {
    const status =
      error?.response?.status;

    const config =
      error?.config;

    const isAdminRequest =
      isProtectedAdminRequest(
        config
      );

    if (
      (status === 401 ||
        status === 403) &&
      isAdminRequest
    ) {
      clearAdminSession();
    }

    return Promise.reject(
      error
    );
  }
);

// =====================================================
// ADMIN AUTH API
// =====================================================

export const adminAuthAPI = {
  // ===================================================
  // ADMIN LOGIN
  // POST /api/admin/login
  // ===================================================

  login: async ({
    username,
    password,
  }) => {
    const response =
      await api.post(
        "/admin/login",
        {
          username,
          password,
        }
      );

    const data =
      response.data;

    if (
      data?.success &&
      data?.token
    ) {
      saveAdminSession(
        data.token,
        data.admin || null
      );
    }

    return data;
  },

  // ===================================================
  // VERIFY ADMIN SESSION
  // GET /api/admin/verify
  // ===================================================

  verify: async () => {
    const response =
      await api.get(
        "/admin/verify"
      );

    return response.data;
  },

  // ===================================================
  // LOGOUT
  // POST /api/admin/logout
  // ===================================================

  logout: async () => {
    try {
      const response =
        await api.post(
          "/admin/logout"
        );

      return response.data;
    } finally {
      clearAdminSession();
    }
  },
};

// =====================================================
// COUPON API
// =====================================================

export const couponAPI = {
  // ===================================================
  // GET ALL COUPONS
  // GET /api/coupons
  // ===================================================

  getAll: async () => {
    const response =
      await api.get(
        "/coupons"
      );

    return response.data;
  },

  // ===================================================
  // GET COUPON BY ID
  // GET /api/coupons/:id
  // ===================================================

  getById: async (
    id
  ) => {
    const response =
      await api.get(
        `/coupons/${id}`
      );

    return response.data;
  },

  // ===================================================
  // GET COUPON BY CODE
  // GET /api/coupons/code/:code
  // ===================================================

  getByCode: async (
    code
  ) => {
    const response =
      await api.get(
        `/coupons/code/${encodeURIComponent(
          code
        )}`
      );

    return response.data;
  },

  // ===================================================
  // CREATE COUPON
  // POST /api/coupons
  // ===================================================

  create: async (
    couponData
  ) => {
    const response =
      await api.post(
        "/coupons",
        couponData
      );

    return response.data;
  },

  // ===================================================
  // UPDATE COUPON
  // PUT /api/coupons/:id
  // ===================================================

  update: async (
    id,
    couponData
  ) => {
    const response =
      await api.put(
        `/coupons/${id}`,
        couponData
      );

    return response.data;
  },

  // ===================================================
  // DELETE COUPON
  // DELETE /api/coupons/:id
  // ===================================================

  delete: async (
    id
  ) => {
    const response =
      await api.delete(
        `/coupons/${id}`
      );

    return response.data;
  },

  // ===================================================
  // VALIDATE COUPON
  // POST /api/coupons/validate
  // ===================================================

  validate: async ({
    code,
    mobile = "",
    category = "",
    orderAmount = 0,
    items = [],
  }) => {
    const response =
      await api.post(
        "/coupons/validate",
        {
          code,
          mobile,
          category,
          orderAmount,
          items,
        }
      );

    return response.data;
  },
};

// =====================================================
// SPIN & WIN API
// =====================================================

export const spinAPI = {
  // ===================================================
  // START SPIN SESSION
  // POST /api/coupons/spin/start
  // PUBLIC
  // ===================================================

  start: async ({
    name,
    mobile,
  }) => {
    const response =
      await api.post(
        "/coupons/spin/start",
        {
          name,
          mobile,
        }
      );

    return response.data;
  },

  // ===================================================
  // SPIN WHEEL
  // POST /api/coupons/spin
  // PUBLIC
  // ===================================================

  spin: async (
    sessionId
  ) => {
    const response =
      await api.post(
        "/coupons/spin",
        {
          sessionId,
        }
      );

    return response.data;
  },
};

// =====================================================
// SPIN CAMPAIGN API
// =====================================================

export const spinCampaignAPI = {
  // ===================================================
  // GET CURRENT CAMPAIGN
  // GET /api/campaign/spin
  // PUBLIC
  // ===================================================

  get: async () => {
    const response =
      await api.get(
        "/campaign/spin"
      );

    return response.data;
  },

  // ===================================================
  // ACTIVATE CAMPAIGN
  // POST /api/campaign/spin/activate
  // ADMIN ONLY
  // ===================================================

  activate: async (
    campaignData
  ) => {
    const response =
      await api.post(
        "/campaign/spin/activate",
        campaignData
      );

    return response.data;
  },

  // ===================================================
  // DEACTIVATE CAMPAIGN
  // POST /api/campaign/spin/deactivate
  // ADMIN ONLY
  // ===================================================

  deactivate: async () => {
    const response =
      await api.post(
        "/campaign/spin/deactivate"
      );

    return response.data;
  },

  // ===================================================
  // UPDATE CAMPAIGN
  // PUT /api/campaign/spin/update
  // ADMIN ONLY
  // ===================================================

  update: async (
    campaignData
  ) => {
    const response =
      await api.put(
        "/campaign/spin/update",
        campaignData
      );

    return response.data;
  },
};

// =====================================================
// SHIPPING API
// =====================================================

export const shippingAPI = {
  // ===================================================
  // CALCULATE SHIPPING
  // POST /api/shipping/calculate
  // PUBLIC
  // ===================================================

  calculate: async ({
    pincode,
    subtotal = 0,
    items = [],
  }) => {
    const response =
      await api.post(
        "/shipping/calculate",
        {
          pincode,
          subtotal,
          items,
        }
      );

    return response.data;
  },
};

// =====================================================
// DEFAULT API
// =====================================================

export default api;
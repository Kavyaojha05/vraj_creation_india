import axios from "axios";

const API_BASE_URL =
  "https://vraj-creation-web-backend.onrender.com/api/coupons";

// =====================================================
// START SPIN SESSION
// =====================================================

export const startSpinSession = async ({
  name,
  mobile,
}) => {
  const response = await axios.post(
    `${API_BASE_URL}/spin/start`,
    {
      name,
      mobile,
    }
  );

  return response.data;
};

// =====================================================
// SPIN COUPON
// =====================================================

export const spinCoupon = async (
  sessionId
) => {
  const response = await axios.post(
    `${API_BASE_URL}/spin`,
    {
      sessionId,
    }
  );

  return response.data;
};

// =====================================================
// VALIDATE COUPON
// =====================================================

export const validateCoupon = async ({
  code,
  mobile,
  category,
  orderAmount,
  items,
}) => {
  const response = await axios.post(
    `${API_BASE_URL}/validate`,
    {
      code,
      mobile,
      category,
      orderAmount,
      items,
    }
  );

  return response.data;
};
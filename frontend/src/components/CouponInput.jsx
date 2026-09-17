import { useState } from "react";
import { couponAPI } from "../services/api";

const CouponInput = ({ onCouponApply, onCouponRemove }) => {
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  // =====================================================
  // APPLY COUPON
  // =====================================================
  const handleApplyCoupon = async () => {
    const code = couponCode.trim().toUpperCase();

    if (!code) {
      setError(true);
      setMessage("Please enter a coupon code.");
      return;
    }

    try {
      setLoading(true);
      setError(false);
      setMessage("");

      // =================================================
      // VALIDATE COUPON FROM BACKEND
      // =================================================
      const response = await couponAPI.validate({
        code,
        orderAmount: 0,
      });

      const data = response?.data;

      if (!data?.success) {
        setError(true);
        setMessage(
          data?.message || "Invalid or inactive coupon code."
        );
        setAppliedCoupon(null);
        return;
      }

      const coupon = data.coupon || data;

      setAppliedCoupon(coupon);

      setError(false);
      setMessage(
        `${coupon.discount}% discount applied successfully!`
      );

      if (onCouponApply) {
        onCouponApply(coupon);
      }
    } catch (err) {
      console.error("Coupon validation error:", err);

      setAppliedCoupon(null);
      setError(true);

      setMessage(
        err?.response?.data?.message ||
          "Unable to validate coupon. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // REMOVE COUPON
  // =====================================================
  const handleRemoveCoupon = () => {
    setCouponCode("");
    setAppliedCoupon(null);
    setMessage("");
    setError(false);

    if (onCouponRemove) {
      onCouponRemove();
    }
  };

  return (
    <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
      {/* =================================================
          TITLE
      ================================================= */}
      <h3 className="mb-1 text-lg font-semibold text-gray-900 dark:text-white">
        Have a Coupon?
      </h3>

      <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
        Enter your coupon code
      </p>

      {/* =================================================
          COUPON INPUT
      ================================================= */}
      {!appliedCoupon ? (
        <>
          <div className="flex gap-2">
            <input
              type="text"
              value={couponCode}
              disabled={loading}
              onChange={(e) => {
                setCouponCode(e.target.value.toUpperCase());
                setMessage("");
                setError(false);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !loading) {
                  handleApplyCoupon();
                }
              }}
              placeholder="Enter coupon code"
              className="min-w-0 flex-1 rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-sm uppercase outline-none transition focus:border-[#8f3424] disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />

            <button
              type="button"
              onClick={handleApplyCoupon}
              disabled={loading}
              className="rounded-xl bg-[#8f3424] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#73291d] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Checking..." : "Apply"}
            </button>
          </div>

          {/* =================================================
              MESSAGE
          ================================================= */}
          {message && (
            <p
              className={`mt-3 text-sm font-medium ${
                error
                  ? "text-red-500"
                  : "text-green-600 dark:text-green-400"
              }`}
            >
              {message}
            </p>
          )}
        </>
      ) : (
        /* =================================================
           APPLIED COUPON
        ================================================= */
        <div className="rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950/30">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-green-700 dark:text-green-400">
                ✓ Coupon Applied
              </p>

              <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                Code:{" "}
                <span className="font-bold">
                  {appliedCoupon.code}
                </span>
              </p>

              <p className="text-sm text-gray-600 dark:text-gray-400">
                You get {appliedCoupon.discount}% discount
              </p>

              {Number(appliedCoupon.minOrderAmount) > 0 && (
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Minimum order: ₹
                  {Number(
                    appliedCoupon.minOrderAmount
                  ).toLocaleString("en-IN")}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={handleRemoveCoupon}
              className="text-sm font-semibold text-red-500 hover:text-red-600"
            >
              Remove
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CouponInput;
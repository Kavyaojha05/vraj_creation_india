
import { useState } from "react";
import { FiCheck, FiCopy, FiTag, FiX } from "react-icons/fi";
import coupons from "../data/coupons";

const FloatingCoupon = () => {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [applied, setApplied] = useState(null);
  const [copied, setCopied] = useState(false);

  const activeCoupons = coupons.filter((coupon) => coupon.active);

  const applyCoupon = () => {
    const enteredCode = code.trim().toUpperCase();

    const coupon = activeCoupons.find(
      (item) => item.code.toUpperCase() === enteredCode
    );

    if (!coupon) {
      setApplied({
        success: false,
        message: "Invalid coupon code",
      });
      return;
    }

    setApplied({
      success: true,
      message: `${coupon.code} applied — ${coupon.discount}% OFF`,
      coupon,
    });
  };

  const copyCoupon = async (couponCode) => {
    try {
      await navigator.clipboard.writeText(couponCode);

      setCode(couponCode);
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch (error) {
      console.error("Copy failed:", error);
    }
  };

  const closePopup = () => {
    setOpen(false);
    setApplied(null);
    setCopied(false);
  };

  return (
    <>
      {/* =========================================
          FLOATING COUPON BUTTON
      ========================================= */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="
          fixed
          bottom-6
          right-5
          z-[90]
          group
          flex
          items-center
          gap-2
          rounded-full
          border
          border-[#d39a38]
          bg-[#8f3424]
          px-4
          py-3
          text-sm
          font-semibold
          text-white
          shadow-[0_10px_35px_rgba(0,0,0,0.25)]
          transition-all
          duration-300
          hover:-translate-y-1
          hover:bg-[#74291d]
          hover:shadow-[0_15px_40px_rgba(143,52,36,0.35)]
          dark:bg-[#8f3424]
        "
        aria-label="View offers"
      >
        <span
          className="
            absolute
            -right-1
            -top-1
            h-3
            w-3
            rounded-full
            bg-[#d39a38]
            ring-2
            ring-white
            dark:ring-gray-950
            animate-pulse
          "
        />

        <FiTag
          size={18}
          className="transition-transform duration-300 group-hover:rotate-12"
        />

        <span>Offers</span>
      </button>

      {/* =========================================
          OVERLAY
      ========================================= */}
      {open && (
        <div
          className="
            fixed
            inset-0
            z-[200]
            flex
            items-center
            justify-center
            bg-black/60
            px-4
            backdrop-blur-sm
          "
          onClick={closePopup}
        >
          {/* =====================================
              MODAL
          ===================================== */}
          <div
            className="
              relative
              w-full
              max-w-md
              overflow-hidden
              rounded-3xl
              border
              border-[#d39a38]/30
              bg-white
              shadow-2xl
              dark:bg-gray-900
            "
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top decoration */}
            <div className="h-2 bg-gradient-to-r from-[#8f3424] via-[#d39a38] to-[#8f3424]" />

            {/* Close */}
            <button
              type="button"
              onClick={closePopup}
              className="
                absolute
                right-4
                top-5
                rounded-full
                p-2
                text-gray-500
                transition
                hover:bg-gray-100
                hover:text-gray-900
                dark:hover:bg-gray-800
                dark:hover:text-white
              "
              aria-label="Close"
            >
              <FiX size={20} />
            </button>

            <div className="p-6 sm:p-7">
              {/* =================================
                  HEADER
              ================================= */}
              <div className="pr-8">
                <div
                  className="
                    mb-4
                    flex
                    h-14
                    w-14
                    items-center
                    justify-center
                    rounded-2xl
                    bg-[#8f3424]/10
                    text-[#8f3424]
                    dark:bg-[#d39a38]/10
                    dark:text-[#d39a38]
                  "
                >
                  <FiTag size={26} />
                </div>

                <p
                  className="
                    mb-1
                    text-xs
                    font-bold
                    uppercase
                    tracking-[0.2em]
                    text-[#d39a38]
                  "
                >
                  Exclusive Offers
                </p>

                <h2
                  className="
                    text-2xl
                    font-bold
                    text-gray-900
                    dark:text-white
                  "
                >
                  Get a Special Discount
                </h2>

                <p
                  className="
                    mt-2
                    text-sm
                    leading-6
                    text-gray-600
                    dark:text-gray-400
                  "
                >
                  Use one of our available coupon codes when you enquire
                  about Vraj Creation products.
                </p>
              </div>

              {/* =================================
                  COUPON LIST
              ================================= */}
              <div className="mt-6 space-y-3">
                {activeCoupons.map((coupon) => (
                  <div
                    key={coupon.code}
                    className="
                      flex
                      items-center
                      justify-between
                      gap-3
                      rounded-2xl
                      border
                      border-gray-200
                      bg-gray-50
                      p-4
                      dark:border-gray-700
                      dark:bg-gray-800/70
                    "
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className="
                            rounded-lg
                            border
                            border-dashed
                            border-[#d39a38]
                            bg-[#d39a38]/10
                            px-3
                            py-1
                            font-mono
                            text-sm
                            font-bold
                            tracking-wider
                            text-[#8f3424]
                            dark:text-[#d39a38]
                          "
                        >
                          {coupon.code}
                        </span>

                        <span className="text-sm font-bold text-[#8f3424] dark:text-[#d39a38]">
                          {coupon.discount}% OFF
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => copyCoupon(coupon.code)}
                      className="
                        flex
                        shrink-0
                        items-center
                        gap-1.5
                        rounded-xl
                        bg-[#8f3424]
                        px-3
                        py-2
                        text-xs
                        font-semibold
                        text-white
                        transition
                        hover:bg-[#74291d]
                      "
                    >
                      {copied && code === coupon.code ? (
                        <>
                          <FiCheck size={14} />
                          Copied
                        </>
                      ) : (
                        <>
                          <FiCopy size={14} />
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>

              {/* =================================
                  INPUT
              ================================= */}
              <div className="mt-6">
                <label
                  htmlFor="coupon-code"
                  className="
                    mb-2
                    block
                    text-sm
                    font-semibold
                    text-gray-800
                    dark:text-gray-200
                  "
                >
                  Enter Coupon Code
                </label>

                <div className="flex gap-2">
                  <input
                    id="coupon-code"
                    type="text"
                    value={code}
                    onChange={(e) => {
                      setCode(e.target.value.toUpperCase());
                      setApplied(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        applyCoupon();
                      }
                    }}
                    placeholder="e.g. VRAJ10"
                    className="
                      min-w-0
                      flex-1
                      rounded-xl
                      border
                      border-gray-300
                      bg-white
                      px-4
                      py-3
                      text-sm
                      font-semibold
                      uppercase
                      outline-none
                      transition
                      focus:border-[#d39a38]
                      focus:ring-2
                      focus:ring-[#d39a38]/20
                      dark:border-gray-700
                      dark:bg-gray-800
                      dark:text-white
                    "
                  />

                  <button
                    type="button"
                    onClick={applyCoupon}
                    className="
                      rounded-xl
                      bg-[#8f3424]
                      px-5
                      py-3
                      text-sm
                      font-bold
                      text-white
                      transition
                      hover:bg-[#74291d]
                    "
                  >
                    Apply
                  </button>
                </div>
              </div>

              {/* =================================
                  RESULT
              ================================= */}
              {applied && (
                <div
                  className={`
                    mt-4
                    rounded-xl
                    border
                    px-4
                    py-3
                    text-sm
                    font-semibold
                    ${
                      applied.success
                        ? "border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-400"
                        : "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400"
                    }
                  `}
                >
                  <div className="flex items-center gap-2">
                    {applied.success && <FiCheck size={18} />}
                    <span>{applied.message}</span>
                  </div>
                </div>
              )}

              {/* =================================
                  FOOTER NOTE
              ================================= */}
              <div
                className="
                  mt-6
                  rounded-2xl
                  bg-[#8f3424]/5
                  p-4
                  dark:bg-[#d39a38]/5
                "
              >
                <p className="text-xs leading-5 text-gray-600 dark:text-gray-400">
                  💡 Mention your coupon code when contacting Vraj Creation
                  on WhatsApp or Instagram to claim your offer.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingCoupon;
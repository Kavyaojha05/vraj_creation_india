import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

// =====================================================
// DISCOUNT CONTEXT
// =====================================================

const DiscountContext = createContext(null);

const STORAGE_KEY = "vraj_spin_discount";

// =====================================================
// NUMBER HELPER
// =====================================================

const toNumberOrNull = (value) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : null;
};

// =====================================================
// NORMALIZE DISCOUNT
// =====================================================

const normalizeDiscount = (data = {}) => {
  const discount = Number(
    data.discount ??
      data.wheelValue ??
      0
  );

  const couponCode =
    String(
      data.couponCode ??
        data.code ??
        data.rewardCode ??
        ""
    ).trim();

  const normalized = {
    // Percentage
    discount: Number.isFinite(discount)
      ? discount
      : 0,

    // Coupon
    couponCode,

    // Scope
    discountScope:
      data.discountScope === "category"
        ? "category"
        : "all",

    category:
      data.category || null,

    // Rules
    minOrderAmount:
      toNumberOrNull(
        data.minOrderAmount
      ) ?? 0,

    maxDiscount:
      toNumberOrNull(
        data.maxDiscount
      ),

    // These are informational / optional.
    // Checkout recalculates discount using
    // the CURRENT cart subtotal.
    eligibleSubtotal:
      toNumberOrNull(
        data.eligibleSubtotal
      ),

    cartSubtotal:
      toNumberOrNull(
        data.cartSubtotal
      ),

    discountAmount:
      toNumberOrNull(
        data.discountAmount
      ),

    finalAmount:
      toNumberOrNull(
        data.finalAmount
      ),

    // Dates
    expiryDate:
      data.expiryDate ||
      data.expiresAt ||
      data.campaignExpiresAt ||
      null,

    campaignExpiresAt:
      data.campaignExpiresAt ||
      null,

    sessionExpiresAt:
      data.sessionExpiresAt ||
      null,

    // Source
    source:
      data.source ||
      "Spin & Win",

    type:
      data.type ||
      "percentage",

    wheelValue:
      toNumberOrNull(
        data.wheelValue
      ) ?? discount,

    claimId:
      data.claimId ||
      null,

    // Optional UI information
    message:
      data.message ||
      data.description ||
      "",

    description:
      data.description ||
      "",
  };

  return normalized;
};

// =====================================================
// PROVIDER
// =====================================================

export const DiscountProvider = ({
  children,
}) => {
  const [discountData, setDiscountData] =
    useState(null);

  // ===================================================
  // LOAD SAVED DISCOUNT
  // ===================================================

  useEffect(() => {
    try {
      const saved =
        localStorage.getItem(
          STORAGE_KEY
        );

      if (!saved) {
        return;
      }

      const parsed =
        JSON.parse(saved);

      if (!parsed) {
        localStorage.removeItem(
          STORAGE_KEY
        );
        return;
      }

      const normalized =
        normalizeDiscount(parsed);

      // -----------------------------------------------
      // Coupon code required
      // -----------------------------------------------

      if (!normalized.couponCode) {
        console.warn(
          "Saved Spin & Win discount has no coupon code."
        );

        localStorage.removeItem(
          STORAGE_KEY
        );

        return;
      }

      // -----------------------------------------------
      // Discount required
      // -----------------------------------------------

      if (
        !Number.isFinite(
          normalized.discount
        ) ||
        normalized.discount <= 0
      ) {
        localStorage.removeItem(
          STORAGE_KEY
        );

        return;
      }

      // -----------------------------------------------
      // Allowed Spin & Win rewards
      // -----------------------------------------------

      const allowedRewards = [
        3,
        5,
        7,
        10,
      ];

      if (
        !allowedRewards.includes(
          normalized.discount
        )
      ) {
        console.warn(
          "Invalid Spin & Win reward:",
          normalized.discount
        );

        localStorage.removeItem(
          STORAGE_KEY
        );

        return;
      }

      // -----------------------------------------------
      // Expiry check
      // -----------------------------------------------

      if (
        normalized.expiryDate
      ) {
        const expiryTime =
          new Date(
            normalized.expiryDate
          ).getTime();

        if (
          Number.isFinite(
            expiryTime
          ) &&
          Date.now() >= expiryTime
        ) {
          console.log(
            "Saved Spin & Win coupon expired."
          );

          localStorage.removeItem(
            STORAGE_KEY
          );

          return;
        }
      }

      setDiscountData(
        normalized
      );

      console.log(
        "SPIN DISCOUNT RESTORED:",
        normalized
      );
    } catch (error) {
      console.error(
        "Unable to restore Spin & Win discount:",
        error
      );

      localStorage.removeItem(
        STORAGE_KEY
      );
    }
  }, []);

  // ===================================================
  // SAVE DISCOUNT
  // ===================================================

  const saveDiscount = (data) => {
    try {
      if (!data) {
        return {
          success: false,
          message:
            "Discount data is missing.",
        };
      }

      const normalized =
        normalizeDiscount(data);

      // -----------------------------------------------
      // Coupon code
      // -----------------------------------------------

      if (
        !normalized.couponCode
      ) {
        return {
          success: false,
          message:
            "Coupon code was not received.",
        };
      }

      // -----------------------------------------------
      // Discount percentage
      // -----------------------------------------------

      if (
        !Number.isFinite(
          normalized.discount
        ) ||
        normalized.discount <= 0
      ) {
        return {
          success: false,
          message:
            "Invalid discount percentage.",
        };
      }

      // -----------------------------------------------
      // Only allowed Spin & Win rewards
      // -----------------------------------------------

      const allowedRewards = [
        3,
        5,
        7,
        10,
      ];

      if (
        !allowedRewards.includes(
          normalized.discount
        )
      ) {
        return {
          success: false,
          message:
            "Invalid Spin & Win reward.",
        };
      }

      // -----------------------------------------------
      // Expiry
      // -----------------------------------------------

      if (
        normalized.expiryDate
      ) {
        const expiryTime =
          new Date(
            normalized.expiryDate
          ).getTime();

        if (
          Number.isFinite(
            expiryTime
          ) &&
          Date.now() >= expiryTime
        ) {
          return {
            success: false,
            message:
              "This Spin & Win coupon has expired.",
          };
        }
      }

      // -----------------------------------------------
      // Save
      // -----------------------------------------------

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(
          normalized
        )
      );

      setDiscountData(
        normalized
      );

      console.log(
        "SPIN DISCOUNT SAVED:",
        normalized
      );

      return {
        success: true,
        data: normalized,
      };
    } catch (error) {
      console.error(
        "Unable to save discount:",
        error
      );

      return {
        success: false,
        message:
          "Unable to save coupon information.",
      };
    }
  };

  // ===================================================
  // CLEAR DISCOUNT
  // ===================================================

  const clearDiscount = () => {
    try {
      localStorage.removeItem(
        STORAGE_KEY
      );
    } catch (error) {
      console.error(
        "Unable to clear discount storage:",
        error
      );
    }

    setDiscountData(null);
  };

  // ===================================================
  // EXPIRY
  // ===================================================

  const isDiscountExpired = () => {
    if (
      !discountData?.expiryDate
    ) {
      return false;
    }

    const expiryTime =
      new Date(
        discountData.expiryDate
      ).getTime();

    if (
      !Number.isFinite(
        expiryTime
      )
    ) {
      return false;
    }

    return (
      Date.now() >= expiryTime
    );
  };

  // ===================================================
  // PRODUCT ELIGIBILITY
  // ===================================================

  const isProductEligible = (
    product
  ) => {
    if (!discountData) {
      return false;
    }

    if (
      isDiscountExpired()
    ) {
      return false;
    }

    // -----------------------------------------------
    // All products
    // -----------------------------------------------

    if (
      discountData.discountScope ===
      "all"
    ) {
      return true;
    }

    // -----------------------------------------------
    // Category only
    // -----------------------------------------------

    if (
      discountData.discountScope ===
      "category"
    ) {
      const productCategory =
        String(
          product?.category ||
            product?.product?.category ||
            ""
        )
          .trim()
          .toLowerCase();

      const couponCategory =
        String(
          discountData.category ||
            ""
        )
          .trim()
          .toLowerCase();

      return (
        productCategory !== "" &&
        couponCategory !== "" &&
        productCategory ===
          couponCategory
      );
    }

    return false;
  };

  // ===================================================
  // PRODUCT DISCOUNT
  // ===================================================

  const getProductDiscount = (
    product
  ) => {
    if (
      !isProductEligible(product)
    ) {
      return 0;
    }

    return Number(
      discountData?.discount || 0
    );
  };

  // ===================================================
  // DISCOUNT PERCENTAGE
  // ===================================================

  const getDiscountPercentage = () => {
    if (
      !discountData ||
      isDiscountExpired()
    ) {
      return 0;
    }

    return Number(
      discountData.discount || 0
    );
  };

  // ===================================================
  // COUPON CODE
  // ===================================================

  const getCouponCode = () => {
    if (
      !discountData ||
      isDiscountExpired()
    ) {
      return "";
    }

    return (
      discountData.couponCode ||
      ""
    );
  };

  // ===================================================
  // SCOPE
  // ===================================================

  const getDiscountScope = () => {
    return (
      discountData?.discountScope ||
      "all"
    );
  };

  // ===================================================
  // CATEGORY
  // ===================================================

  const getDiscountCategory = () => {
    return (
      discountData?.category ||
      null
    );
  };

  // ===================================================
  // CONTEXT
  // ===================================================

  return (
    <DiscountContext.Provider
      value={{
        discountData,

        saveDiscount,

        clearDiscount,

        isDiscountExpired,

        isProductEligible,

        getProductDiscount,

        getDiscountPercentage,

        getCouponCode,

        getDiscountScope,

        getDiscountCategory,
      }}
    >
      {children}
    </DiscountContext.Provider>
  );
};

// =====================================================
// HOOK
// =====================================================

export const useDiscount = () => {
  const context =
    useContext(
      DiscountContext
    );

  if (!context) {
    throw new Error(
      "useDiscount must be used inside DiscountProvider"
    );
  }

  return context;
};
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiCheck,
  FiChevronRight,
  FiCreditCard,
  FiGift,
  FiLoader,
  FiLock,
  FiMapPin,
  FiMail,
  FiPackage,
  FiPhone,
  FiShield,
  FiShoppingBag,
  FiTruck,
  FiUser,
  FiX,
} from "react-icons/fi";
import { QRCodeCanvas } from "qrcode.react";

import { useCart } from "../context/CartContext";
import { useDiscount } from "../context/DiscountContext";

// =====================================================
// VRAJ CREATION - CHECKOUT
// GST EXTRA / TAX-EXCLUSIVE PRICING
// =====================================================

const VRAJ_API = "https://vraj-creation-india.onrender.com/api";

const VRAJ_UPI_ID = "8824968974@ybl";
const VRAJ_UPI_NAME = "Vraj Creation";

const BUSINESS_STATE = "Rajasthan";

const GST_RATE = 5;
const CGST_RATE = 2.5;
const SGST_RATE = 2.5;

const FREE_SHIPPING_THRESHOLD = 999;

// =====================================================
// INDIAN STATES
// =====================================================

const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
];

// =====================================================
// STATE CODES
// =====================================================

const STATE_CODES = {
  "Jammu and Kashmir": "01",
  "Himachal Pradesh": "02",
  Punjab: "03",
  Chandigarh: "04",
  Uttarakhand: "05",
  Haryana: "06",
  Delhi: "07",
  Rajasthan: "08",
  "Uttar Pradesh": "09",
  Bihar: "10",
  Sikkim: "11",
  "Arunachal Pradesh": "12",
  Nagaland: "13",
  Manipur: "14",
  Mizoram: "15",
  Tripura: "16",
  Meghalaya: "17",
  Assam: "18",
  "West Bengal": "19",
  Jharkhand: "20",
  Odisha: "21",
  Chhattisgarh: "22",
  "Madhya Pradesh": "23",
  Gujarat: "24",
  "Dadra and Nagar Haveli and Daman and Diu": "26",
  Maharashtra: "27",
  Karnataka: "29",
  Goa: "30",
  Lakshadweep: "31",
  Kerala: "32",
  "Tamil Nadu": "33",
  Puducherry: "34",
  "Andaman and Nicobar Islands": "35",
  Telangana: "36",
  "Andhra Pradesh": "37",
};

// =====================================================
// STATE ALIASES
// =====================================================

const STATE_ALIASES = {
  raj: "Rajasthan",
  rajasthan: "Rajasthan",

  mh: "Maharashtra",
  maharashtra: "Maharashtra",

  mp: "Madhya Pradesh",
  "madhya pradesh": "Madhya Pradesh",

  up: "Uttar Pradesh",
  "uttar pradesh": "Uttar Pradesh",

  dl: "Delhi",
  delhi: "Delhi",
  "new delhi": "Delhi",

  hr: "Haryana",
  haryana: "Haryana",

  pb: "Punjab",
  punjab: "Punjab",

  gj: "Gujarat",
  gujarat: "Gujarat",

  ka: "Karnataka",
  karnataka: "Karnataka",

  tn: "Tamil Nadu",
  "tamil nadu": "Tamil Nadu",

  kl: "Kerala",
  kerala: "Kerala",

  tg: "Telangana",
  ts: "Telangana",
  telangana: "Telangana",

  ap: "Andhra Pradesh",
  "andhra pradesh": "Andhra Pradesh",

  wb: "West Bengal",
  "west bengal": "West Bengal",

  br: "Bihar",
  bihar: "Bihar",

  jh: "Jharkhand",
  jharkhand: "Jharkhand",

  od: "Odisha",
  orissa: "Odisha",
  odisha: "Odisha",

  cg: "Chhattisgarh",
  chhattisgarh: "Chhattisgarh",

  uk: "Uttarakhand",
  uttarakhand: "Uttarakhand",

  hp: "Himachal Pradesh",
  "himachal pradesh": "Himachal Pradesh",

  jk: "Jammu and Kashmir",
  "jammu and kashmir": "Jammu and Kashmir",

  ladakh: "Ladakh",
  goa: "Goa",
  sikkim: "Sikkim",
  assam: "Assam",
  manipur: "Manipur",
  meghalaya: "Meghalaya",
  mizoram: "Mizoram",
  nagaland: "Nagaland",
  tripura: "Tripura",
};

// =====================================================
// HELPERS
// =====================================================

const round2 = (value) =>
  Math.round((Number(value || 0) + Number.EPSILON) * 100) / 100;

const safeNumber = (value, fallback = 0) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

const normalizeMobile = (value) =>
  String(value || "")
    .replace(/\D/g, "")
    .replace(/^91/, "")
    .slice(0, 10);

const normalizeStateName = (value) => {
  const raw = String(value || "")
    .trim()
    .replace(/\s+/g, " ");

  if (!raw) return "";

  const lower = raw.toLowerCase();

  if (STATE_ALIASES[lower]) {
    return STATE_ALIASES[lower];
  }

  const found = INDIAN_STATES.find(
    (state) => state.toLowerCase() === lower
  );

  return found || raw;
};

const getStateCode = (state) => {
  const normalized = normalizeStateName(state);
  return STATE_CODES[normalized] || "";
};

const formatCurrency = (value) =>
  `₹${round2(value).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const isValidEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    String(email || "").trim()
  );

const isValidPincode = (pincode) =>
  /^\d{6}$/.test(String(pincode || ""));

const getProductId = (item) =>
  item?.productId ||
  item?._id ||
  item?.id ||
  item?.product?._id ||
  item?.product?.id ||
  "";

const getProductImage = (item) =>
  item?.image ||
  item?.imageUrl ||
  item?.productImage ||
  item?.product?.image ||
  item?.product?.imageUrl ||
  "";

const getProductName = (item) =>
  item?.name ||
  item?.productName ||
  item?.title ||
  item?.product?.name ||
  "Product";

const getQuantity = (item) =>
  Math.max(
    1,
    safeNumber(
      item?.quantity ??
        item?.qty ??
        item?.count ??
        1,
      1
    )
  );

const getOriginalPrice = (item) => {
  const price =
    item?.originalPrice ??
    item?.mrp ??
    item?.listPrice ??
    item?.regularPrice ??
    item?.price ??
    item?.sellingPrice ??
    item?.salePrice ??
    0;

  return Math.max(0, round2(safeNumber(price)));
};

const getPrice = (item) => {
  const original = getOriginalPrice(item);

  let selling =
    item?.sellingPrice ??
    item?.salePrice ??
    item?.discountedPrice ??
    item?.currentPrice ??
    item?.price ??
    original;

  selling = Math.max(
    0,
    round2(safeNumber(selling, original))
  );

  const discountPercent = safeNumber(
    item?.discountPercent ??
      item?.discountPercentage ??
      item?.discount ??
      0
  );

  if (
    selling === original &&
    discountPercent > 0 &&
    discountPercent < 100
  ) {
    selling = round2(
      original - (original * discountPercent) / 100
    );
  }

  return Math.min(selling, original);
};

const getDiscountPercent = (item) => {
  const original = getOriginalPrice(item);
  const selling = getPrice(item);

  if (original <= 0) return 0;

  return round2(
    ((original - selling) / original) * 100
  );
};

const getCategory = (item) =>
  item?.category ||
  item?.productCategory ||
  item?.product?.category ||
  "";

const getSubcategory = (item) =>
  item?.subcategory ||
  item?.subCategory ||
  item?.product?.subcategory ||
  "";

const getDescription = (item) =>
  item?.description ||
  item?.product?.description ||
  "";

const getSize = (item) =>
  item?.size ||
  item?.dimensions ||
  item?.product?.size ||
  item?.product?.dimensions ||
  "";

const getWeight = (item) =>
  Math.max(
    0,
    safeNumber(
      item?.weightGrams ??
        item?.weight ??
        item?.product?.weightGrams ??
        item?.product?.weight ??
        0
    )
  );

// =====================================================
// GST
// =====================================================

const calculateGST = (
  totalAmountBeforeTax,
  customerState
) => {
  const baseAmount = round2(
    Math.max(0, safeNumber(totalAmountBeforeTax))
  );

  const normalizedCustomerState =
    normalizeStateName(customerState);

  const normalizedBusinessState =
    normalizeStateName(BUSINESS_STATE);

  const isInterState = Boolean(
    normalizedCustomerState &&
      normalizedBusinessState &&
      normalizedCustomerState !== normalizedBusinessState
  );

  const totalGST = round2(
    (baseAmount * GST_RATE) / 100
  );

  let cgst = 0;
  let sgst = 0;
  let igst = 0;

  if (isInterState) {
    igst = totalGST;
  } else {
    cgst = round2(
      (baseAmount * CGST_RATE) / 100
    );

    sgst = round2(totalGST - cgst);
  }

  const finalAmount = round2(
    baseAmount + totalGST
  );

  return {
    totalAmountBeforeTax: baseAmount,
    taxableAmount: baseAmount,
    taxableValue: baseAmount,

    totalGST,

    cgst,
    sgst,
    igst,

    cgstRate: isInterState ? 0 : CGST_RATE,
    sgstRate: isInterState ? 0 : SGST_RATE,
    igstRate: isInterState ? GST_RATE : 0,

    rate: GST_RATE,

    isInterState,

    sellerState: normalizedBusinessState,
    sellerStateCode: getStateCode(normalizedBusinessState),

    customerState: normalizedCustomerState,
    customerStateCode: getStateCode(normalizedCustomerState),

    pricingMode: "gst_exclusive",

    amountWithGST: finalAmount,
    finalAmount,
  };
};

// =====================================================
// COMPONENT
// =====================================================

export default function CheckoutPage() {
  const navigate = useNavigate();

  const cartContext = useCart();
  const discountContext = useDiscount();

  const cartItems =
    cartContext?.cartItems ||
    cartContext?.cart ||
    cartContext?.items ||
    [];

  const clearCart =
    cartContext?.clearCart ||
    cartContext?.clearCartItems ||
    (() => {});

  const appliedDiscountFromContext =
    discountContext?.appliedCoupon ||
    discountContext?.coupon ||
    discountContext?.discount ||
    null;

  // ===================================================
  // FORM
  // ===================================================

  const [form, setForm] = useState({
    fullName: "",
    mobile: "",
    email: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [pincodeError, setPincodeError] = useState("");
  const [pincodeData, setPincodeData] = useState(null);

  // ===================================================
  // PAYMENT
  // ===================================================

  const [paymentMode, setPaymentMode] = useState("cod");
  const [paymentMethod, setPaymentMethod] = useState("upi_id");

  // ===================================================
  // ORDER
  // ===================================================

  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderError, setOrderError] = useState("");

  // ===================================================
  // COUPON
  // ===================================================

  const [appliedCoupon, setAppliedCoupon] = useState(
    appliedDiscountFromContext
  );

  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState("");
  const [couponError, setCouponError] = useState("");

  // ===================================================
  // SHIPPING
  // ===================================================

  const [shippingCharge, setShippingCharge] = useState(0);
  const [shippingData, setShippingData] = useState(null);
  const [shippingLoading, setShippingLoading] = useState(false);
  const [shippingError, setShippingError] = useState("");

  // ===================================================
  // ERRORS
  // ===================================================

  const [errors, setErrors] = useState({});

  // ===================================================
  // SYNC COUPON
  // ===================================================

  useEffect(() => {
    if (appliedDiscountFromContext) {
      setAppliedCoupon(appliedDiscountFromContext);
    }
  }, [appliedDiscountFromContext]);

  // ===================================================
  // FORM CHANGE
  // ===================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    let nextValue = value;

    if (name === "mobile") {
      nextValue = normalizeMobile(value);
    }

    if (name === "pincode") {
      nextValue = String(value || "")
        .replace(/\D/g, "")
        .slice(0, 6);

      setPincodeError("");

      if (nextValue.length !== 6) {
        setPincodeData(null);
      }
    }

    setForm((prev) => ({
      ...prev,
      [name]: nextValue,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));

    setOrderError("");
  };

  // ===================================================
  // PINCODE LOOKUP
  // ===================================================

  useEffect(() => {
    let cancelled = false;

    const lookupPincode = async () => {
      if (!isValidPincode(form.pincode)) {
        return;
      }

      setPincodeLoading(true);
      setPincodeError("");

      try {
        const response = await fetch(
          `https://api.postalpincode.in/pincode/${form.pincode}`
        );

        if (!response.ok) {
          throw new Error("Pincode service unavailable");
        }

        const data = await response.json();

        if (cancelled) return;

        const result = data?.[0];

        if (
          result?.Status !== "Success" ||
          !Array.isArray(result?.PostOffice) ||
          !result.PostOffice.length
        ) {
          throw new Error("Invalid pincode");
        }

        const postOffice = result.PostOffice[0];

        const state = normalizeStateName(
          postOffice?.State
        );

        const district = postOffice?.District || "";
        const division = postOffice?.Division || "";
        const region = postOffice?.Region || "";
        const name = postOffice?.Name || "";

        setPincodeData({
          state,
          district,
          division,
          region,
          postOffice: name,
        });

        setForm((prev) => ({
          ...prev,

          city: prev.city || district,

          state: prev.state || state,
        }));

        setErrors((prev) => ({
          ...prev,
          pincode: "",
        }));
      } catch (error) {
        if (cancelled) return;

        setPincodeData(null);

        setPincodeError(
          "Pincode verify nahi ho saka. Please check the pincode."
        );
      } finally {
        if (!cancelled) {
          setPincodeLoading(false);
        }
      }
    };

    const timer = setTimeout(lookupPincode, 400);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [form.pincode]);

  // ===================================================
  // PRODUCT TOTALS
  // ===================================================

  const productTotal = useMemo(() => {
    return round2(
      cartItems.reduce((sum, item) => {
        const qty = getQuantity(item);
        const originalPrice = getOriginalPrice(item);

        return sum + originalPrice * qty;
      }, 0)
    );
  }, [cartItems]);

  const sellingSubtotal = useMemo(() => {
    return round2(
      cartItems.reduce((sum, item) => {
        const qty = getQuantity(item);
        const sellingPrice = getPrice(item);

        return sum + sellingPrice * qty;
      }, 0)
    );
  }, [cartItems]);

  const productDiscount = useMemo(() => {
    return round2(
      Math.max(
        0,
        productTotal - sellingSubtotal
      )
    );
  }, [productTotal, sellingSubtotal]);

  const totalItems = useMemo(() => {
    return cartItems.reduce(
      (sum, item) => sum + getQuantity(item),
      0
    );
  }, [cartItems]);

  const totalWeight = useMemo(() => {
    return round2(
      cartItems.reduce(
        (sum, item) =>
          sum +
          getWeight(item) *
            getQuantity(item),
        0
      )
    );
  }, [cartItems]);

  // ===================================================
  // ORDER ITEMS
  // ===================================================

  const orderItems = useMemo(() => {
    return cartItems.map((item) => {
      const quantity = getQuantity(item);

      const originalPrice =
        getOriginalPrice(item);

      const sellingPrice =
        getPrice(item);

      const originalSubtotal =
        round2(originalPrice * quantity);

      const sellingSubtotalItem =
        round2(sellingPrice * quantity);

      const discountAmount =
        round2(
          Math.max(
            0,
            originalSubtotal -
              sellingSubtotalItem
          )
        );

      return {
        productId: getProductId(item),

        sku:
          item?.sku ||
          item?.SKU ||
          item?.productSku ||
          item?.product?.sku ||
          "",

        name: getProductName(item),

        category: getCategory(item),

        subcategory: getSubcategory(item),

        image: getProductImage(item),

        description: getDescription(item),

        size: getSize(item),

        quantity,

        originalPrice,

        mrp: originalPrice,

        price: sellingPrice,

        sellingPrice,

        discountPercent:
          getDiscountPercent(item),

        discountAmount,

        subtotal: originalSubtotal,

        sellingSubtotal: sellingSubtotalItem,

        taxablePrice: sellingPrice,

        weightGrams: getWeight(item),
      };
    });
  }, [cartItems]);

  // ===================================================
  // COUPON CALCULATION
  // ===================================================

  const calculatedCouponDiscount = useMemo(() => {
    if (!appliedCoupon) {
      return 0;
    }

    const discountPercent = safeNumber(
      appliedCoupon.discount ??
        appliedCoupon.discountPercent ??
        appliedCoupon.percentage ??
        0
    );

    if (discountPercent <= 0) {
      return 0;
    }

    const minOrderAmount = safeNumber(
      appliedCoupon.minOrderAmount ?? 0
    );

    if (sellingSubtotal < minOrderAmount) {
      return 0;
    }

    const scope = String(
      appliedCoupon.discountScope ||
        appliedCoupon.scope ||
        "all"
    ).toLowerCase();

    let eligibleAmount = sellingSubtotal;

    if (
      scope !== "all" &&
      scope !== "order" &&
      scope !== "cart"
    ) {
      eligibleAmount = round2(
        orderItems.reduce((sum, item) => {
          const category = String(
            item.category || ""
          ).toLowerCase();

          const subcategory = String(
            item.subcategory || ""
          ).toLowerCase();

          const target = String(
            appliedCoupon.category ||
              appliedCoupon.subcategory ||
              appliedCoupon.discountScope ||
              ""
          ).toLowerCase();

          if (
            target &&
            (category === target ||
              subcategory === target)
          ) {
            return (
              sum +
              safeNumber(
                item.sellingSubtotal
              )
            );
          }

          return sum;
        }, 0)
      );
    }

    let discountAmount = round2(
      (eligibleAmount * discountPercent) / 100
    );

    const maxDiscount = safeNumber(
      appliedCoupon.maxDiscount ??
        appliedCoupon.maxDiscountAmount ??
        0
    );

    if (maxDiscount > 0) {
      discountAmount = Math.min(
        discountAmount,
        maxDiscount
      );
    }

    discountAmount = Math.min(
      discountAmount,
      sellingSubtotal
    );

    return round2(
      Math.max(0, discountAmount)
    );
  }, [
    appliedCoupon,
    sellingSubtotal,
    orderItems,
  ]);

  useEffect(() => {
    setCouponDiscount(
      calculatedCouponDiscount
    );

    if (
      appliedCoupon &&
      calculatedCouponDiscount > 0
    ) {
      setCouponMessage(
        `${appliedCoupon.code || "Coupon"} applied successfully.`
      );

      setCouponError("");
    }
  }, [
    calculatedCouponDiscount,
    appliedCoupon,
  ]);

  // ===================================================
  // NET PRODUCT
  // ===================================================

  const netProductAmount = useMemo(() => {
    return round2(
      Math.max(
        0,
        sellingSubtotal -
          couponDiscount
      )
    );
  }, [
    sellingSubtotal,
    couponDiscount,
  ]);

  const totalDiscount = useMemo(() => {
    return round2(
      productDiscount +
        couponDiscount
    );
  }, [
    productDiscount,
    couponDiscount,
  ]);

  // ===================================================
  // STATE
  // ===================================================

  const stateName = useMemo(
    () =>
      normalizeStateName(form.state),
    [form.state]
  );

  const stateCode = useMemo(
    () =>
      getStateCode(stateName),
    [stateName]
  );

  const isStateValid = useMemo(() => {
    if (!stateName) {
      return false;
    }

    return INDIAN_STATES.some(
      (state) =>
        state.toLowerCase() ===
        stateName.toLowerCase()
    );
  }, [stateName]);

  // ===================================================
  // SHIPPING
  // ===================================================

  const finalShipping = useMemo(() => {
    const charge =
      shippingData?.charge ??
      shippingData?.shippingCharge ??
      shippingData?.amount ??
      shippingCharge ??
      0;

    return round2(
      Math.max(0, safeNumber(charge))
    );
  }, [
    shippingData,
    shippingCharge,
  ]);

  // ===================================================
  // TOTAL BEFORE TAX
  // ===================================================

  const totalAmountBeforeTax =
    useMemo(() => {
      return round2(
        netProductAmount +
          finalShipping
      );
    }, [
      netProductAmount,
      finalShipping,
    ]);

  // ===================================================
  // GST
  // ===================================================

  const gstData = useMemo(() => {
    return calculateGST(
      totalAmountBeforeTax,
      stateName
    );
  }, [
    totalAmountBeforeTax,
    stateName,
  ]);

  // ===================================================
  // FINAL TOTAL
  // ===================================================

  const finalTotal = useMemo(() => {
    return round2(
      totalAmountBeforeTax +
        gstData.totalGST
    );
  }, [
    totalAmountBeforeTax,
    gstData.totalGST,
  ]);

  // ===================================================
  // CHECKOUT FORM READY
  //
  // IMPORTANT:
  // Values in Order Summary will be shown
  // only after complete form verification.
  // ===================================================

  const isCheckoutReady = useMemo(() => {
    return (
      form.fullName.trim().length > 0 &&
      /^\d{10}$/.test(form.mobile) &&
      isValidEmail(form.email) &&
      form.address.trim().length > 0 &&
      form.city.trim().length > 0 &&
      isStateValid &&
      isValidPincode(form.pincode) &&
      Boolean(pincodeData) &&
      !pincodeLoading &&
      !shippingLoading &&
      Boolean(shippingData)
    );
  }, [
    form.fullName,
    form.mobile,
    form.email,
    form.address,
    form.city,
    form.pincode,
    isStateValid,
    pincodeData,
    pincodeLoading,
    shippingLoading,
    shippingData,
  ]);

  // ===================================================
  // UPI
  // ===================================================

  const upiPaymentUrl = useMemo(() => {
    const amount = finalTotal.toFixed(2);

    const params = new URLSearchParams({
      pa: VRAJ_UPI_ID,
      pn: VRAJ_UPI_NAME,
      am: amount,
      cu: "INR",
    });

    return `upi://pay?${params.toString()}`;
  }, [finalTotal]);

  // ===================================================
  // SHIPPING CALCULATION
  // ===================================================

  const calculateShipping = async () => {
    if (!isValidPincode(form.pincode)) {
      return null;
    }

    setShippingLoading(true);
    setShippingError("");

    try {
      const response = await fetch(
        `${VRAJ_API}/shipping/calculate`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            pincode: form.pincode,

            sellingSubtotal,

            totalWeightGrams:
              totalWeight,

            items: orderItems.map(
              (item) => ({
                productId:
                  item.productId,

                quantity:
                  item.quantity,

                weightGrams:
                  item.weightGrams,

                category:
                  item.category,

                subcategory:
                  item.subcategory,
              })
            ),
          }),
        }
      );

      const data =
        await response.json();

      if (
        !response.ok ||
        data?.success === false
      ) {
        throw new Error(
          data?.message ||
            "Shipping calculation failed"
        );
      }

      const result =
        data?.data ||
        data?.shipping ||
        data;

      const charge = round2(
        Math.max(
          0,
          safeNumber(
            result?.charge ??
              result?.shippingCharge ??
              result?.amount ??
              0
          )
        )
      );

      const normalizedShipping = {
        ...result,

        charge,

        shippingCharge: charge,

        amount: charge,

        isFree:
          Boolean(result?.isFree) ||
          charge === 0,

        weight: safeNumber(
          result?.weight ??
            totalWeight
        ),

        billableWeight:
          safeNumber(
            result?.billableWeight ??
              result?.weight ??
              totalWeight
          ),

        weightCharge:
          safeNumber(
            result?.weightCharge ?? 0
          ),

        zoneCharge:
          safeNumber(
            result?.zoneCharge ?? 0
          ),
      };

      setShippingData(
        normalizedShipping
      );

      setShippingCharge(charge);

      return normalizedShipping;
    } catch (error) {
      console.error(
        "Shipping calculation error:",
        error
      );

      setShippingData(null);
      setShippingCharge(0);

      setShippingError(
        error?.message ||
          "Shipping charge calculate nahi ho saka."
      );

      return null;
    } finally {
      setShippingLoading(false);
    }
  };

  // ===================================================
  // SHIPPING EFFECT
  // ===================================================

  useEffect(() => {
    if (
      !isValidPincode(form.pincode)
    ) {
      setShippingData(null);
      setShippingCharge(0);
      setShippingError("");

      return;
    }

    let cancelled = false;

    const timer = setTimeout(
      async () => {
        if (cancelled) {
          return;
        }

        await calculateShipping();
      },
      700
    );

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    form.pincode,
    sellingSubtotal,
    totalWeight,
  ]);

  // ===================================================
  // VALIDATION
  // ===================================================

  const validateForm = () => {
    const nextErrors = {};

    if (!form.fullName.trim()) {
      nextErrors.fullName =
        "Full name required.";
    }

    if (!/^\d{10}$/.test(form.mobile)) {
      nextErrors.mobile =
        "Valid 10-digit mobile number required.";
    }

    if (!isValidEmail(form.email)) {
      nextErrors.email =
        "Valid email address required.";
    }

    if (!form.address.trim()) {
      nextErrors.address =
        "Address required.";
    }

    if (!form.city.trim()) {
      nextErrors.city =
        "City required.";
    }

    if (!isStateValid) {
      nextErrors.state =
        "Please select a valid state.";
    }

    if (
      !isValidPincode(form.pincode)
    ) {
      nextErrors.pincode =
        "Valid 6-digit pincode required.";
    }

    if (
      isValidPincode(form.pincode) &&
      !pincodeData
    ) {
      nextErrors.pincode =
        "Please wait for pincode verification.";
    }

    setErrors(nextErrors);

    return (
      Object.keys(nextErrors).length === 0
    );
  };

  // ===================================================
  // PLACE ORDER
  // ===================================================

  const placeOrder = async () => {
    if (placingOrder) {
      return;
    }

    setOrderError("");

    if (!cartItems.length) {
      setOrderError(
        "Your cart is empty."
      );

      return;
    }

    if (!validateForm()) {
      setOrderError(
        "Please fill all required details correctly."
      );

      return;
    }

    if (shippingLoading) {
      setOrderError(
        "Please wait while shipping charge is calculated."
      );

      return;
    }

    let currentShipping =
      shippingData;

    if (!currentShipping) {
      currentShipping =
        await calculateShipping();
    }

    if (!currentShipping) {
      setOrderError(
        "Shipping charge calculate nahi ho saka. Please try again."
      );

      return;
    }

    const finalProductTotal =
      round2(productTotal);

    const finalProductDiscount =
      round2(productDiscount);

    const finalSellingSubtotal =
      round2(sellingSubtotal);

    const finalCouponDiscount =
      round2(
        Math.max(
          0,
          Math.min(
            couponDiscount,
            finalSellingSubtotal
          )
        )
      );

    const finalTotalDiscount =
      round2(
        finalProductDiscount +
          finalCouponDiscount
      );

    const finalNetProductAmount =
      round2(
        Math.max(
          0,
          finalSellingSubtotal -
            finalCouponDiscount
        )
      );

    const finalShippingCharge =
      round2(
        Math.max(
          0,
          safeNumber(
            currentShipping?.charge ??
              currentShipping?.shippingCharge ??
              currentShipping?.amount ??
              0
          )
        )
      );

    const finalTotalAmountBeforeTax =
      round2(
        finalNetProductAmount +
          finalShippingCharge
      );

    const finalGST =
      calculateGST(
        finalTotalAmountBeforeTax,
        stateName
      );

    const finalOrderAmount =
      round2(
        finalTotalAmountBeforeTax +
          finalGST.totalGST
      );

    if (finalOrderAmount <= 0) {
      setOrderError(
        "Invalid order amount."
      );

      return;
    }

    setPlacingOrder(true);

    try {
      // =================================================
      // PAYMENT
      // =================================================

      const payment = {
        method: paymentMode,

        type:
          paymentMode === "prepaid"
            ? paymentMethod
            : null,

        upiId:
          paymentMode === "prepaid" &&
          paymentMethod === "upi_id"
            ? VRAJ_UPI_ID
            : null,

        amount: finalOrderAmount,
      };

      // =================================================
      // CUSTOMER
      // =================================================

      const customer = {
        fullName:
          form.fullName.trim(),

        mobile:
          normalizeMobile(
            form.mobile
          ),

        email:
          form.email
            .trim()
            .toLowerCase(),

        address:
          form.address.trim(),

        city:
          form.city.trim(),

        state:
          stateName,

        stateCode,

        pincode:
          form.pincode,

        district:
          pincodeData?.district ||
          "",

        postOffice:
          pincodeData?.postOffice ||
          "",
      };

      // =================================================
      // ORDER PAYLOAD
      // =================================================

      const orderPayload = {
        customer,

        items: orderItems,

        subtotal:
          finalProductTotal,

        sellingSubtotal:
          finalSellingSubtotal,

        productDiscount:
          finalProductDiscount,

        couponDiscount:
          finalCouponDiscount,

        discount:
          finalTotalDiscount,

        discountPercentage:
          finalProductTotal > 0
            ? round2(
                (finalTotalDiscount /
                  finalProductTotal) *
                  100
              )
            : 0,

        couponCode:
          appliedCoupon?.code ||
          couponCode ||
          null,

        coupon:
          appliedCoupon
            ? {
                code:
                  appliedCoupon.code ||
                  null,

                name:
                  appliedCoupon.name ||
                  null,

                discount:
                  safeNumber(
                    appliedCoupon.discount ??
                      appliedCoupon.discountPercent ??
                      0
                  ),

                minOrderAmount:
                  safeNumber(
                    appliedCoupon.minOrderAmount ??
                      0
                  ),

                maxDiscount:
                  safeNumber(
                    appliedCoupon.maxDiscount ??
                      0
                  ),

                source:
                  appliedCoupon.source ||
                  "coupon",
              }
            : null,

        // =================================================
        // GST
        // =================================================

        gst: {
          rate: GST_RATE,

          pricingMode:
            "gst_exclusive",

          totalAmountBeforeTax:
            finalGST.totalAmountBeforeTax,

          taxableAmount:
            finalGST.taxableAmount,

          taxableValue:
            finalGST.taxableValue,

          totalGST:
            finalGST.totalGST,

          cgst:
            finalGST.cgst,

          cgstRate:
            finalGST.cgstRate,

          sgst:
            finalGST.sgst,

          sgstRate:
            finalGST.sgstRate,

          igst:
            finalGST.igst,

          igstRate:
            finalGST.igstRate,

          isInterState:
            finalGST.isInterState,

          sellerState:
            finalGST.sellerState,

          sellerStateCode:
            finalGST.sellerStateCode,

          customerState:
            finalGST.customerState,

          customerStateCode:
            finalGST.customerStateCode,

          baseAmount:
            finalTotalAmountBeforeTax,

          grossAmount:
            finalOrderAmount,

          amountWithGST:
            finalOrderAmount,
        },

        // =================================================
        // SHIPPING
        // =================================================

        shipping: {
          ...currentShipping,

          charge:
            finalShippingCharge,

          shippingCharge:
            finalShippingCharge,

          amount:
            finalShippingCharge,

          isFree:
            finalShippingCharge === 0,
        },

        // =================================================
        // PRICING
        // =================================================

        pricing: {
          subtotal:
            finalProductTotal,

          sellingSubtotal:
            finalSellingSubtotal,

          productDiscount:
            finalProductDiscount,

          eligibleSubtotal:
            finalSellingSubtotal,

          couponDiscount:
            finalCouponDiscount,

          discount:
            finalTotalDiscount,

          discountPercent:
            finalProductTotal > 0
              ? round2(
                  (finalTotalDiscount /
                    finalProductTotal) *
                    100
                )
              : 0,

          couponCode:
            appliedCoupon?.code ||
            couponCode ||
            null,

          shipping:
            finalShippingCharge,

          shippingCharge:
            finalShippingCharge,

          totalAmountBeforeTax:
            finalTotalAmountBeforeTax,

          taxableValue:
            finalTotalAmountBeforeTax,

          gstRate:
            GST_RATE,

          totalGST:
            finalGST.totalGST,

          cgst:
            finalGST.cgst,

          sgst:
            finalGST.sgst,

          igst:
            finalGST.igst,

          cgstRate:
            finalGST.cgstRate,

          sgstRate:
            finalGST.sgstRate,

          igstRate:
            finalGST.igstRate,

          finalTotal:
            finalOrderAmount,

          finalAmount:
            finalOrderAmount,
        },

        finalAmount:
          finalOrderAmount,

        payment,
      };

      // =================================================
      // API
      // =================================================

      const response =
        await fetch(
          `${VRAJ_API}/orders`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify(
              orderPayload
            ),
          }
        );

      let responseData = null;

      try {
        responseData =
          await response.json();
      } catch {
        responseData = null;
      }

      if (
        !response.ok ||
        responseData?.success === false
      ) {
        throw new Error(
          responseData?.message ||
            responseData?.error ||
            "Order place nahi ho saka."
        );
      }

      const createdOrder =
        responseData?.data ||
        responseData?.order ||
        responseData;

      // =================================================
      // STORE ORDER
      // =================================================

      const savedOrder = {
        ...orderPayload,

        ...(createdOrder || {}),

        customer,

        items: orderItems,

        shipping: {
          ...orderPayload.shipping,
          ...(createdOrder?.shipping || {}),
        },

        gst: {
          ...orderPayload.gst,
          ...(createdOrder?.gst || {}),
        },

        pricing: {
          ...orderPayload.pricing,
          ...(createdOrder?.pricing || {}),
        },

        payment: {
          ...payment,
          ...(createdOrder?.payment || {}),
        },

        finalAmount:
          safeNumber(
            createdOrder?.finalAmount,
            finalOrderAmount
          ),
      };

      try {
        sessionStorage.setItem(
          "vraj_order",
          JSON.stringify(savedOrder)
        );
      } catch (storageError) {
        console.warn(
          "sessionStorage save failed:",
          storageError
        );
      }

      try {
        const oldOrders =
          JSON.parse(
            localStorage.getItem(
              "vraj_orders"
            ) || "[]"
          );

        localStorage.setItem(
          "vraj_orders",
          JSON.stringify([
            savedOrder,
            ...oldOrders,
          ])
        );
      } catch (storageError) {
        console.warn(
          "localStorage order save failed:",
          storageError
        );
      }

      // =================================================
      // LAST ORDER NUMBER
      // =================================================

      const orderNumber =
        savedOrder?.orderNumber ||
        savedOrder?.orderId ||
        savedOrder?._id ||
        savedOrder?.id ||
        "";

      if (orderNumber) {
        try {
          sessionStorage.setItem(
            "vraj_last_order_number",
            String(orderNumber)
          );
        } catch {
          // Ignore
        }
      }

      // =================================================
      // CLEAR CART
      // =================================================

      try {
        clearCart();
      } catch (clearError) {
        console.warn(
          "Cart clear failed:",
          clearError
        );

        try {
          localStorage.removeItem(
            "vraj_creation_cart"
          );
        } catch {
          // Ignore
        }
      }

      // =================================================
      // CLEAR DISCOUNT
      // =================================================

      try {
        if (
          typeof discountContext?.clearDiscount ===
          "function"
        ) {
          discountContext.clearDiscount();
        }

        if (
          typeof discountContext?.removeCoupon ===
          "function"
        ) {
          discountContext.removeCoupon();
        }

        if (
          typeof discountContext?.clearCoupon ===
          "function"
        ) {
          discountContext.clearCoupon();
        }
      } catch (discountError) {
        console.warn(
          "Discount clear failed:",
          discountError
        );
      }

      // =================================================
      // SUCCESS
      // =================================================

      navigate(
        "/order-success",
        {
          replace: true,

          state: {
            order: savedOrder,
          },
        }
      );
    } catch (error) {
      console.error(
        "Place order error:",
        error
      );

      setOrderError(
        error?.message ||
          "Order place nahi ho saka. Please try again."
      );
    } finally {
      setPlacingOrder(false);
    }
  };

  // ===================================================
  // EMPTY CART
  // ===================================================

  if (!cartItems.length) {
    return (
      <div className="min-h-screen bg-[#f8f2e8] flex items-center justify-center px-4">
        <div className="w-full max-w-lg rounded-2xl bg-white p-8 text-center shadow-lg border border-[#eadbc6]">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#f4eadb] text-[#8f3424]">
            <FiShoppingBag size={30} />
          </div>

          <h1 className="text-2xl font-bold text-[#4b2e1f]">
            Your cart is empty
          </h1>

          <p className="mt-2 text-gray-600">
            Add some beautiful Vraj Creation
            products before checkout.
          </p>

          <Link
            to="/shop"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#8f3424] px-6 py-3 font-semibold text-white transition hover:bg-[#76291d]"
          >
            Continue Shopping
            <FiChevronRight />
          </Link>
        </div>
      </div>
    );
  }

  // ===================================================
  // UI
  // ===================================================

  return (
    <div className="min-h-screen bg-[#f8f2e8]">
      {/* =================================================
          HEADER
      ================================================= */}

      <header className="border-b border-[#eadbc6] bg-[#fffaf2]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link
            to="/cart"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#6b4633] transition hover:text-[#8f3424]"
          >
            <FiArrowLeft />
            Back to Cart
          </Link>

          <div className="flex items-center gap-2 text-sm font-semibold text-[#6b4633]">
            <FiLock />
            Secure Checkout
          </div>
        </div>
      </header>

      {/* =================================================
          MAIN
      ================================================= */}

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-[#8f3424]">
            Vraj Creation
          </p>

          <h1 className="mt-1 text-3xl font-bold text-[#4b2e1f] sm:text-4xl">
            Checkout
          </h1>

          <p className="mt-2 text-gray-600">
            Complete your details and place your
            order securely.
          </p>
        </div>

        {orderError && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-4 text-red-700">
            <FiX className="mt-0.5 shrink-0" />

            <div>
              <p className="font-semibold">
                Order Error
              </p>

              <p className="mt-1 text-sm">
                {orderError}
              </p>
            </div>
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-[1fr_420px]">
          {/* =================================================
              LEFT - SINGLE CHECKOUT FORM
          ================================================= */}

          <div className="space-y-6">
            <section className="rounded-2xl border border-[#eadbc6] bg-white p-5 shadow-sm sm:p-6">
              {/* =================================================
                  CHECKOUT FORM HEADER
              ================================================= */}

              <div className="mb-7 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f4eadb] text-[#8f3424]">
                  <FiUser size={21} />
                </div>

                <div>
                  <h2 className="text-xl font-bold text-[#4b2e1f]">
                    Checkout Form
                  </h2>

                  <p className="text-sm text-gray-500">
                    Enter your complete delivery
                    and payment details
                  </p>
                </div>
              </div>

              {/* =================================================
                  CUSTOMER DETAILS
              ================================================= */}

              <div>
                <div className="mb-4 flex items-center gap-2">
                  <FiUser className="text-[#8f3424]" />

                  <h3 className="font-bold text-[#4b2e1f]">
                    Customer Details
                  </h3>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  {/* NAME */}

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#4b2e1f]">
                      Full Name *
                    </label>

                    <div className="relative">
                      <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

                      <input
                        type="text"
                        name="fullName"
                        value={form.fullName}
                        onChange={handleChange}
                        placeholder="Enter your full name"
                        className={`w-full rounded-xl border bg-white py-3 pl-10 pr-4 outline-none transition focus:border-[#8f3424] ${
                          errors.fullName
                            ? "border-red-400"
                            : "border-gray-200"
                        }`}
                      />
                    </div>

                    {errors.fullName && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.fullName}
                      </p>
                    )}
                  </div>

                  {/* MOBILE */}

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#4b2e1f]">
                      Mobile Number *
                    </label>

                    <div className="relative">
                      <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

                      <input
                        type="tel"
                        name="mobile"
                        inputMode="numeric"
                        maxLength={10}
                        value={form.mobile}
                        onChange={handleChange}
                        placeholder="10-digit mobile number"
                        className={`w-full rounded-xl border bg-white py-3 pl-10 pr-4 outline-none transition focus:border-[#8f3424] ${
                          errors.mobile
                            ? "border-red-400"
                            : "border-gray-200"
                        }`}
                      />
                    </div>

                    {errors.mobile && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.mobile}
                      </p>
                    )}
                  </div>

                  {/* EMAIL */}

                  <div className="sm:col-span-2">
                    <label className="mb-2 block text-sm font-semibold text-[#4b2e1f]">
                      Email Address *
                    </label>

                    <div className="relative">
                      <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

                      <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="you@example.com"
                        className={`w-full rounded-xl border bg-white py-3 pl-10 pr-4 outline-none transition focus:border-[#8f3424] ${
                          errors.email
                            ? "border-red-400"
                            : "border-gray-200"
                        }`}
                      />
                    </div>

                    {errors.email && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.email}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* DIVIDER */}

              <div className="my-8 border-t border-[#eadbc6]" />

              {/* =================================================
                  DELIVERY DETAILS
              ================================================= */}

              <div>
                <div className="mb-4 flex items-center gap-2">
                  <FiMapPin className="text-[#8f3424]" />

                  <h3 className="font-bold text-[#4b2e1f]">
                    Delivery Details
                  </h3>
                </div>

                <div className="space-y-5">
                  {/* ADDRESS */}

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#4b2e1f]">
                      Complete Address *
                    </label>

                    <textarea
                      name="address"
                      rows={3}
                      value={form.address}
                      onChange={handleChange}
                      placeholder="House / Flat / Street / Area"
                      className={`w-full resize-none rounded-xl border bg-white px-4 py-3 outline-none transition focus:border-[#8f3424] ${
                        errors.address
                          ? "border-red-400"
                          : "border-gray-200"
                      }`}
                    />

                    {errors.address && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.address}
                      </p>
                    )}
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    {/* PINCODE */}

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-[#4b2e1f]">
                        Pincode *
                      </label>

                      <div className="relative">
                        <FiMapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

                        <input
                          type="text"
                          name="pincode"
                          inputMode="numeric"
                          maxLength={6}
                          value={form.pincode}
                          onChange={handleChange}
                          placeholder="6-digit pincode"
                          className={`w-full rounded-xl border bg-white py-3 pl-10 pr-10 outline-none transition focus:border-[#8f3424] ${
                            errors.pincode
                              ? "border-red-400"
                              : "border-gray-200"
                          }`}
                        />

                        {pincodeLoading && (
                          <FiLoader className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-[#8f3424]" />
                        )}

                        {!pincodeLoading &&
                          pincodeData && (
                            <FiCheck className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600" />
                          )}
                      </div>

                      {pincodeError && (
                        <p className="mt-1 text-xs text-red-600">
                          {pincodeError}
                        </p>
                      )}

                      {errors.pincode && (
                        <p className="mt-1 text-xs text-red-600">
                          {errors.pincode}
                        </p>
                      )}

                      {pincodeData && (
                        <p className="mt-2 text-xs text-green-700">
                          {pincodeData.postOffice}

                          {pincodeData.district
                            ? `, ${pincodeData.district}`
                            : ""}

                          {pincodeData.state
                            ? `, ${pincodeData.state}`
                            : ""}
                        </p>
                      )}
                    </div>

                    {/* CITY */}

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-[#4b2e1f]">
                        City *
                      </label>

                      <input
                        type="text"
                        name="city"
                        value={form.city}
                        onChange={handleChange}
                        placeholder="City / District"
                        className={`w-full rounded-xl border bg-white px-4 py-3 outline-none transition focus:border-[#8f3424] ${
                          errors.city
                            ? "border-red-400"
                            : "border-gray-200"
                        }`}
                      />

                      {errors.city && (
                        <p className="mt-1 text-xs text-red-600">
                          {errors.city}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* STATE */}

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#4b2e1f]">
                      State *
                    </label>

                    <select
                      name="state"
                      value={form.state}
                      onChange={handleChange}
                      className={`w-full rounded-xl border bg-white px-4 py-3 outline-none transition focus:border-[#8f3424] ${
                        errors.state
                          ? "border-red-400"
                          : "border-gray-200"
                      }`}
                    >
                      <option value="">
                        Select State
                      </option>

                      {INDIAN_STATES.map(
                        (state) => (
                          <option
                            key={state}
                            value={state}
                          >
                            {state}
                          </option>
                        )
                      )}
                    </select>

                    {errors.state && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.state}
                      </p>
                    )}

                    {stateCode && (
                      <p className="mt-2 text-xs text-gray-500">
                        GST State Code:{" "}
                        <span className="font-semibold text-[#4b2e1f]">
                          {stateCode}
                        </span>
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* DIVIDER */}

              <div className="my-8 border-t border-[#eadbc6]" />

              {/* =================================================
                  SHIPPING
              ================================================= */}

              <div>
                <div className="mb-4 flex items-center gap-2">
                  <FiTruck className="text-[#8f3424]" />

                  <h3 className="font-bold text-[#4b2e1f]">
                    Shipping
                  </h3>
                </div>

                {shippingLoading ? (
                  <div className="flex items-center gap-3 rounded-xl bg-[#fffaf2] p-4 text-sm text-[#6b4633]">
                    <FiLoader className="animate-spin" />
                    Calculating shipping...
                  </div>
                ) : shippingError ? (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    {shippingError}
                  </div>
                ) : shippingData ? (
                  <div className="rounded-xl border border-[#eadbc6] bg-[#fffaf2] p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-[#4b2e1f]">
                          Standard Delivery
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                          {shippingData.billableWeight
                            ? `Billable weight: ${shippingData.billableWeight}g`
                            : "Delivery charges calculated"}
                        </p>
                      </div>

                      <div className="text-right">
                        {finalShipping ===
                        0 ? (
                          <p className="font-bold text-green-600">
                            FREE
                          </p>
                        ) : (
                          <p className="font-bold text-[#4b2e1f]">
                            {formatCurrency(
                              finalShipping
                            )}
                          </p>
                        )}
                      </div>
                    </div>

                    {sellingSubtotal >=
                      FREE_SHIPPING_THRESHOLD && (
                      <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-green-700">
                        <FiCheck />
                        Eligible for free shipping
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="rounded-xl bg-gray-50 p-4 text-sm text-gray-500">
                    Enter your 6-digit pincode to
                    calculate shipping.
                  </div>
                )}
              </div>

              {/* DIVIDER */}

              <div className="my-8 border-t border-[#eadbc6]" />

              {/* =================================================
                  PAYMENT
              ================================================= */}

              <div>
                <div className="mb-4 flex items-center gap-2">
                  <FiCreditCard className="text-[#8f3424]" />

                  <h3 className="font-bold text-[#4b2e1f]">
                    Payment Method
                  </h3>
                </div>

                <div className="space-y-3">
                  {/* COD */}

                  <button
                    type="button"
                    onClick={() =>
                      setPaymentMode("cod")
                    }
                    className={`w-full rounded-xl border p-4 text-left transition ${
                      paymentMode === "cod"
                        ? "border-[#8f3424] bg-[#fffaf2]"
                        : "border-gray-200 hover:border-[#d39a38]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                          paymentMode === "cod"
                            ? "border-[#8f3424]"
                            : "border-gray-400"
                        }`}
                      >
                        {paymentMode === "cod" && (
                          <div className="h-2.5 w-2.5 rounded-full bg-[#8f3424]" />
                        )}
                      </div>

                      <div>
                        <p className="font-semibold text-[#4b2e1f]">
                          Cash on Delivery
                        </p>

                        <p className="text-xs text-gray-500">
                          Pay when your order arrives
                        </p>
                      </div>
                    </div>
                  </button>

                  {/* PREPAID */}

                  <button
                    type="button"
                    onClick={() =>
                      setPaymentMode("prepaid")
                    }
                    className={`w-full rounded-xl border p-4 text-left transition ${
                      paymentMode === "prepaid"
                        ? "border-[#8f3424] bg-[#fffaf2]"
                        : "border-gray-200 hover:border-[#d39a38]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                          paymentMode ===
                          "prepaid"
                            ? "border-[#8f3424]"
                            : "border-gray-400"
                        }`}
                      >
                        {paymentMode ===
                          "prepaid" && (
                          <div className="h-2.5 w-2.5 rounded-full bg-[#8f3424]" />
                        )}
                      </div>

                      <div>
                        <p className="font-semibold text-[#4b2e1f]">
                          Prepaid UPI
                        </p>

                        <p className="text-xs text-gray-500">
                          Pay securely using UPI
                        </p>
                      </div>
                    </div>
                  </button>
                </div>

                {/* PREPAID OPTIONS */}

                {paymentMode ===
                  "prepaid" && (
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() =>
                        setPaymentMethod(
                          "upi_id"
                        )
                      }
                      className={`rounded-xl border p-4 text-left ${
                        paymentMethod ===
                        "upi_id"
                          ? "border-[#8f3424] bg-[#fffaf2]"
                          : "border-gray-200"
                      }`}
                    >
                      <p className="font-semibold text-[#4b2e1f]">
                        UPI ID
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        {VRAJ_UPI_ID}
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setPaymentMethod(
                          "qr"
                        )
                      }
                      className={`rounded-xl border p-4 text-left ${
                        paymentMethod ===
                        "qr"
                          ? "border-[#8f3424] bg-[#fffaf2]"
                          : "border-gray-200"
                      }`}
                    >
                      <p className="font-semibold text-[#4b2e1f]">
                        Dynamic QR
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        QR includes final amount
                      </p>
                    </button>
                  </div>
                )}

                {/* UPI INFO */}

                {paymentMode ===
                  "prepaid" &&
                  paymentMethod ===
                    "upi_id" && (
                    <div className="mt-5 rounded-xl bg-[#fffaf2] p-4">
                      <p className="text-sm font-semibold text-[#4b2e1f]">
                        UPI Payment
                      </p>

                      <p className="mt-1 text-sm text-gray-600">
                        Pay{" "}
                        <span className="font-bold text-[#8f3424]">
                          {isCheckoutReady
                            ? formatCurrency(
                                finalTotal
                              )
                            : "—"}{" "}
                        </span>
                        to:
                      </p>

                      <p className="mt-2 rounded-lg bg-white px-3 py-2 font-mono text-sm font-semibold text-[#4b2e1f]">
                        {VRAJ_UPI_ID}
                      </p>
                    </div>
                  )}

                {/* QR */}

                {paymentMode ===
                  "prepaid" &&
                  paymentMethod ===
                    "qr" && (
                    <div className="mt-5 flex flex-col items-center rounded-xl bg-[#fffaf2] p-5">
                      <p className="mb-1 font-semibold text-[#4b2e1f]">
                        Scan & Pay
                      </p>

                      <p className="mb-4 text-sm text-gray-600">
                        Amount:{" "}
                        <span className="font-bold text-[#8f3424]">
                          {isCheckoutReady
                            ? formatCurrency(
                                finalTotal
                              )
                            : "—"}
                        </span>
                      </p>

                      {isCheckoutReady ? (
                        <div className="rounded-2xl bg-white p-4 shadow-sm">
                          <QRCodeCanvas
                            value={
                              upiPaymentUrl
                            }
                            size={210}
                            includeMargin
                          />
                        </div>
                      ) : (
                        <div className="flex h-[242px] w-[242px] items-center justify-center rounded-2xl bg-white p-4 text-center text-xs text-gray-500 shadow-sm">
                          Complete your checkout
                          details to generate
                          the payment QR.
                        </div>
                      )}

                      <p className="mt-3 text-center text-xs text-gray-500">
                        {VRAJ_UPI_NAME}
                        <br />
                        {VRAJ_UPI_ID}
                      </p>
                    </div>
                  )}
              </div>

              {/* =================================================
                  FORM STATUS
              ================================================= */}

              <div className="mt-8 rounded-xl border border-[#eadbc6] bg-[#fffaf2] p-4">
                {isCheckoutReady ? (
                  <div className="flex items-center gap-3 text-sm font-semibold text-green-700">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-green-100">
                      <FiCheck />
                    </div>

                    All required details are complete.
                    Your order total is ready.
                  </div>
                ) : (
                  <div className="flex items-start gap-3 text-sm text-[#6b4633]">
                    <FiShield className="mt-0.5 shrink-0 text-[#8f3424]" />

                    <div>
                      <p className="font-semibold">
                        Complete checkout form
                      </p>

                      <p className="mt-1 text-xs leading-5 text-gray-500">
                        Please fill your name, mobile,
                        email, address, city, state and
                        pincode. Shipping must also be
                        verified before the final amount
                        is displayed.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* =================================================
              RIGHT - ORDER SUMMARY
          ================================================= */}

          <aside className="lg:sticky lg:top-6 lg:h-fit">
            <section className="overflow-hidden rounded-2xl border border-[#eadbc6] bg-white shadow-sm">
              {/* TITLE */}

              <div className="border-b border-[#eadbc6] bg-[#fffaf2] px-5 py-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-[#4b2e1f]">
                      Order Summary
                    </h2>

                    <p className="mt-1 text-xs text-gray-500">
                      {totalItems} item
                      {totalItems !== 1
                        ? "s"
                        : ""}
                    </p>
                  </div>

                  <FiPackage
                    className="text-[#8f3424]"
                    size={22}
                  />
                </div>
              </div>

              {/* =================================================
                  PRODUCTS
              ================================================= */}

              <div className="max-h-[420px] space-y-4 overflow-y-auto p-5">
                {orderItems.map(
                  (item, index) => (
                    <div
                      key={`${item.productId || item.name}-${index}`}
                      className="flex gap-3"
                    >
                      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-[#f4eadb]">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-[#8f3424]">
                            <FiPackage />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-[#4b2e1f]">
                          {item.name}
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                          Qty: {item.quantity}
                        </p>

                        {/* PRODUCT PRICE ALWAYS VISIBLE */}

                        <div className="mt-1 flex items-center gap-2">
                          <span className="text-sm font-bold text-[#8f3424]">
                            {formatCurrency(
                              item.sellingPrice *
                                item.quantity
                            )}
                          </span>

                          {item.originalPrice >
                            item.sellingPrice && (
                            <span className="text-xs text-gray-400 line-through">
                              {formatCurrency(
                                item.originalPrice *
                                  item.quantity
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>

              {/* =================================================
                  COUPON
              ================================================= */}

              <div className="border-t border-[#eadbc6] p-5">
                <div className="mb-3 flex items-center gap-2">
                  <FiGift className="text-[#8f3424]" />

                  <p className="font-semibold text-[#4b2e1f]">
                    Coupon
                  </p>
                </div>

                {appliedCoupon ? (
                  <div className="flex items-center justify-between rounded-xl border border-green-200 bg-green-50 p-3">
                    <div>
                      <p className="text-sm font-bold text-green-700">
                        {appliedCoupon.code}
                      </p>

                      <p className="text-xs text-green-600">
                        {isCheckoutReady
                          ? formatCurrency(
                              couponDiscount
                            )
                          : "—"}{" "}
                        discount
                      </p>
                    </div>

                    <FiCheck className="text-green-600" />
                  </div>
                ) : (
                  <div className="rounded-xl bg-gray-50 p-3 text-xs text-gray-500">
                    Coupon can be applied from
                    the cart.
                  </div>
                )}

                {couponMessage && (
                  <p className="mt-2 text-xs text-green-700">
                    {couponMessage}
                  </p>
                )}

                {couponError && (
                  <p className="mt-2 text-xs text-red-600">
                    {couponError}
                  </p>
                )}
              </div>

              {/* =================================================
                  PRICE BREAKDOWN
              ================================================= */}

              <div className="border-t border-[#eadbc6] p-5">
                <div className="space-y-3 text-sm">
                  {/* PRODUCT TOTAL */}

                  <div className="flex justify-between gap-4">
                    <span className="text-gray-600">
                      Product Total
                    </span>

                    <span className="font-medium text-[#4b2e1f]">
                      {isCheckoutReady
                        ? formatCurrency(
                            productTotal
                          )
                        : "—"}
                    </span>
                  </div>

                  {/* PRODUCT DISCOUNT */}

                  <div className="flex justify-between gap-4">
                    <span className="text-gray-600">
                      Product Discount
                    </span>

                    <span className="font-medium text-green-600">
                      {isCheckoutReady
                        ? productDiscount > 0
                          ? `- ${formatCurrency(
                              productDiscount
                            )}`
                          : formatCurrency(0)
                        : "—"}
                    </span>
                  </div>

                  {/* COUPON */}

                  <div className="flex justify-between gap-4">
                    <span className="text-gray-600">
                      Coupon Discount
                    </span>

                    <span className="font-medium text-green-600">
                      {isCheckoutReady
                        ? couponDiscount > 0
                          ? `- ${formatCurrency(
                              couponDiscount
                            )}`
                          : formatCurrency(0)
                        : "—"}
                    </span>
                  </div>

                  {/* PRODUCT AMOUNT */}

                  <div className="flex justify-between gap-4 border-t border-dashed border-gray-200 pt-3">
                    <span className="font-semibold text-[#4b2e1f]">
                      Product Amount
                    </span>

                    <span className="font-bold text-[#4b2e1f]">
                      {isCheckoutReady
                        ? formatCurrency(
                            netProductAmount
                          )
                        : "—"}
                    </span>
                  </div>

                  {/* SHIPPING */}

                  <div className="flex justify-between gap-4">
                    <span className="text-gray-600">
                      Shipping
                    </span>

                    <span
                      className={
                        finalShipping === 0
                          ? "font-semibold text-green-600"
                          : "font-medium text-[#4b2e1f]"
                      }
                    >
                      {isCheckoutReady
                        ? finalShipping === 0
                          ? "FREE"
                          : formatCurrency(
                              finalShipping
                            )
                        : "—"}
                    </span>
                  </div>

                  {/* TOTAL BEFORE TAX */}

                  <div className="flex justify-between gap-4 border-t border-dashed border-gray-200 pt-3">
                    <span className="font-semibold text-[#4b2e1f]">
                      Total Amount Before Tax
                    </span>

                    <span className="font-bold text-[#4b2e1f]">
                      {isCheckoutReady
                        ? formatCurrency(
                            totalAmountBeforeTax
                          )
                        : "—"}
                    </span>
                  </div>

                  {/* GST */}

                  {gstData.isInterState ? (
                    <div className="flex justify-between gap-4 text-xs">
                      <span className="text-gray-500">
                        IGST ({GST_RATE}%)
                      </span>

                      <span className="text-gray-600">
                        {isCheckoutReady
                          ? formatCurrency(
                              gstData.igst
                            )
                          : "—"}
                      </span>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between gap-4 text-xs">
                        <span className="text-gray-500">
                          CGST ({CGST_RATE}%)
                        </span>

                        <span className="text-gray-600">
                          {isCheckoutReady
                            ? formatCurrency(
                                gstData.cgst
                              )
                            : "—"}
                        </span>
                      </div>

                      <div className="flex justify-between gap-4 text-xs">
                        <span className="text-gray-500">
                          SGST ({SGST_RATE}%)
                        </span>

                        <span className="text-gray-600">
                          {isCheckoutReady
                            ? formatCurrency(
                                gstData.sgst
                              )
                            : "—"}
                        </span>
                      </div>
                    </>
                  )}

                  {/* TOTAL GST */}

                  <div className="flex justify-between gap-4 text-xs">
                    <span className="font-semibold text-gray-600">
                      Total GST
                    </span>

                    <span className="font-bold text-gray-700">
                      {isCheckoutReady
                        ? formatCurrency(
                            gstData.totalGST
                          )
                        : "—"}
                    </span>
                  </div>
                </div>

                {/* =================================================
                    GRAND TOTAL
                ================================================= */}

                <div className="mt-5 border-t-2 border-[#eadbc6] pt-5">
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-gray-500">
                        Grand Total
                      </p>

                      <p className="mt-1 text-xs text-gray-400">
                        GST added on top
                      </p>
                    </div>

                    <p className="text-2xl font-bold text-[#8f3424]">
                      {isCheckoutReady
                        ? formatCurrency(
                            finalTotal
                          )
                        : "—"}
                    </p>
                  </div>
                </div>

                {/* =================================================
                    PLACE ORDER
                ================================================= */}

                <button
                  type="button"
                  onClick={placeOrder}
                  disabled={
                    placingOrder ||
                    shippingLoading ||
                    pincodeLoading ||
                    !isCheckoutReady
                  }
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#8f3424] px-5 py-4 font-bold text-white shadow-sm transition hover:bg-[#76291d] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {placingOrder ? (
                    <>
                      <FiLoader className="animate-spin" />
                      Placing Order...
                    </>
                  ) : !isCheckoutReady ? (
                    <>
                      <FiLock />
                      Complete Form First
                    </>
                  ) : (
                    <>
                      <FiLock />
                      Place Order
                    </>
                  )}
                </button>

                {/* =================================================
                    SECURITY
                ================================================= */}

                <div className="mt-4 flex items-start gap-3 rounded-xl bg-[#fffaf2] p-3">
                  <FiShield className="mt-0.5 shrink-0 text-[#8f3424]" />

                  <p className="text-xs leading-5 text-gray-600">
                    Your order details are securely
                    submitted to Vraj Creation.
                  </p>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </main>
    </div>
  );
}
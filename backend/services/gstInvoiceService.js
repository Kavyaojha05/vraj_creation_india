const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const os = require("os");

const ENV_PATH = path.resolve(__dirname, "..", ".env");

require("dotenv").config({
  path: ENV_PATH,
});

require("dotenv").config();

// =====================================================
// BUSINESS CONFIGURATION
// =====================================================

const BUSINESS_NAME =
  process.env.VRAJ_BUSINESS_NAME ||
  "Vraj Creation";

const BUSINESS_GSTIN =
  process.env.VRAJ_GSTIN ||
  "08AADPO3512A1ZB";

const BUSINESS_ADDRESS =
  process.env.VRAJ_BUSINESS_ADDRESS ||
  "Madhuban Colony Basni Jodhpur, Rajasthan, India";

const BUSINESS_STATE =
  process.env.VRAJ_STATE ||
  "Rajasthan";

const BUSINESS_STATE_CODE =
  process.env.VRAJ_STATE_CODE ||
  "08";

// =====================================================
// GST CONFIGURATION
// =====================================================

const GST_RATE = 5;
const CGST_RATE = 2.5;
const SGST_RATE = 2.5;
const IGST_RATE = 5;

// =====================================================
// IMPORTANT HSN RULE
//
// HSN IS TAKEN ONLY FROM PRODUCT MASTER / ORDER ITEM.
//
// Category based HSN mapping has been REMOVED.
//
// Supported:
// 4 digit HSN
// 6 digit HSN
// 8 digit HSN
//
// Example:
// 7326
// 4421
// 94036000
//
// If HSN is missing/invalid -> "-" on invoice.
// =====================================================

const getHSNCode = (item) => {
  if (!item) {
    return "";
  }

  const explicitHSN =
    item.hsnCode ??
    item.hsn ??
    item.HSNCode ??
    item.hsn_code ??
    item.product?.hsnCode ??
    item.product?.hsn ??
    item.product?.HSNCode ??
    item.product?.hsn_code ??
    "";

  const cleanHSN =
    String(explicitHSN || "").trim();

  if (
    /^\d{4}$/.test(cleanHSN) ||
    /^\d{6}$/.test(cleanHSN) ||
    /^\d{8}$/.test(cleanHSN)
  ) {
    return cleanHSN;
  }

  return "";
};

// =====================================================
// INDIAN STATE CODES
// =====================================================

const INDIAN_STATE_CODES = {
  AN: "Andaman and Nicobar Islands",
  AP: "Andhra Pradesh",
  AR: "Arunachal Pradesh",
  AS: "Assam",
  BR: "Bihar",
  CH: "Chandigarh",
  CG: "Chhattisgarh",
  DD: "Daman and Diu",
  DL: "Delhi",
  DN: "Dadra and Nagar Haveli and Daman and Diu",
  GA: "Goa",
  GJ: "Gujarat",
  HR: "Haryana",
  HP: "Himachal Pradesh",
  JK: "Jammu and Kashmir",
  JH: "Jharkhand",
  KA: "Karnataka",
  KL: "Kerala",
  LA: "Ladakh",
  LD: "Lakshadweep",
  MP: "Madhya Pradesh",
  MH: "Maharashtra",
  MN: "Manipur",
  ML: "Meghalaya",
  MZ: "Mizoram",
  NL: "Nagaland",
  OD: "Odisha",
  OR: "Odisha",
  PB: "Punjab",
  PY: "Puducherry",
  RJ: "Rajasthan",
  SK: "Sikkim",
  TN: "Tamil Nadu",
  TS: "Telangana",
  TR: "Tripura",
  UP: "Uttar Pradesh",
  UK: "Uttarakhand",
  UA: "Uttarakhand",
  WB: "West Bengal",
};

// =====================================================
// NUMERIC STATE CODES
// =====================================================

const INDIAN_NUMERIC_STATE_CODES = {
  "01": "Jammu and Kashmir",
  "02": "Himachal Pradesh",
  "03": "Punjab",
  "04": "Chandigarh",
  "05": "Uttarakhand",
  "06": "Haryana",
  "07": "Delhi",
  "08": "Rajasthan",
  "09": "Uttar Pradesh",
  "10": "Bihar",
  "11": "Sikkim",
  "12": "Arunachal Pradesh",
  "13": "Nagaland",
  "14": "Manipur",
  "15": "Mizoram",
  "16": "Tripura",
  "17": "Meghalaya",
  "18": "Assam",
  "19": "West Bengal",
  "20": "Jharkhand",
  "21": "Odisha",
  "22": "Chhattisgarh",
  "23": "Madhya Pradesh",
  "24": "Gujarat",
  "25": "Daman and Diu",
  "26": "Dadra and Nagar Haveli and Daman and Diu",
  "27": "Maharashtra",
  "28": "Andhra Pradesh",
  "29": "Karnataka",
  "30": "Goa",
  "31": "Lakshadweep",
  "32": "Kerala",
  "33": "Tamil Nadu",
  "34": "Puducherry",
  "35": "Andaman and Nicobar Islands",
  "36": "Telangana",
  "37": "Andhra Pradesh",
  "38": "Ladakh",
};

// =====================================================
// STATE ALIASES
// =====================================================

const STATE_ALIASES = {
  an: "Andaman and Nicobar Islands",
  andaman: "Andaman and Nicobar Islands",
  "andaman and nicobar islands":
    "Andaman and Nicobar Islands",

  ap: "Andhra Pradesh",
  andhra: "Andhra Pradesh",
  "andhra pradesh": "Andhra Pradesh",

  ar: "Arunachal Pradesh",
  arunachal: "Arunachal Pradesh",
  "arunachal pradesh": "Arunachal Pradesh",

  as: "Assam",
  assam: "Assam",

  br: "Bihar",
  bihar: "Bihar",

  ch: "Chandigarh",
  chandigarh: "Chandigarh",

  cg: "Chhattisgarh",
  chhattisgarh: "Chhattisgarh",

  dd: "Daman and Diu",
  "daman and diu": "Daman and Diu",

  dl: "Delhi",
  delhi: "Delhi",

  dn: "Dadra and Nagar Haveli and Daman and Diu",
  "dadra and nagar haveli and daman and diu":
    "Dadra and Nagar Haveli and Daman and Diu",

  ga: "Goa",
  goa: "Goa",

  gj: "Gujarat",
  gujarat: "Gujarat",

  hr: "Haryana",
  haryana: "Haryana",

  hp: "Himachal Pradesh",
  himachal: "Himachal Pradesh",
  "himachal pradesh": "Himachal Pradesh",

  jk: "Jammu and Kashmir",
  jammu: "Jammu and Kashmir",
  "jammu and kashmir": "Jammu and Kashmir",

  jh: "Jharkhand",
  jharkhand: "Jharkhand",

  ka: "Karnataka",
  karnataka: "Karnataka",

  kl: "Kerala",
  kerala: "Kerala",

  la: "Ladakh",
  ladakh: "Ladakh",

  ld: "Lakshadweep",
  lakshadweep: "Lakshadweep",

  mp: "Madhya Pradesh",
  madhya: "Madhya Pradesh",
  "madhya pradesh": "Madhya Pradesh",

  mh: "Maharashtra",
  maharashtra: "Maharashtra",

  mn: "Manipur",
  manipur: "Manipur",

  ml: "Meghalaya",
  meghalaya: "Meghalaya",

  mz: "Mizoram",
  mizoram: "Mizoram",

  nl: "Nagaland",
  nagaland: "Nagaland",

  od: "Odisha",
  or: "Odisha",
  odisha: "Odisha",
  orissa: "Odisha",

  pb: "Punjab",
  punjab: "Punjab",

  py: "Puducherry",
  puducherry: "Puducherry",
  pondicherry: "Puducherry",

  rj: "Rajasthan",
  raj: "Rajasthan",
  rajasthan: "Rajasthan",

  sk: "Sikkim",
  sikkim: "Sikkim",

  tn: "Tamil Nadu",
  tamilnadu: "Tamil Nadu",
  "tamil nadu": "Tamil Nadu",

  ts: "Telangana",
  telangana: "Telangana",

  tr: "Tripura",
  tripura: "Tripura",

  up: "Uttar Pradesh",
  "uttar pradesh": "Uttar Pradesh",

  uk: "Uttarakhand",
  ua: "Uttarakhand",
  uttarakhand: "Uttarakhand",

  wb: "West Bengal",
  westbengal: "West Bengal",
  "west bengal": "West Bengal",
};

// =====================================================
// NORMALIZE STATE
// =====================================================

const normalizeStateName = (state) => {
  const value = String(state || "").trim();

  if (!value) {
    return "";
  }

  const upperValue =
    value.toUpperCase();

  if (
    INDIAN_STATE_CODES[
      upperValue
    ]
  ) {
    return INDIAN_STATE_CODES[
      upperValue
    ];
  }

  const numericCode =
    value.padStart(2, "0");

  if (
    INDIAN_NUMERIC_STATE_CODES[
      numericCode
    ]
  ) {
    return INDIAN_NUMERIC_STATE_CODES[
      numericCode
    ];
  }

  const normalizedValue =
    value
      .toLowerCase()
      .replace(/[._-]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

  if (
    STATE_ALIASES[
      normalizedValue
    ]
  ) {
    return STATE_ALIASES[
      normalizedValue
    ];
  }

  const compactValue =
    normalizedValue.replace(
      /\s/g,
      ""
    );

  if (
    STATE_ALIASES[
      compactValue
    ]
  ) {
    return STATE_ALIASES[
      compactValue
    ];
  }

  const exactState =
    Object.values(
      INDIAN_STATE_CODES
    ).find(
      (stateName) =>
        stateName.toLowerCase() ===
        normalizedValue
    );

  if (exactState) {
    return exactState;
  }

  const numericExactState =
    Object.values(
      INDIAN_NUMERIC_STATE_CODES
    ).find(
      (stateName) =>
        stateName.toLowerCase() ===
        normalizedValue
    );

  if (numericExactState) {
    return numericExactState;
  }

  return value;
};

// =====================================================
// GET STATE CODE
// =====================================================

const getStateCode = (state) => {
  const normalizedState =
    normalizeStateName(state);

  if (!normalizedState) {
    return "";
  }

  const alphaEntry =
    Object.entries(
      INDIAN_STATE_CODES
    ).find(
      ([, stateName]) =>
        stateName.toLowerCase() ===
        normalizedState.toLowerCase()
    );

  if (alphaEntry) {
    return alphaEntry[0];
  }

  const numericEntry =
    Object.entries(
      INDIAN_NUMERIC_STATE_CODES
    ).find(
      ([, stateName]) =>
        stateName.toLowerCase() ===
        normalizedState.toLowerCase()
    );

  return numericEntry
    ? numericEntry[0]
    : "";
};

// =====================================================
// MONEY FORMAT
// =====================================================

const formatMoney = (value) => {
  const amount =
    Number(value || 0);

  if (
    !Number.isFinite(amount)
  ) {
    return "Rs. 0.00";
  }

  return `Rs. ${amount.toFixed(2)}`;
};

// =====================================================
// SAFE NUMBER
// =====================================================

const safeNumber = (
  value,
  fallback = 0
) => {
  const number =
    Number(value);

  return Number.isFinite(number)
    ? number
    : fallback;
};

// =====================================================
// ESCAPE HTML
// =====================================================

const escapeHtml = (value) => {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(
      /"/g,
      "&quot;"
    )
    .replace(
      /'/g,
      "&#039;"
    );
};

// =====================================================
// ROUND TO 2 DECIMAL
// =====================================================

const round2 = (value) => {
  const number =
    safeNumber(value);

  return (
    Math.round(
      (number + Number.EPSILON) *
        100
    ) / 100
  );
};

// =====================================================
// GST CALCULATION
//
// GST IS ADDED ON TOP.
//
// Rajasthan:
// CGST 2.5% + SGST 2.5%
//
// Other State:
// IGST 5%
// =====================================================

const calculateGST = (
  amountBeforeTax,
  customerState
) => {
  const totalAmountBeforeTax =
    round2(
      Math.max(
        0,
        safeNumber(
          amountBeforeTax
        )
      )
    );

  const sellerState =
    normalizeStateName(
      BUSINESS_STATE
    );

  const buyerState =
    normalizeStateName(
      customerState
    );

  if (!buyerState) {
    throw new Error(
      "Customer state is required for GST calculation."
    );
  }

  const sellerStateCode =
    getStateCode(
      sellerState
    );

  const buyerStateCode =
    getStateCode(
      buyerState
    );

  const isInterState =
    sellerStateCode &&
    buyerStateCode
      ? sellerStateCode !==
        buyerStateCode
      : sellerState.toLowerCase() !==
        buyerState.toLowerCase();

  const totalGST =
    round2(
      (totalAmountBeforeTax *
        GST_RATE) /
        100
    );

  let cgst = 0;
  let sgst = 0;
  let igst = 0;

  if (isInterState) {
    igst = totalGST;
  } else {
    cgst =
      round2(
        totalGST / 2
      );

    sgst =
      round2(
        totalGST - cgst
      );
  }

  const amountWithGST =
    round2(
      totalAmountBeforeTax +
        totalGST
    );

  return {
    grossAmount:
      amountWithGST,

    totalAmountBeforeTax,

    taxableValue:
      totalAmountBeforeTax,

    totalGST,

    cgst,
    sgst,
    igst,

    cgstRate:
      isInterState
        ? 0
        : CGST_RATE,

    sgstRate:
      isInterState
        ? 0
        : SGST_RATE,

    igstRate:
      isInterState
        ? IGST_RATE
        : 0,

    isInterState,

    sellerState,

    sellerStateCode,

    customerState:
      buyerState,

    customerStateCode:
      buyerStateCode,

    baseAmount:
      totalAmountBeforeTax,

    amountWithGST,
  };
};

// =====================================================
// FIND LOGO
// =====================================================

const findLogo = () => {
  const envLogoPath =
    process.env.VRAJ_LOGO_PATH;

  const possiblePaths = [];

  if (envLogoPath) {
    possiblePaths.push(
      path.resolve(
        envLogoPath
      )
    );

    possiblePaths.push(
      path.resolve(
        process.cwd(),
        envLogoPath
      )
    );

    possiblePaths.push(
      path.resolve(
        __dirname,
        "..",
        envLogoPath
      )
    );

    possiblePaths.push(
      path.resolve(
        __dirname,
        "..",
        "..",
        envLogoPath
      )
    );
  }

  possiblePaths.push(
    path.resolve(
      __dirname,
      "..",
      "..",
      "frontend",
      "assets",
      "vraj-logo.jpeg"
    ),

    path.resolve(
      __dirname,
      "..",
      "..",
      "frontend",
      "assets",
      "vraj-logo.jpg"
    ),

    path.resolve(
      __dirname,
      "..",
      "..",
      "frontend",
      "assets",
      "vraj-logo.png"
    ),

    path.resolve(
      __dirname,
      "..",
      "..",
      "frontend",
      "src",
      "assets",
      "vraj-logo.jpeg"
    ),

    path.resolve(
      __dirname,
      "..",
      "..",
      "frontend",
      "src",
      "assets",
      "vraj-logo.jpg"
    ),

    path.resolve(
      __dirname,
      "..",
      "..",
      "frontend",
      "src",
      "assets",
      "vraj-logo.png"
    ),

    path.resolve(
      __dirname,
      "..",
      "..",
      "frontend",
      "public",
      "vraj-logo.jpeg"
    ),

    path.resolve(
      __dirname,
      "..",
      "..",
      "frontend",
      "public",
      "vraj-logo.jpg"
    ),

    path.resolve(
      __dirname,
      "..",
      "..",
      "frontend",
      "public",
      "vraj-logo.png"
    ),

    path.resolve(
      __dirname,
      "..",
      "..",
      "vraj-creation-web-final",
      "assets",
      "vraj-logo.jpeg"
    ),

    path.resolve(
      __dirname,
      "..",
      "..",
      "vraj-creation-web-final",
      "src",
      "assets",
      "vraj-logo.jpeg"
    ),

    path.resolve(
      __dirname,
      "..",
      "assets",
      "vraj-logo.jpeg"
    ),

    path.resolve(
      __dirname,
      "..",
      "assets",
      "vraj-logo.jpg"
    ),

    path.resolve(
      __dirname,
      "..",
      "assets",
      "vraj-logo.png"
    )
  );

  for (
    const logoPath of possiblePaths
  ) {
    try {
      if (
        logoPath &&
        fs.existsSync(
          logoPath
        )
      ) {
        console.log(
          "Vraj Creation logo found:",
          logoPath
        );

        return logoPath;
      }
    } catch (error) {}
  }

  console.log(
    "Vraj Creation logo not found. PDF will be generated without logo."
  );

  return null;
};

// =====================================================
// DRAW LINE
// =====================================================

const drawLine = (
  doc,
  x1,
  y1,
  x2,
  y2,
  width = 0.7
) => {
  doc
    .lineWidth(width)
    .moveTo(x1, y1)
    .lineTo(x2, y2)
    .stroke();
};

// =====================================================
// DRAW BOX
// =====================================================

const drawBox = (
  doc,
  x,
  y,
  width,
  height,
  radius = 0
) => {
  doc
    .lineWidth(0.6)
    .roundedRect(
      x,
      y,
      width,
      height,
      radius
    )
    .stroke();
};

// =====================================================
// SECTION TITLE
// =====================================================

const drawSectionTitle = (
  doc,
  title,
  x,
  y,
  width
) => {
  doc
    .font("Helvetica-Bold")
    .fontSize(9)
    .text(
      title,
      x,
      y,
      {
        width,
      }
    );

  drawLine(
    doc,
    x,
    y + 12,
    x + width,
    y + 12,
    0.5
  );
};

// =====================================================
// NUMBER TO WORDS
// =====================================================

const numberToWords = (num) => {
  const number =
    Math.floor(
      Math.abs(
        Number(num || 0)
      )
    );

  if (number === 0) {
    return "Zero";
  }

  const ones = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];

  const tens = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];

  const convertBelowThousand =
    (n) => {
      let result = "";

      if (n >= 100) {
        result +=
          `${ones[
            Math.floor(n / 100)
          ]} Hundred `;

        n %= 100;
      }

      if (n >= 20) {
        result +=
          `${tens[
            Math.floor(n / 10)
          ]} `;

        n %= 10;
      }

      if (n > 0) {
        result +=
          `${ones[n]} `;
      }

      return result.trim();
    };

  let result = "";

  const crore =
    Math.floor(
      number / 10000000
    );

  if (crore > 0) {
    result +=
      `${convertBelowThousand(
        crore
      )} Crore `;
  }

  const lakh =
    Math.floor(
      (number % 10000000) /
        100000
    );

  if (lakh > 0) {
    result +=
      `${convertBelowThousand(
        lakh
      )} Lakh `;
  }

  const thousand =
    Math.floor(
      (number % 100000) /
        1000
    );

  if (thousand > 0) {
    result +=
      `${convertBelowThousand(
        thousand
      )} Thousand `;
  }

  const remainder =
    number % 1000;

  if (remainder > 0) {
    result +=
      `${convertBelowThousand(
        remainder
      )} `;
  }

  return result.trim();
};

// =====================================================
// AMOUNT IN WORDS
// =====================================================

const amountInWords = (
  amount
) => {
  const numericAmount =
    round2(amount);

  const rupees =
    Math.floor(
      numericAmount
    );

  const paise =
    Math.round(
      (
        numericAmount -
        rupees
      ) * 100
    );

  let result =
    `Rupees ${numberToWords(
      rupees
    )}`;

  if (paise > 0) {
    result +=
      ` and ${numberToWords(
        paise
      )} Paise`;
  }

  result +=
    " Only";

  return result;
};

// =====================================================
// CREATE INVOICE DATA
// =====================================================

const createInvoiceData = (
  order
) => {
  if (!order) {
    throw new Error(
      "Order data is required."
    );
  }

  const customer =
    order.customer ||
    order.user ||
    order.billing ||
    {};

  const shipping =
    order.shipping ||
    {};

  const pricing =
    order.pricing ||
    {};

  const rawItems =
    Array.isArray(order.items)
      ? order.items
      : Array.isArray(
          order.cartItems
        )
      ? order.cartItems
      : [];

  if (!rawItems.length) {
    throw new Error(
      "Order items are required for GST invoice."
    );
  }

  // =================================================
  // CUSTOMER STATE
  // =================================================

  const rawCustomerState =
    customer.state ||
    customer.stateName ||
    customer.stateCode ||
    order.customerState ||
    order.customerStateName ||
    order.customerStateCode ||
    shipping.state ||
    shipping.stateName ||
    shipping.stateCode ||
    "";

  const customerState =
    normalizeStateName(
      rawCustomerState
    );

  if (!customerState) {
    throw new Error(
      "Customer state is required for GST invoice."
    );
  }

  const customerStateCode =
    getStateCode(
      customerState
    );

  if (!customerStateCode) {
    throw new Error(
      `Unable to determine GST state code for customer state: ${customerState}`
    );
  }

  // =================================================
  // SHIPPING STATE
  // =================================================

  const shippingState =
    normalizeStateName(
      shipping.state ||
        shipping.stateName ||
        shipping.stateCode ||
        customer.state ||
        customer.stateName ||
        customer.stateCode ||
        customerState
    );

  const shippingStateCode =
    getStateCode(
      shippingState
    );

  // =================================================
  // ORDER DATE
  // =================================================

  const orderDate =
    order.createdAt
      ? new Date(
          order.createdAt
        )
      : new Date();

  // =================================================
  // SHIPPING CHARGE
  // =================================================

  const shippingCharge =
    round2(
      Math.max(
        0,
        safeNumber(
          shipping.charge ??
            shipping.shippingCharge ??
            pricing.shippingCharge ??
            pricing.shipping ??
            order.shippingCharge ??
            order.deliveryCharge ??
            0
        )
      )
    );

  // =================================================
  // PRODUCT TOTAL
  // =================================================

  let productTotal = 0;

  let productDiscount = 0;

  const preparedItems =
    rawItems.map(
      (item, index) => {
        const quantity =
          Math.max(
            0,
            safeNumber(
              item.quantity ??
                item.qty ??
                1
            )
          );

        const currentPrice =
          Math.max(
            0,
            safeNumber(
              item.price ??
                item.salePrice ??
                item.unitPrice ??
                0
            )
          );

        const originalPrice =
          Math.max(
            0,
            safeNumber(
              item.originalPrice ??
                item.mrp ??
                item.listPrice ??
                item.regularPrice ??
                currentPrice
            )
          );

        let sellingPrice =
          currentPrice;

        const discountPercent =
          Math.max(
            0,
            safeNumber(
              item.discountPercent ??
                item.discountPercentage ??
                0
            )
          );

        if (
          discountPercent > 0 &&
          currentPrice ===
            originalPrice
        ) {
          sellingPrice =
            round2(
              originalPrice *
                (
                  1 -
                  discountPercent /
                    100
                )
            );
        }

        if (
          sellingPrice >
          originalPrice
        ) {
          sellingPrice =
            originalPrice;
        }

        const originalSubtotal =
          round2(
            quantity *
              originalPrice
          );

        const sellingSubtotal =
          round2(
            quantity *
              sellingPrice
          );

        const itemDiscount =
          round2(
            Math.max(
              0,
              originalSubtotal -
                sellingSubtotal
            )
          );

        productTotal =
          round2(
            productTotal +
              originalSubtotal
          );

        productDiscount =
          round2(
            productDiscount +
              itemDiscount
          );

        return {
          item,

          index,

          quantity,

          originalPrice,

          sellingPrice,

          originalSubtotal,

          sellingSubtotal,

          itemDiscount,
        };
      }
    );

  // =================================================
  // PRODUCT AFTER ITEM DISCOUNT
  // =================================================

  const productAfterDiscount =
    round2(
      Math.max(
        0,
        productTotal -
          productDiscount
      )
    );

  // =================================================
  // COUPON DISCOUNT
  // =================================================

  const requestedCouponDiscount =
    round2(
      Math.max(
        0,
        safeNumber(
          order.couponDiscount ??
            pricing.couponDiscount ??
            0
        )
      )
    );

  const couponDiscount =
    round2(
      Math.min(
        productAfterDiscount,
        requestedCouponDiscount
      )
    );

  // =================================================
  // PRODUCT AFTER ALL DISCOUNTS
  // =================================================

  const invoiceProductTotal =
    round2(
      Math.max(
        0,
        productAfterDiscount -
          couponDiscount
      )
    );

  // =================================================
  // TOTAL BEFORE TAX
  // =================================================

  const calculatedTotalAmountBeforeTax =
    round2(
      invoiceProductTotal +
        shippingCharge
    );

  // =================================================
  // GST
  // =================================================

  const gst =
    calculateGST(
      calculatedTotalAmountBeforeTax,
      customerState
    );

  // =================================================
  // INVOICE ITEMS
  // =================================================

  const invoiceItems =
    preparedItems.map(
      ({
        item,
        index,
        quantity,
        originalPrice,
        sellingPrice,
        originalSubtotal,
        sellingSubtotal,
        itemDiscount,
      }) => {
        let extraCouponDiscount = 0;

        if (
          couponDiscount > 0 &&
          productAfterDiscount > 0
        ) {
          extraCouponDiscount =
            round2(
              couponDiscount *
                (
                  sellingSubtotal /
                  productAfterDiscount
                )
            );
        }

        const finalSellingSubtotal =
          round2(
            Math.max(
              0,
              sellingSubtotal -
                extraCouponDiscount
            )
          );

        const itemGST =
          calculateGST(
            finalSellingSubtotal,
            customerState
          );

        const totalItemDiscount =
          round2(
            itemDiscount +
              extraCouponDiscount
          );

        // =================================================
        // HSN FROM PRODUCT MASTER / ORDER ITEM ONLY
        //
        // NO CATEGORY FALLBACK.
        // =================================================

        const hsnCode =
          getHSNCode(item);

        return {
          serialNumber:
            index + 1,

          name:
            item.name ||
            item.title ||
            item.productName ||
            "Product",

          sku:
            item.sku ||
            item.productCode ||
            item.productSku ||
            item.id ||
            "-",

          // HSN ONLY
          hsnCode:
            hsnCode || "-",

          quantity,

          price:
            originalPrice,

          originalPrice,

          sellingPrice,

          subtotal:
            originalSubtotal,

          discount:
            totalItemDiscount,

          discountPercent:
            originalSubtotal > 0
              ? round2(
                  (
                    totalItemDiscount /
                    originalSubtotal
                  ) * 100
                )
              : 0,

          taxableValue:
            itemGST.taxableValue,

          totalAmountBeforeTax:
            itemGST.totalAmountBeforeTax,

          cgst:
            itemGST.cgst,

          sgst:
            itemGST.sgst,

          igst:
            itemGST.igst,

          gst:
            itemGST.totalGST,

          gstRate:
            GST_RATE,

          totalAmount:
            itemGST.grossAmount,
        };
      }
    );

  // =================================================
  // OVERALL GST
  // =================================================

  const itemGSTTotal =
    round2(
      gst.totalGST
    );

  // =================================================
  // FINAL AMOUNT
  // =================================================

  const calculatedFinalAmount =
    round2(
      gst.totalAmountBeforeTax +
        gst.totalGST
    );

  // =================================================
  // STORED GST DATA
  // =================================================

  const storedBeforeTax =
    safeNumber(
      pricing.totalAmountBeforeTax,
      NaN
    );

  const storedGST =
    safeNumber(
      pricing.totalGST,
      NaN
    );

  const storedFinalAmount =
    safeNumber(
      pricing.finalTotal ??
        pricing.finalAmount,
      NaN
    );

  const hasStoredGSTData =
    Number.isFinite(
      storedBeforeTax
    ) &&
    Number.isFinite(
      storedGST
    ) &&
    Number.isFinite(
      storedFinalAmount
    );

  const finalTotalAmountBeforeTax =
    hasStoredGSTData
      ? round2(
          storedBeforeTax
        )
      : calculatedTotalAmountBeforeTax;

  const finalTotalGST =
    hasStoredGSTData
      ? round2(
          storedGST
        )
      : gst.totalGST;

  const finalGrandTotal =
    hasStoredGSTData
      ? round2(
          storedFinalAmount
        )
      : calculatedFinalAmount;

  // =================================================
  // FINAL GST OBJECT
  // =================================================

  const finalGST =
    calculateGST(
      finalTotalAmountBeforeTax,
      customerState
    );

  const gstForInvoice =
    Math.abs(
      finalGST.totalGST -
        finalTotalGST
    ) <= 0.01
      ? {
          ...finalGST,

          totalGST:
            finalTotalGST,

          amountWithGST:
            finalGrandTotal,

          grossAmount:
            finalGrandTotal,
        }
      : {
          ...finalGST,

          amountWithGST:
            finalGrandTotal,

          grossAmount:
            finalGrandTotal,
        };

  // =================================================
  // RETURN INVOICE DATA
  // =================================================

  return {
    business: {
      name:
        BUSINESS_NAME,

      gstin:
        BUSINESS_GSTIN,

      address:
        BUSINESS_ADDRESS,

      state:
        normalizeStateName(
          BUSINESS_STATE
        ),

      stateCode:
        BUSINESS_STATE_CODE,
    },

    invoice: {
      invoiceNumber:
        order.invoiceNumber ||
        `VC-${
          order.orderNumber ||
          Date.now()
        }`,

      orderNumber:
        order.orderNumber ||
        "",

      date:
        orderDate,
    },

    customer: {
      fullName:
        customer.fullName ||
        customer.name ||
        "",

      mobile:
        customer.mobile ||
        customer.phone ||
        "",

      email:
        customer.email ||
        "",

      address:
        customer.address ||
        "",

      city:
        customer.city ||
        "",

      state:
        customerState,

      stateCode:
        customerStateCode,

      pincode:
        customer.pincode ||
        customer.zip ||
        "",
    },

    items:
      invoiceItems,

    productTotal,

    productDiscount,

    couponDiscount,

    invoiceProductTotal,

    totalAmountBeforeTax:
      finalTotalAmountBeforeTax,

    gstBaseAmount:
      finalTotalAmountBeforeTax,

    taxableValue:
      finalTotalAmountBeforeTax,

    gst:
      gstForInvoice,

    itemGSTTotal,

    shipping: {
      pincode:
        shipping.pincode ||
        customer.pincode ||
        customer.zip ||
        "",

      city:
        shipping.city ||
        customer.city ||
        "",

      state:
        shippingState,

      stateCode:
        shippingStateCode,

      weightGrams:
        safeNumber(
          shipping.billableWeightGrams ??
            shipping.weightGrams ??
            shipping.weight ??
            0
        ),

      charge:
        shippingCharge,

      isFree:
        Boolean(
          shipping.isFree ||
            shippingCharge === 0
        ),
    },

    finalAmount:
      finalGrandTotal,
  };
};

// =====================================================
// DRAW WATERMARK
// =====================================================

const drawWatermark = (
  doc,
  logoPath
) => {
  if (!logoPath) {
    return;
  }

  try {
    const pageWidth =
      doc.page.width;

    const pageHeight =
      doc.page.height;

    const watermarkWidth =
      180;

    const x =
      (pageWidth -
        watermarkWidth) /
      2;

    const y =
      (pageHeight -
        watermarkWidth) /
      2;

    doc.save();

    doc.opacity(0.08);

    doc.image(
      logoPath,
      x,
      y,
      {
        width:
          watermarkWidth,

        height:
          watermarkWidth,
      }
    );

    doc.restore();
  } catch (error) {
    console.log(
      "Watermark logo error:",
      error.message
    );
  }
};

// =====================================================
// DRAW HEADER
// =====================================================

const drawHeader = (
  doc,
  data,
  logoPath
) => {
  const pageWidth =
    doc.page.width;

  const left = 40;

  const right =
    pageWidth - 40;

  const headerTop = 35;

  if (logoPath) {
    try {
      doc.image(
        logoPath,
        left,
        headerTop,
        {
          fit: [75, 55],
          align: "left",
          valign: "center",
        }
      );
    } catch (error) {
      console.log(
        "Header logo error:",
        error.message
      );
    }
  }

  const businessX =
    left + 90;

  doc
    .font("Helvetica-Bold")
    .fontSize(18)
    .text(
      String(
        data.business.name
      ).toUpperCase(),
      businessX,
      headerTop + 2,
      {
        width: 250,
      }
    );

  doc
    .font("Helvetica")
    .fontSize(8)
    .text(
      data.business.address,
      businessX,
      headerTop + 25,
      {
        width: 260,
      }
    );

  doc
    .font("Helvetica")
    .fontSize(8)
    .text(
      `GSTIN: ${data.business.gstin}`,
      businessX,
      headerTop + 39,
      {
        width: 260,
      }
    );

  doc
    .font("Helvetica")
    .fontSize(8)
    .text(
      `State: ${data.business.state} (${data.business.stateCode})`,
      businessX,
      headerTop + 52,
      {
        width: 260,
      }
    );

  doc
    .font("Helvetica-Bold")
    .fontSize(17)
    .text(
      "TAX INVOICE",
      right - 160,
      headerTop + 2,
      {
        width: 160,
        align: "right",
      }
    );

  doc
    .font("Helvetica")
    .fontSize(8)
    .text(
      `Invoice No: ${data.invoice.invoiceNumber}`,
      right - 210,
      headerTop + 30,
      {
        width: 210,
        align: "right",
      }
    );

  doc.text(
    `Date: ${data.invoice.date.toLocaleDateString(
      "en-IN"
    )}`,
    right - 210,
    headerTop + 43,
    {
      width: 210,
      align: "right",
    }
  );

  doc.text(
    `Order No: ${
      data.invoice.orderNumber || "-"
    }`,
    right - 210,
    headerTop + 56,
    {
      width: 210,
      align: "right",
    }
  );

  drawLine(
    doc,
    left,
    105,
    right,
    105,
    1
  );
};

// =====================================================
// DRAW CUSTOMER SECTION
// =====================================================

const drawCustomerSection = (
  doc,
  data
) => {
  const left = 40;

  const right =
    doc.page.width - 40;

  const top = 120;

  const totalWidth =
    right - left;

  const gap = 12;

  const boxWidth =
    (totalWidth - gap) / 2;

  const boxHeight = 112;

  drawBox(
    doc,
    left,
    top,
    boxWidth,
    boxHeight,
    4
  );

  drawSectionTitle(
    doc,
    "BILL TO",
    left + 10,
    top + 9,
    boxWidth - 20
  );

  let y = top + 28;

  const billRows = [
    [
      "Name",
      data.customer.fullName,
    ],

    [
      "Mobile",
      data.customer.mobile,
    ],

    [
      "Email",
      data.customer.email,
    ],

    [
      "Address",
      data.customer.address,
    ],

    [
      "City",
      data.customer.city,
    ],

    [
      "State",
      `${data.customer.state} (${data.customer.stateCode})`,
    ],
  ];

  for (
    const [label, value] of billRows
  ) {
    doc
      .font("Helvetica-Bold")
      .fontSize(7.5)
      .text(
        `${label}:`,
        left + 10,
        y,
        {
          width: 45,
        }
      );

    doc
      .font("Helvetica")
      .fontSize(7.5)
      .text(
        String(value || "-"),
        left + 58,
        y,
        {
          width:
            boxWidth - 68,
          ellipsis: true,
        }
      );

    y += 12;
  }

  const rightBoxX =
    left +
    boxWidth +
    gap;

  drawBox(
    doc,
    rightBoxX,
    top,
    boxWidth,
    boxHeight,
    4
  );

  drawSectionTitle(
    doc,
    "SHIPPING / SHIP TO",
    rightBoxX + 10,
    top + 9,
    boxWidth - 20
  );

  let sy = top + 28;

  const shippingRows = [
    [
      "Pincode",
      data.shipping.pincode,
    ],

    [
      "City",
      data.shipping.city ||
        data.customer.city,
    ],

    [
      "State",
      `${data.shipping.state || data.customer.state} (${data.shipping.stateCode || data.customer.stateCode})`,
    ],

    [
      "Weight",
      data.shipping.weightGrams > 0
        ? `${data.shipping.weightGrams} g`
        : "-",
    ],

    [
      "Shipping",
      data.shipping.isFree
        ? "FREE"
        : formatMoney(
            data.shipping.charge
          ),
    ],
  ];

  for (
    const [label, value] of shippingRows
  ) {
    doc
      .font("Helvetica-Bold")
      .fontSize(7.5)
      .text(
        `${label}:`,
        rightBoxX + 10,
        sy,
        {
          width: 50,
        }
      );

    doc
      .font("Helvetica")
      .fontSize(7.5)
      .text(
        String(value || "-"),
        rightBoxX + 62,
        sy,
        {
          width:
            boxWidth - 72,
          ellipsis: true,
        }
      );

    sy += 13;
  }

  const stripY =
    top +
    boxHeight +
    9;

  doc
    .roundedRect(
      left,
      stripY,
      totalWidth,
      24,
      3
    )
    .stroke();

  doc
    .font("Helvetica-Bold")
    .fontSize(8)
    .text(
      "Order Number:",
      left + 10,
      stripY + 8
    );

  doc
    .font("Helvetica")
    .fontSize(8)
    .text(
      data.invoice.orderNumber ||
        "-",
      left + 85,
      stripY + 8
    );

  return stripY + 33;
};

// =====================================================
// DRAW PRODUCT TABLE
//
// CATEGORY IS NOT DISPLAYED.
// HSN CODE IS DISPLAYED.
// =====================================================

const drawProductTable = (
  doc,
  data,
  startY
) => {
  const left = 40;

  const right =
    doc.page.width - 40;

  const width =
    right - left;

  const itemCount =
    data.items.length;

  let rowHeight = 25;

  let fontSize = 7.5;

  if (itemCount >= 5) {
    rowHeight = 22;
    fontSize = 7;
  }

  if (itemCount >= 8) {
    rowHeight = 19;
    fontSize = 6.5;
  }

  const headerHeight = 24;

  // =================================================
  // TABLE COLUMNS
  //
  // CATEGORY IS NOT INCLUDED.
  // HSN CODE IS INCLUDED.
  // =================================================

  const columns = [
    {
      key: "sr",
      title: "#",
      width: 20,
      align: "center",
    },

    {
      key: "product",
      title: "PRODUCT",
      width: 90,
      align: "left",
    },

    {
      key: "hsn",
      title: "HSN CODE",
      width: 45,
      align: "center",
    },

    {
      key: "sku",
      title: "SKU",
      width: 45,
      align: "left",
    },

    {
      key: "qty",
      title: "QTY",
      width: 27,
      align: "center",
    },

    {
      key: "rate",
      title: "RATE",
      width: 52,
      align: "right",
    },

    {
      key: "discount",
      title: "DISC.",
      width: 45,
      align: "right",
    },

    {
      key: "beforeTax",
      title: "BEFORE TAX",
      width: 67,
      align: "right",
    },

    {
      key: "gst",
      title: "GST",
      width: 48,
      align: "right",
    },

    {
      key: "amount",
      title: "AMOUNT",
      width: 76,
      align: "right",
    },
  ];

  // =================================================
  // SAFETY COLUMN WIDTH
  // =================================================

  const configuredWidth =
    columns.reduce(
      (sum, column) =>
        sum + column.width,
      0
    );

  if (
    configuredWidth !== width
  ) {
    columns[
      columns.length - 1
    ].width +=
      width -
      configuredWidth;
  }

  // =================================================
  // TABLE HEADER
  // =================================================

  doc
    .rect(
      left,
      startY,
      width,
      headerHeight
    )
    .stroke();

  let x = left;

  for (
    const column of columns
  ) {
    doc
      .font("Helvetica-Bold")
      .fontSize(6.5)
      .text(
        column.title,
        x + 3,
        startY + 8,
        {
          width:
            column.width - 6,
          align:
            column.align,
          ellipsis: true,
        }
      );

    x += column.width;

    if (x < right) {
      drawLine(
        doc,
        x,
        startY,
        x,
        startY +
          headerHeight +
          itemCount *
            rowHeight,
        0.4
      );
    }
  }

  // =================================================
  // TABLE ROWS
  // =================================================

  let y =
    startY +
    headerHeight;

  data.items.forEach(
    (item) => {
      doc
        .rect(
          left,
          y,
          width,
          rowHeight
        )
        .stroke();

      let cellX = left;

      const values = [
        {
          value:
            item.serialNumber,
          align: "center",
        },

        {
          value:
            item.name,
          align: "left",
        },

        {
          value:
            item.hsnCode || "-",
          align: "center",
        },

        {
          value:
            item.sku || "-",
          align: "left",
        },

        {
          value:
            item.quantity,
          align: "center",
        },

        {
          value:
            formatMoney(
              item.originalPrice
            ),
          align: "right",
        },

        {
          value:
            formatMoney(
              item.discount
            ),
          align: "right",
        },

        {
          value:
            formatMoney(
              item.totalAmountBeforeTax
            ),
          align: "right",
        },

        {
          value:
            formatMoney(
              item.gst
            ),
          align: "right",
        },

        {
          value:
            formatMoney(
              item.totalAmount
            ),
          align: "right",
        },
      ];

      values.forEach(
        (
          cell,
          index
        ) => {
          const column =
            columns[index];

          doc
            .font("Helvetica")
            .fontSize(
              fontSize
            )
            .text(
              String(
                cell.value ?? "-"
              ),
              cellX + 3,
              y + 7,
              {
                width:
                  column.width - 6,
                align:
                  cell.align,
                ellipsis: true,
              }
            );

          cellX +=
            column.width;
        }
      );

      y += rowHeight;
    }
  );

  return y;
};

// =====================================================
// DRAW GST + TOTALS
// =====================================================

const drawGSTAndTotals = (
  doc,
  data,
  startY
) => {
  const left = 40;

  const right =
    doc.page.width - 40;

  const width =
    right - left;

  const gap = 12;

  const leftWidth =
    width * 0.53;

  const rightWidth =
    width -
    leftWidth -
    gap;

  const rightX =
    left +
    leftWidth +
    gap;

  const gstBoxHeight =
    136;

  // ===================================================
  // GST SUMMARY
  // ===================================================

  drawBox(
    doc,
    left,
    startY,
    leftWidth,
    gstBoxHeight,
    4
  );

  drawSectionTitle(
    doc,
    "GST SUMMARY",
    left + 10,
    startY + 9,
    leftWidth - 20
  );

  const gstHeaderY =
    startY + 30;

  doc
    .font("Helvetica-Bold")
    .fontSize(7)
    .text(
      "TAX TYPE",
      left + 10,
      gstHeaderY,
      {
        width: 85,
      }
    );

  doc.text(
    "RATE",
    left + 95,
    gstHeaderY,
    {
      width: 45,
    }
  );

  doc.text(
    "TOTAL BEFORE TAX",
    left + 140,
    gstHeaderY,
    {
      width: 70,
      align: "right",
    }
  );

  doc.text(
    "TAX",
    left + 210,
    gstHeaderY,
    {
      width:
        leftWidth - 220,
      align: "right",
    }
  );

  drawLine(
    doc,
    left + 10,
    gstHeaderY + 11,
    left +
      leftWidth -
      10,
    gstHeaderY + 11,
    0.5
  );

  let gstRows = [];

  if (
    data.gst.isInterState
  ) {
    gstRows = [
      [
        "IGST",
        `${data.gst.igstRate.toFixed(
          1
        )}%`,
        data.totalAmountBeforeTax,
        data.gst.igst,
      ],
    ];
  } else {
    gstRows = [
      [
        "CGST",
        `${data.gst.cgstRate.toFixed(
          1
        )}%`,
        data.totalAmountBeforeTax,
        data.gst.cgst,
      ],

      [
        "SGST",
        `${data.gst.sgstRate.toFixed(
          1
        )}%`,
        data.totalAmountBeforeTax,
        data.gst.sgst,
      ],
    ];
  }

  let gy =
    gstHeaderY + 18;

  gstRows.forEach(
    (row) => {
      doc
        .font("Helvetica")
        .fontSize(7.5)
        .text(
          row[0],
          left + 10,
          gy,
          {
            width: 85,
          }
        )
        .text(
          row[1],
          left + 95,
          gy,
          {
            width: 45,
          }
        )
        .text(
          formatMoney(row[2]),
          left + 140,
          gy,
          {
            width: 70,
            align: "right",
          }
        )
        .text(
          formatMoney(row[3]),
          left + 210,
          gy,
          {
            width:
              leftWidth - 220,
            align: "right",
          }
        );

      gy += 18;
    }
  );

  const gstNote =
    data.gst.isInterState
      ? `Inter-state supply: IGST ${data.gst.igstRate.toFixed(
          1
        )}% applicable. Customer State: ${data.customer.state} (${data.customer.stateCode})`
      : `Intra-state supply: CGST ${data.gst.cgstRate.toFixed(
          1
        )}% + SGST ${data.gst.sgstRate.toFixed(
          1
        )}% applicable.`;

  doc
    .font("Helvetica")
    .fontSize(6.5)
    .text(
      gstNote,
      left + 10,
      startY + 96,
      {
        width:
          leftWidth - 20,
      }
    );

  // ===================================================
  // INVOICE TOTALS
  // ===================================================

  const totals = [
    [
      "Product Total",
      data.productTotal,
    ],

    [
      "Discount",
      round2(
        data.productDiscount +
          data.couponDiscount
      ),
    ],

    [
      "Selling Price",
      data.invoiceProductTotal,
    ],

    [
      "Shipping",
      data.shipping.charge,
    ],

    [
      "Total Amount Before Tax",
      data.totalAmountBeforeTax,
    ],
  ];

  if (
    data.gst.isInterState
  ) {
    totals.push([
      "IGST",
      data.gst.igst,
    ]);
  } else {
    totals.push(
      [
        "CGST",
        data.gst.cgst,
      ],
      [
        "SGST",
        data.gst.sgst,
      ]
    );
  }

  totals.push([
    "Total GST",
    data.gst.totalGST,
  ]);

  const totalsHeaderHeight =
    31;

  const totalsRowHeight =
    14;

  const totalsBottomSpace =
    38;

  const totalsBoxHeight =
    totalsHeaderHeight +
    totals.length *
      totalsRowHeight +
    totalsBottomSpace;

  drawBox(
    doc,
    rightX,
    startY,
    rightWidth,
    totalsBoxHeight,
    4
  );

  drawSectionTitle(
    doc,
    "INVOICE TOTALS",
    rightX + 10,
    startY + 9,
    rightWidth - 20
  );

  let ty =
    startY +
    totalsHeaderHeight;

  totals.forEach(
    ([label, value]) => {
      doc
        .font("Helvetica")
        .fontSize(7.5)
        .text(
          label,
          rightX + 10,
          ty,
          {
            width:
              rightWidth - 85,
          }
        )
        .text(
          formatMoney(value),
          rightX +
            rightWidth -
            85,
          ty,
          {
            width: 75,
            align: "right",
          }
        );

      ty +=
        totalsRowHeight;
    }
  );

  drawLine(
    doc,
    rightX + 10,
    ty + 1,
    rightX +
      rightWidth -
      10,
    ty + 1,
    0.8
  );

  const grandTotalY =
    ty + 10;

  doc
    .font("Helvetica-Bold")
    .fontSize(10)
    .text(
      "GRAND TOTAL",
      rightX + 10,
      grandTotalY,
      {
        width:
          rightWidth - 100,
      }
    )
    .text(
      formatMoney(
        data.finalAmount
      ),
      rightX +
        rightWidth -
        95,
      grandTotalY,
      {
        width: 85,
        align: "right",
      }
    );

  return (
    startY +
    totalsBoxHeight
  );
};

// =====================================================
// DRAW AMOUNT IN WORDS
// =====================================================

const drawAmountInWords = (
  doc,
  data,
  startY
) => {
  const left = 40;

  startY =
    startY + 30;

  const width =
    doc.page.width - 80;

  const height = 34;

  drawBox(
    doc,
    left,
    startY,
    width,
    height,
    4
  );

  doc
    .font("Helvetica-Bold")
    .fontSize(7.5)
    .text(
      "Amount in Words:",
      left + 10,
      startY + 10,
      {
        width: 85,
      }
    );

  doc
    .font("Helvetica")
    .fontSize(7.5)
    .text(
      amountInWords(
        data.finalAmount
      ),
      left + 95,
      startY + 10,
      {
        width:
          width - 105,
      }
    );

  return (
    startY +
    height
  );
};

// =====================================================
// DRAW FOOTER
// =====================================================

const drawFooter = (
  doc,
  data,
  startY
) => {
  const left = 40;

  const right =
    doc.page.width - 40;

  const width =
    right - left;

  const top =
    startY + 12;

  doc
    .font("Helvetica-Bold")
    .fontSize(8)
    .text(
      "Shipping Information",
      left,
      top
    );

  doc
    .font("Helvetica")
    .fontSize(7)
    .text(
      `Pincode: ${
        data.shipping.pincode ||
        "-"
      }`,
      left,
      top + 15
    );

  doc.text(
    `City: ${
      data.shipping.city ||
      "-"
    }`,
    left,
    top + 27
  );

  doc.text(
    `State: ${
      data.shipping.state ||
      "-"
    }`,
    left,
    top + 39
  );

  doc.text(
    `Billable Weight: ${
      data.shipping.weightGrams > 0
        ? `${data.shipping.weightGrams} g`
        : "-"
    }`,
    left,
    top + 51
  );

  doc.text(
    `Shipping Charge: ${
      data.shipping.isFree
        ? "FREE"
        : formatMoney(
            data.shipping.charge
          )
    }`,
    left,
    top + 63
  );

  doc
    .font("Helvetica-Bold")
    .fontSize(8)
    .text(
      "Thank you for shopping with Vraj Creation.",
      left +
        width * 0.48,
      top,
      {
        width:
          width * 0.52,
        align: "right",
      }
    );

  doc
    .font("Helvetica")
    .fontSize(7)
    .text(
      "We appreciate your order.",
      left +
        width * 0.48,
      top + 15,
      {
        width:
          width * 0.52,
        align: "right",
      }
    );

  doc.text(
    "This is a computer generated GST invoice.",
    left +
      width * 0.48,
    top + 30,
    {
      width:
        width * 0.52,
      align: "right",
    }
  );

  doc.text(
    `GSTIN: ${data.business.gstin}`,
    left +
      width * 0.48,
    top + 45,
    {
      width:
        width * 0.52,
      align: "right",
    }
  );

  return top + 75;
};

// =====================================================
// GENERATE GST INVOICE PDF
// =====================================================

const generateGSTInvoicePDF =
  async (
    order,
    outputPath = null
  ) => {
    if (!order) {
      throw new Error(
        "Order data is required."
      );
    }

    const data =
      createInvoiceData(order);

    const finalOutputPath =
      outputPath ||
      path.join(
        os.tmpdir(),
        `vraj-invoice-${String(
          data.invoice.invoiceNumber
        ).replace(
          /[^a-zA-Z0-9-_]/g,
          "_"
        )}.pdf`
      );

    const outputDirectory =
      path.dirname(
        finalOutputPath
      );

    await fs.promises.mkdir(
      outputDirectory,
      {
        recursive: true,
      }
    );

    const doc =
      new PDFDocument({
        size: "A4",

        margins: {
          top: 30,
          bottom: 30,
          left: 40,
          right: 40,
        },

        bufferPages: true,

        info: {
          Title:
            `GST Invoice - ${data.invoice.invoiceNumber}`,

          Author:
            BUSINESS_NAME,

          Subject:
            "GST Tax Invoice",

          Keywords:
            "Vraj Creation GST Invoice",
        },
      });

    const stream =
      fs.createWriteStream(
        finalOutputPath
      );

    doc.pipe(stream);

    try {
      const logoPath =
        findLogo();

      // =================================================
      // WATERMARK
      // =================================================

      drawWatermark(
        doc,
        logoPath
      );

      // =================================================
      // HEADER
      // =================================================

      drawHeader(
        doc,
        data,
        logoPath
      );

      // =================================================
      // CUSTOMER
      // =================================================

      const customerEndY =
        drawCustomerSection(
          doc,
          data
        );

      // =================================================
      // PRODUCTS
      // =================================================

      const productEndY =
        drawProductTable(
          doc,
          data,
          customerEndY + 8
        );

      // =================================================
      // GST + TOTALS
      // =================================================

      const gstEndY =
        drawGSTAndTotals(
          doc,
          data,
          productEndY + 10
        );

      // =================================================
      // AMOUNT IN WORDS
      // =================================================

      const wordsEndY =
        drawAmountInWords(
          doc,
          data,
          gstEndY + 8
        );

      // =================================================
      // FOOTER
      // =================================================

      drawFooter(
        doc,
        data,
        wordsEndY
      );

      doc.end();

      // =================================================
      // WAIT FOR PDF
      // =================================================

      await new Promise(
        (
          resolve,
          reject
        ) => {
          let settled = false;

          stream.on(
            "finish",
            () => {
              if (!settled) {
                settled = true;
                resolve();
              }
            }
          );

          stream.on(
            "error",
            (error) => {
              if (!settled) {
                settled = true;
                reject(error);
              }
            }
          );
        }
      );

      // =================================================
      // VERIFY FILE
      // =================================================

      if (
        !fs.existsSync(
          finalOutputPath
        )
      ) {
        throw new Error(
          `Invoice PDF was not created: ${finalOutputPath}`
        );
      }

      const stats =
        await fs.promises.stat(
          finalOutputPath
        );

      if (!stats.isFile()) {
        throw new Error(
          `Invoice PDF path is not a file: ${finalOutputPath}`
        );
      }

      if (stats.size <= 0) {
        throw new Error(
          `Invoice PDF is empty: ${finalOutputPath}`
        );
      }

      // =================================================
      // VERIFY PDF HEADER
      // =================================================

      const fileHandle =
        await fs.promises.open(
          finalOutputPath,
          "r"
        );

      const headerBuffer =
        Buffer.alloc(5);

      await fileHandle.read(
        headerBuffer,
        0,
        5,
        0
      );

      await fileHandle.close();

      const pdfHeader =
        headerBuffer.toString(
          "ascii"
        );

      if (
        pdfHeader !==
        "%PDF-"
      ) {
        throw new Error(
          `Generated file is not a valid PDF. Header: ${pdfHeader}`
        );
      }

      // =================================================
      // CONSOLE LOG
      // =================================================

      console.log(
        "=============================================="
      );

      console.log(
        "GST Invoice PDF generated successfully"
      );

      console.log(
        "Invoice:",
        data.invoice.invoiceNumber
      );

      console.log(
        "File:",
        finalOutputPath
      );

      console.log(
        "Size:",
        stats.size,
        "bytes"
      );

      console.log(
        "GSTIN:",
        data.business.gstin
      );

      console.log(
        "Seller State:",
        data.business.state
      );

      console.log(
        "Seller State Code:",
        data.business.stateCode
      );

      console.log(
        "Customer State:",
        data.customer.state
      );

      console.log(
        "Customer State Code:",
        data.customer.stateCode
      );

      console.log(
        "Shipping State:",
        data.shipping.state
      );

      console.log(
        "Shipping State Code:",
        data.shipping.stateCode
      );

      console.log(
        "Supply Type:",
        data.gst.isInterState
          ? "INTER-STATE"
          : "INTRA-STATE"
      );

      console.log(
        "Product Total:",
        data.productTotal
      );

      console.log(
        "Product Discount:",
        data.productDiscount
      );

      console.log(
        "Coupon Discount:",
        data.couponDiscount
      );

      console.log(
        "Selling Product Total:",
        data.invoiceProductTotal
      );

      console.log(
        "Shipping:",
        data.shipping.charge
      );

      console.log(
        "Total Amount Before Tax:",
        data.totalAmountBeforeTax
      );

      console.log(
        "CGST:",
        data.gst.cgst
      );

      console.log(
        "SGST:",
        data.gst.sgst
      );

      console.log(
        "IGST:",
        data.gst.igst
      );

      console.log(
        "Total GST:",
        data.gst.totalGST
      );

      console.log(
        "Final Amount:",
        data.finalAmount
      );

      console.log(
        "Grand Total:",
        data.finalAmount
      );

      // =================================================
      // HSN DEBUG
      //
      // ONLY HSN IS LOGGED.
      // CATEGORY IS NOT USED.
      // =================================================

      console.log(
        "HSN Codes:",
        data.items.map(
          (item) => ({
            product:
              item.name,

            sku:
              item.sku,

            hsnCode:
              item.hsnCode,
          })
        )
      );

      console.log(
        "=============================================="
      );

      // =================================================
      // RETURN
      // =================================================

      return {
        success: true,

        filePath:
          finalOutputPath,

        filename:
          path.basename(
            finalOutputPath
          ),

        invoiceNumber:
          data.invoice.invoiceNumber,

        fileSize:
          stats.size,

        productTotal:
          data.productTotal,

        productDiscount:
          data.productDiscount,

        discount:
          round2(
            data.productDiscount +
              data.couponDiscount
          ),

        couponDiscount:
          data.couponDiscount,

        sellingProductTotal:
          data.invoiceProductTotal,

        totalAmountBeforeTax:
          data.totalAmountBeforeTax,

        taxableValue:
          data.totalAmountBeforeTax,

        cgst:
          data.gst.cgst,

        sgst:
          data.gst.sgst,

        igst:
          data.gst.igst,

        totalGST:
          data.gst.totalGST,

        shipping:
          data.shipping.charge,

        finalAmount:
          data.finalAmount,

        sellerState:
          data.business.state,

        sellerStateCode:
          data.business.stateCode,

        customerState:
          data.customer.state,

        customerStateCode:
          data.customer.stateCode,

        shippingState:
          data.shipping.state,

        shippingStateCode:
          data.shipping.stateCode,

        isInterState:
          data.gst.isInterState,

        gstRate:
          GST_RATE,
      };
    } catch (error) {
      try {
        if (
          fs.existsSync(
            finalOutputPath
          )
        ) {
          await fs.promises.unlink(
            finalOutputPath
          );
        }
      } catch (cleanupError) {
        console.error(
          "Failed to remove broken PDF:",
          cleanupError.message
        );
      }

      throw error;
    }
  };

// =====================================================
// DELETE INVOICE PDF
// =====================================================

const deleteInvoicePDF =
  async (filePath) => {
    if (!filePath) {
      return;
    }

    try {
      if (
        fs.existsSync(
          filePath
        )
      ) {
        await fs.promises.unlink(
          filePath
        );

        console.log(
          "Temporary invoice PDF deleted:",
          filePath
        );
      }
    } catch (error) {
      console.error(
        "Invoice PDF cleanup failed:",
        error.message
      );
    }
  };

// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  generateGSTInvoicePDF,

  deleteInvoicePDF,

  createInvoiceData,

  calculateGST,

  formatMoney,

  escapeHtml,

  normalizeStateName,

  getStateCode,

  getHSNCode,
};
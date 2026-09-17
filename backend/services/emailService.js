// =====================================================
// VRAJ CREATION - EMAIL SERVICE
// GST-EXCLUSIVE / GST ADDED ON TOP
// =====================================================

const nodemailer =
  require("nodemailer");

const {
  generateGSTInvoicePDF,
  deleteInvoicePDF,
} = require("./gstInvoiceService");

require("dotenv").config();

// =====================================================
// BUSINESS / GST CONFIGURATION
// =====================================================

const BUSINESS_STATE =
  "Rajasthan";

const GST_RATE = 5;

const CGST_RATE = 2.5;

const SGST_RATE = 2.5;

// =====================================================
// EMAIL CONFIGURATION
// =====================================================

const SMTP_HOST =
  process.env.SMTP_HOST;

const SMTP_PORT =
  Number(
    process.env.SMTP_PORT || 587
  );

const SMTP_USER =
  process.env.SMTP_USER;

const SMTP_PASS =
  process.env.SMTP_PASS;

const EMAIL_FROM =
  process.env.EMAIL_FROM ||
  SMTP_USER;

const ADMIN_ORDER_EMAIL =
  process.env.ADMIN_ORDER_EMAIL;

// =====================================================
// SMTP TRANSPORTER
// =====================================================

const transporter =
  nodemailer.createTransport({
    host:
      SMTP_HOST,

    port:
      SMTP_PORT,

    secure:
      SMTP_PORT === 465,

    auth: {
      user:
        SMTP_USER,

      pass:
        SMTP_PASS,
    },

    tls: {
      rejectUnauthorized:
        false,
    },
  });

// =====================================================
// VERIFY EMAIL CONNECTION
// =====================================================

const verifyEmailConnection =
  async () => {
    try {
      await transporter.verify();

      console.log(
        "===================================="
      );

      console.log(
        "Email SMTP connection successful"
      );

      console.log(
        "SMTP Host:",
        SMTP_HOST
      );

      console.log(
        "SMTP Port:",
        SMTP_PORT
      );

      console.log(
        "Email From:",
        EMAIL_FROM
      );

      console.log(
        "===================================="
      );

      return true;
    } catch (error) {
      console.error(
        "===================================="
      );

      console.error(
        "Email SMTP connection failed"
      );

      console.error(
        error.message
      );

      console.error(
        "===================================="
      );

      return false;
    }
  };

// =====================================================
// FORMAT MONEY
// =====================================================

const formatMoney = (
  value
) => {
  const amount =
    Number(value || 0);

  if (
    !Number.isFinite(
      amount
    )
  ) {
    return "₹0.00";
  }

  return `₹${amount.toFixed(
    2
  )}`;
};

// =====================================================
// ROUND MONEY
// =====================================================

const round2 = (
  value
) => {
  return Number(
    Number(value || 0).toFixed(2)
  );
};

// =====================================================
// NORMALIZE STATE
// =====================================================

const normalizeState = (
  state = ""
) => {
  return String(state)
    .trim()
    .toLowerCase();
};

// =====================================================
// HSN CODE
// =====================================================
// IMPORTANT:
//
// HSN is ONLY taken from trusted product/order data.
//
// NO category-based HSN fallback.
//
// Valid HSN:
// 4 digits
// 6 digits
// 8 digits
//
// Examples:
// 7326
// 4421
// 3926
// 94036000
//
// If HSN is missing or invalid:
// "-"
// =====================================================

const normalizeHSNCode = (
  value = ""
) => {
  const hsn =
    String(value ?? "")
      .trim();

  if (!hsn) {
    return "";
  }

  if (
    !/^(?:\d{4}|\d{6}|\d{8})$/.test(
      hsn
    )
  ) {
    console.warn(
      "Invalid HSN Code received in email service:",
      hsn
    );

    return "";
  }

  return hsn;
};

// =====================================================
// GET DEFAULT HSN CODE
// =====================================================
// IMPORTANT:
//
// Kept only for backward compatibility
// with existing imports.
//
// NO category mapping is performed.
//
// HSN is NEVER generated from category.
// =====================================================

const getDefaultHSNCode = () => {
  return "";
};

// =====================================================
// RESOLVE ITEM HSN CODE
// =====================================================
// Priority:
//
// 1. item.hsnCode
// 2. item.hsn
// 3. item.HSNCode
// 4. item.hsn_code
// 5. item.product.hsnCode
// 6. item.product.hsn
// 7. item.product.HSNCode
// 8. item.product.hsn_code
//
// NO CATEGORY FALLBACK.
// =====================================================

const getItemHSNCode = (
  item
) => {
  if (!item) {
    return "-";
  }

  const rawHSN =
    item.hsnCode ??
    item.hsn ??
    item.HSNCode ??
    item.hsn_code ??
    item.product?.hsnCode ??
    item.product?.hsn ??
    item.product?.HSNCode ??
    item.product?.hsn_code ??
    "";

  const hsnCode =
    normalizeHSNCode(
      rawHSN
    );

  return hsnCode || "-";
};

// =====================================================
// GST CALCULATION
// =====================================================
// GST IS ADDED ON TOP.
//
// Example:
//
// Product after discount = ₹600
// Shipping               = ₹60
// -----------------------------
// Total Before Tax       = ₹660
//
// GST 5%                 = ₹33
// -----------------------------
// Grand Total            = ₹693
// =====================================================

const calculateGST = (
  totalAmountBeforeTax,
  customerState
) => {
  const baseAmount =
    round2(
      Math.max(
        0,
        Number(
          totalAmountBeforeTax || 0
        )
      )
    );

  const sellerState =
    normalizeState(
      BUSINESS_STATE
    );

  const buyerState =
    normalizeState(
      customerState ||
        BUSINESS_STATE
    );

  const isInterState =
    sellerState !==
    buyerState;

  const totalGST =
    round2(
      baseAmount *
        (GST_RATE / 100)
    );

  let cgst = 0;

  let sgst = 0;

  let igst = 0;

  if (isInterState) {
    // -----------------------------------------------
    // OUTSIDE RAJASTHAN
    // -----------------------------------------------

    igst = totalGST;
  } else {
    // -----------------------------------------------
    // WITHIN RAJASTHAN
    // -----------------------------------------------

    cgst =
      round2(
        totalGST / 2
      );

    sgst =
      round2(
        totalGST - cgst
      );
  }

  const finalAmount =
    round2(
      baseAmount +
        totalGST
    );

  return {
    baseAmount,

    taxableAmount:
      baseAmount,

    taxableValue:
      baseAmount,

    totalAmountBeforeTax:
      baseAmount,

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
        ? GST_RATE
        : 0,

    rate:
      GST_RATE,

    isInterState,

    sellerState:
      BUSINESS_STATE,

    customerState:
      customerState ||
      BUSINESS_STATE,

    pricingMode:
      "gst_exclusive",

    amountWithGST:
      finalAmount,

    finalAmount,
  };
};

// =====================================================
// ESCAPE HTML
// =====================================================

const escapeHtml = (
  value
) => {
  return String(
    value ?? ""
  )
    .replace(
      /&/g,
      "&amp;"
    )
    .replace(
      /</g,
      "&lt;"
    )
    .replace(
      />/g,
      "&gt;"
    )
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
// CREATE ITEMS HTML
// =====================================================

const createItemsHtml = (
  order
) => {
  const items =
    Array.isArray(
      order?.items
    )
      ? order.items
      : [];

  if (
    !items.length
  ) {
    return `
      <tr>
        <td
          colspan="6"
          style="
            padding:12px;
            text-align:center;
            color:#777;
          "
        >
          No items found
        </td>
      </tr>
    `;
  }

  return items
    .map(
      (
        item,
        index
      ) => {
        const quantity =
          Number(
            item.quantity ||
              item.qty ||
              0
          );

        const price =
          Number(
            item.price ??
              item.sellingPrice ??
              item.salePrice ??
              0
          );

        const subtotal =
          Number(
            item.subtotal ??
              quantity *
                price
          );

        // ---------------------------------------------
        // HSN CODE
        // ---------------------------------------------
        // ONLY manual/product-master HSN.
        //
        // Category is NOT used.
        // ---------------------------------------------

        const hsnCode =
          getItemHSNCode(
            item
          );

        return `
          <tr>

            <!-- SERIAL -->

            <td
              style="
                padding:10px;
                border-bottom:1px solid #eee;
                text-align:center;
              "
            >
              ${index + 1}
            </td>


            <!-- PRODUCT -->

            <td
              style="
                padding:10px;
                border-bottom:1px solid #eee;
              "
            >
              <strong>
                ${escapeHtml(
                  item.name ||
                    item.productName ||
                    item.title ||
                    "Product"
                )}
              </strong>

              ${
                item.sku
                  ? `
                    <div
                      style="
                        font-size:12px;
                        color:#777;
                        margin-top:3px;
                      "
                    >
                      SKU:
                      ${escapeHtml(
                        item.sku
                      )}
                    </div>
                  `
                  : ""
              }
            </td>


            <!-- HSN CODE -->

            <td
              style="
                padding:10px;
                border-bottom:1px solid #eee;
                text-align:center;
                white-space:nowrap;
                font-weight:600;
              "
            >
              ${escapeHtml(
                hsnCode
              )}
            </td>


            <!-- QTY -->

            <td
              style="
                padding:10px;
                border-bottom:1px solid #eee;
                text-align:center;
              "
            >
              ${quantity}
            </td>


            <!-- PRICE -->

            <td
              style="
                padding:10px;
                border-bottom:1px solid #eee;
                text-align:right;
              "
            >
              ${formatMoney(
                price
              )}
            </td>


            <!-- SUBTOTAL -->

            <td
              style="
                padding:10px;
                border-bottom:1px solid #eee;
                text-align:right;
                font-weight:600;
              "
            >
              ${formatMoney(
                subtotal
              )}
            </td>

          </tr>
        `;
      }
    )
    .join("");
};

// =====================================================
// CREATE ORDER HTML
// =====================================================

const createOrderHtml = (
  order,
  options = {}
) => {
  const {
    recipientType =
      "customer",
  } = options;

  const customer =
    order?.customer || {};

  const pricing =
    order?.pricing || {};

  const shipping =
    order?.shipping || {};

  const savedGST =
    order?.gst || {};

  // ===================================================
  // PRODUCT SUBTOTAL
  // ===================================================

  const subtotal =
    round2(
      Number(
        pricing.subtotal ??
          pricing.productTotal ??
          order?.subtotal ??
          0
      )
    );

  // ===================================================
  // DISCOUNT
  // ===================================================

  const discount =
    round2(
      Number(
        pricing.couponDiscount ??
          pricing.discount ??
          order?.discount ??
          0
      )
    );

  // ===================================================
  // PRODUCT AMOUNT AFTER DISCOUNT
  // ===================================================

  const productAmountAfterDiscount =
    round2(
      Math.max(
        0,
        subtotal -
          discount
      )
    );

  // ===================================================
  // SHIPPING
  // ===================================================

  const shippingCharge =
    round2(
      Number(
        pricing.shipping ??
          pricing.shippingCharge ??
          shipping.charge ??
          order?.shippingCharge ??
          0
      )
    );

  // ===================================================
  // CUSTOMER STATE
  // ===================================================

  const customerState =
    String(
      customer.state ||
        savedGST.customerState ||
        shipping.state ||
        BUSINESS_STATE
    ).trim();

  // ===================================================
  // TOTAL AMOUNT BEFORE TAX
  // ===================================================

  const fallbackTotalBeforeTax =
    round2(
      productAmountAfterDiscount +
        shippingCharge
    );

  const savedTotalBeforeTax =
    Number(
      savedGST.totalAmountBeforeTax ??
        savedGST.taxableValue ??
        savedGST.taxableAmount ??
        pricing.totalAmountBeforeTax ??
        order?.totalAmountBeforeTax ??
        0
    );

  const totalAmountBeforeTax =
    round2(
      savedTotalBeforeTax > 0
        ? savedTotalBeforeTax
        : fallbackTotalBeforeTax
    );

  // ===================================================
  // GST
  // ===================================================

  const savedCGST =
    round2(
      Number(
        savedGST.cgst || 0
      )
    );

  const savedSGST =
    round2(
      Number(
        savedGST.sgst || 0
      )
    );

  const savedIGST =
    round2(
      Number(
        savedGST.igst || 0
      )
    );

  const savedTotalGST =
    round2(
      Number(
        savedGST.totalGST ??
          savedGST.gstAmount ??
          savedCGST +
            savedSGST +
            savedIGST
      )
    );

  const hasSavedGST =
    savedTotalGST > 0 ||
    savedCGST > 0 ||
    savedSGST > 0 ||
    savedIGST > 0;

  const gst =
    hasSavedGST
      ? {
          ...calculateGST(
            totalAmountBeforeTax,
            customerState
          ),

          taxableAmount:
            totalAmountBeforeTax,

          taxableValue:
            totalAmountBeforeTax,

          totalAmountBeforeTax:
            totalAmountBeforeTax,

          totalGST:
            savedTotalGST,

          cgst:
            savedCGST,

          sgst:
            savedSGST,

          igst:
            savedIGST,

          cgstRate:
            Number(
              savedGST.cgstRate ??
                (savedCGST > 0
                  ? CGST_RATE
                  : 0)
            ),

          sgstRate:
            Number(
              savedGST.sgstRate ??
                (savedSGST > 0
                  ? SGST_RATE
                  : 0)
            ),

          igstRate:
            Number(
              savedGST.igstRate ??
                (savedIGST > 0
                  ? GST_RATE
                  : 0)
            ),

          isInterState:
            Boolean(
              savedGST.isInterState ||
                savedIGST > 0
            ),

          sellerState:
            savedGST.sellerState ||
            BUSINESS_STATE,

          customerState:
            savedGST.customerState ||
            customerState,

          pricingMode:
            savedGST.pricingMode ||
            "gst_exclusive",

          finalAmount:
            round2(
              totalAmountBeforeTax +
                savedTotalGST
            ),

          amountWithGST:
            round2(
              totalAmountBeforeTax +
                savedTotalGST
            ),
        }
      : calculateGST(
          totalAmountBeforeTax,
          customerState
        );

  // ===================================================
  // GST VALUES
  // ===================================================

  const totalGST =
    round2(
      Number(
        gst.totalGST || 0
      )
    );

  const cgst =
    round2(
      Number(
        gst.cgst || 0
      )
    );

  const sgst =
    round2(
      Number(
        gst.sgst || 0
      )
    );

  const igst =
    round2(
      Number(
        gst.igst || 0
      )
    );

  // ===================================================
  // FINAL AMOUNT
  // ===================================================

  const finalAmount =
    round2(
      totalAmountBeforeTax +
        totalGST
    );

  // ===================================================
  // COUPON
  // ===================================================

  const couponCode =
    pricing.couponCode ||
    order?.coupon?.code ||
    order?.couponCode ||
    "";

  // ===================================================
  // SHIPPING INFO
  // ===================================================

  const weight =
    shipping.billableWeightGrams ??
    shipping.weightGrams ??
    shipping.weight ??
    0;

  const pincode =
    shipping.pincode ||
    customer.pincode ||
    "";

  const isAdmin =
    recipientType ===
    "admin";

  const isInterState =
    Boolean(
      gst.isInterState ||
        igst > 0
    );

  return `
<!DOCTYPE html>

<html>

<head>

<meta charset="UTF-8">

<title>
  Vraj Creation Order Confirmation
</title>

</head>

<body
  style="
    margin:0;
    padding:0;
    background:#f5f5f5;
    font-family:Arial,Helvetica,sans-serif;
  "
>

<div
  style="
    max-width:720px;
    margin:20px auto;
    background:#ffffff;
    border-radius:10px;
    overflow:hidden;
    box-shadow:0 2px 12px rgba(0,0,0,0.08);
  "
>

  <!-- HEADER -->

  <div
    style="
      background:#8f3424;
      color:#ffffff;
      padding:22px;
    "
  >

    <div
      style="
        font-size:24px;
        font-weight:bold;
      "
    >
      Vraj Creation
    </div>

    <div
      style="
        margin-top:6px;
        font-size:14px;
        opacity:0.95;
      "
    >
      ${
        isAdmin
          ? "New Order Received"
          : "Order Confirmation"
      }
    </div>

  </div>


  <!-- CONTENT -->

  <div
    style="
      padding:24px;
    "
  >

    <div
      style="
        font-size:18px;
        font-weight:bold;
        color:#222;
        margin-bottom:8px;
      "
    >
      ${
        isAdmin
          ? "New customer order received"
          : `Thank you for your order, ${escapeHtml(
              customer.fullName ||
                customer.name ||
                "Customer"
            )}!`
      }
    </div>


    <div
      style="
        color:#666;
        font-size:14px;
        margin-bottom:20px;
      "
    >

      Order #

      <strong>
        ${escapeHtml(
          order?.orderNumber ||
            "-"
        )}
      </strong>

    </div>


    <!-- STATUS -->

    <div
      style="
        display:inline-block;
        padding:7px 12px;
        border-radius:20px;
        background:#fff3cd;
        color:#856404;
        font-size:12px;
        font-weight:bold;
        margin-bottom:20px;
      "
    >

      Status:

      ${escapeHtml(
        order?.status ||
          "pending"
      )}

    </div>


    <!-- CUSTOMER DETAILS -->

    <h3
      style="
        margin:18px 0 10px;
        color:#333;
      "
    >
      Customer Details
    </h3>


    <table
      style="
        width:100%;
        border-collapse:collapse;
        font-size:14px;
      "
    >

      <tr>

        <td
          style="
            padding:6px 0;
            color:#777;
            width:120px;
          "
        >
          Name
        </td>

        <td
          style="
            padding:6px 0;
            font-weight:600;
          "
        >
          ${escapeHtml(
            customer.fullName ||
              customer.name ||
              "-"
          )}
        </td>

      </tr>


      <tr>

        <td
          style="
            padding:6px 0;
            color:#777;
          "
        >
          Mobile
        </td>

        <td
          style="
            padding:6px 0;
          "
        >
          ${escapeHtml(
            customer.mobile ||
              customer.phone ||
              "-"
          )}
        </td>

      </tr>


      <tr>

        <td
          style="
            padding:6px 0;
            color:#777;
          "
        >
          Email
        </td>

        <td
          style="
            padding:6px 0;
          "
        >
          ${escapeHtml(
            customer.email ||
              "-"
          )}
        </td>

      </tr>


      <tr>

        <td
          style="
            padding:6px 0;
            color:#777;
          "
        >
          Address
        </td>

        <td
          style="
            padding:6px 0;
          "
        >
          ${escapeHtml(
            customer.address ||
              "-"
          )}
        </td>

      </tr>


      <tr>

        <td
          style="
            padding:6px 0;
            color:#777;
          "
        >
          City
        </td>

        <td
          style="
            padding:6px 0;
          "
        >
          ${escapeHtml(
            customer.city ||
              "-"
          )}
        </td>

      </tr>


      <tr>

        <td
          style="
            padding:6px 0;
            color:#777;
          "
        >
          State
        </td>

        <td
          style="
            padding:6px 0;
          "
        >
          ${escapeHtml(
            customer.state ||
              BUSINESS_STATE
          )}
        </td>

      </tr>


      <tr>

        <td
          style="
            padding:6px 0;
            color:#777;
          "
        >
          Pincode
        </td>

        <td
          style="
            padding:6px 0;
          "
        >
          ${escapeHtml(
            pincode || "-"
          )}
        </td>

      </tr>

    </table>


    <!-- ORDER ITEMS -->

    <h3
      style="
        margin:24px 0 10px;
        color:#333;
      "
    >
      Order Items
    </h3>


    <table
      style="
        width:100%;
        border-collapse:collapse;
        font-size:13px;
        border:1px solid #eee;
      "
    >

      <thead>

        <tr
          style="
            background:#f8f8f8;
          "
        >

          <!-- # -->

          <th
            style="
              padding:10px;
              text-align:center;
              border-bottom:1px solid #eee;
            "
          >
            #
          </th>


          <!-- PRODUCT -->

          <th
            style="
              padding:10px;
              text-align:left;
              border-bottom:1px solid #eee;
            "
          >
            Product
          </th>


          <!-- HSN -->

          <th
            style="
              padding:10px;
              text-align:center;
              border-bottom:1px solid #eee;
              white-space:nowrap;
            "
          >
            HSN Code
          </th>


          <!-- QTY -->

          <th
            style="
              padding:10px;
              text-align:center;
              border-bottom:1px solid #eee;
            "
          >
            Qty
          </th>


          <!-- PRICE -->

          <th
            style="
              padding:10px;
              text-align:right;
              border-bottom:1px solid #eee;
            "
          >
            Price
          </th>


          <!-- SUBTOTAL -->

          <th
            style="
              padding:10px;
              text-align:right;
              border-bottom:1px solid #eee;
            "
          >
            Subtotal
          </th>

        </tr>

      </thead>


      <tbody>

        ${createItemsHtml(
          order
        )}

      </tbody>

    </table>


    <!-- SHIPPING -->

    <h3
      style="
        margin:24px 0 10px;
        color:#333;
      "
    >
      Shipping
    </h3>


    <div
      style="
        background:#fafafa;
        border:1px solid #eee;
        border-radius:8px;
        padding:12px;
        font-size:13px;
      "
    >

      <div
        style="
          margin-bottom:5px;
        "
      >

        Pincode:

        <strong>
          ${escapeHtml(
            pincode || "-"
          )}
        </strong>

      </div>


      <div
        style="
          margin-bottom:5px;
        "
      >

        Weight:

        <strong>
          ${
            weight
              ? `${weight} g`
              : "-"
          }
        </strong>

      </div>


      <div>

        Shipping Charge:

        <strong>
          ${formatMoney(
            shippingCharge
          )}
        </strong>

      </div>

    </div>


    <!-- TOTALS -->

    <div
      style="
        margin-top:24px;
        margin-left:auto;
        max-width:380px;
      "
    >

      <!-- PRODUCT TOTAL -->

      <div
        style="
          display:flex;
          justify-content:space-between;
          padding:6px 0;
          color:#555;
        "
      >

        <span>
          Product Total
        </span>

        <strong>
          ${formatMoney(
            subtotal
          )}
        </strong>

      </div>


      <!-- DISCOUNT -->

      ${
        discount > 0
          ? `
            <div
              style="
                display:flex;
                justify-content:space-between;
                padding:6px 0;
                color:#198754;
              "
            >

              <span>
                Discount
              </span>

              <strong>
                -${formatMoney(
                  discount
                )}
              </strong>

            </div>
          `
          : ""
      }


      <!-- COUPON -->

      ${
        couponCode
          ? `
            <div
              style="
                padding:6px 0;
                color:#198754;
                font-size:12px;
              "
            >

              Coupon:

              <strong>
                ${escapeHtml(
                  couponCode
                )}
              </strong>

            </div>
          `
          : ""
      }


      <!-- PRODUCT AFTER DISCOUNT -->

      <div
        style="
          display:flex;
          justify-content:space-between;
          padding:6px 0;
          color:#555;
        "
      >

        <span>
          Product After Discount
        </span>

        <strong>
          ${formatMoney(
            productAmountAfterDiscount
          )}
        </strong>

      </div>


      <!-- SHIPPING -->

      <div
        style="
          display:flex;
          justify-content:space-between;
          padding:6px 0;
          color:#555;
        "
      >

        <span>
          Shipping
        </span>

        <strong>
          ${
            shippingCharge === 0
              ? "FREE"
              : formatMoney(
                  shippingCharge
                )
          }
        </strong>

      </div>


      <!-- TOTAL BEFORE TAX -->

      <div
        style="
          margin-top:8px;
          padding:10px;
          border-radius:7px;
          background:#fff8ed;
          border:1px solid #ead7b3;
          display:flex;
          justify-content:space-between;
          color:#333;
        "
      >

        <span>
          <strong>
            Total Amount Before Tax
          </strong>
        </span>

        <strong>
          ${formatMoney(
            totalAmountBeforeTax
          )}
        </strong>

      </div>


      <!-- GST SECTION -->

      <div
        style="
          margin-top:10px;
          padding:10px;
          border:1px solid #eee;
          border-radius:7px;
          background:#ffffff;
        "
      >

        ${
          isInterState
            ? `
              <div
                style="
                  display:flex;
                  justify-content:space-between;
                  padding:5px 0;
                  color:#555;
                "
              >

                <span>
                  IGST ${
                    Number(
                      gst.igstRate ||
                        GST_RATE
                    )
                  }%
                </span>

                <strong>
                  ${formatMoney(
                    igst
                  )}
                </strong>

              </div>
            `
            : `
              <div
                style="
                  display:flex;
                  justify-content:space-between;
                  padding:5px 0;
                  color:#555;
                "
              >

                <span>
                  CGST ${
                    Number(
                      gst.cgstRate ||
                        CGST_RATE
                    )
                  }%
                </span>

                <strong>
                  ${formatMoney(
                    cgst
                  )}
                </strong>

              </div>


              <div
                style="
                  display:flex;
                  justify-content:space-between;
                  padding:5px 0;
                  color:#555;
                "
              >

                <span>
                  SGST ${
                    Number(
                      gst.sgstRate ||
                        SGST_RATE
                    )
                  }%
                </span>

                <strong>
                  ${formatMoney(
                    sgst
                  )}
                </strong>

              </div>
            `
        }


        <div
          style="
            display:flex;
            justify-content:space-between;
            padding:6px 0 2px;
            margin-top:4px;
            border-top:1px solid #eee;
            font-weight:bold;
            color:#333;
          "
        >

          <span>
            Total GST
          </span>

          <strong>
            ${formatMoney(
              totalGST
            )}
          </strong>

        </div>

      </div>


      <!-- GRAND TOTAL -->

      <div
        style="
          border-top:2px solid #8f3424;
          margin-top:12px;
          padding-top:12px;
          display:flex;
          justify-content:space-between;
          font-size:18px;
          font-weight:bold;
          color:#8f3424;
        "
      >

        <span>
          Grand Total
        </span>

        <span>
          ${formatMoney(
            finalAmount
          )}
        </span>

      </div>


      <!-- GST NOTE -->

      <div
        style="
          margin-top:8px;
          font-size:11px;
          color:#888;
          text-align:right;
        "
      >

        GST @ 5% added on total amount
        after discount + shipping.

      </div>

    </div>


    <!-- PAYMENT -->

    <div
      style="
        margin-top:24px;
        padding:12px;
        background:#fafafa;
        border:1px solid #eee;
        border-radius:8px;
        font-size:13px;
      "
    >

      <div
        style="
          display:flex;
          justify-content:space-between;
        "
      >

        <span>
          Payment Method
        </span>

        <strong>
          ${escapeHtml(
            order?.payment?.method ||
              order?.paymentMethod ||
              "COD"
          )}
        </strong>

      </div>

    </div>


    <!-- PDF NOTICE -->

    <div
      style="
        margin-top:25px;
        padding:12px;
        background:#f7f1ec;
        border-left:4px solid #d39a38;
        font-size:13px;
        color:#555;
      "
    >

      Your GST invoice is attached to this
      email as a PDF.

    </div>


    <!-- FOOTER -->

    <div
      style="
        margin-top:30px;
        padding-top:18px;
        border-top:1px solid #eee;
        text-align:center;
        color:#777;
        font-size:12px;
      "
    >

      Thank you for shopping with

      <strong>
        Vraj Creation
      </strong>.

      <br/>

      We appreciate your order.

    </div>

  </div>

</div>

</body>

</html>
  `;
};

// =====================================================
// SEND ADMIN ORDER EMAIL
// =====================================================

const sendAdminOrderEmail =
  async (
    order,
    attachments = []
  ) => {
    if (
      !ADMIN_ORDER_EMAIL
    ) {
      console.warn(
        "ADMIN_ORDER_EMAIL is not configured."
      );

      return {
        success: false,

        skipped: true,

        reason:
          "ADMIN_ORDER_EMAIL not configured",
      };
    }

    const orderNumber =
      order?.orderNumber ||
      "New Order";

    try {
      const info =
        await transporter.sendMail(
          {
            from:
              EMAIL_FROM,

            to:
              ADMIN_ORDER_EMAIL,

            subject:
              `New Vraj Creation Order - ${orderNumber}`,

            html:
              createOrderHtml(
                order,
                {
                  recipientType:
                    "admin",
                }
              ),

            attachments:
              attachments,
          }
        );

      console.log(
        "Admin order email sent:",
        info.messageId
      );

      return {
        success: true,

        messageId:
          info.messageId,
      };
    } catch (error) {
      console.error(
        "Admin order email failed:",
        error.message
      );

      return {
        success: false,

        error:
          error.message,
      };
    }
  };

// =====================================================
// SEND CUSTOMER ORDER EMAIL
// =====================================================

const sendCustomerOrderEmail =
  async (
    order,
    attachments = []
  ) => {
    const customerEmail =
      order?.customer?.email;

    if (
      !customerEmail
    ) {
      console.warn(
        "Customer email not found."
      );

      return {
        success: false,

        skipped: true,

        reason:
          "Customer email not found",
      };
    }

    const orderNumber =
      order?.orderNumber ||
      "Order";

    try {
      const info =
        await transporter.sendMail(
          {
            from:
              EMAIL_FROM,

            to:
              customerEmail,

            subject:
              `Vraj Creation Order Confirmation - ${orderNumber}`,

            html:
              createOrderHtml(
                order,
                {
                  recipientType:
                    "customer",
                }
              ),

            attachments:
              attachments,
          }
        );

      console.log(
        "Customer order email sent:",
        info.messageId
      );

      return {
        success: true,

        messageId:
          info.messageId,
      };
    } catch (error) {
      console.error(
        "Customer order email failed:",
        error.message
      );

      return {
        success: false,

        error:
          error.message,
      };
    }
  };

// =====================================================
// SEND BOTH EMAILS + GST PDF
// =====================================================

const sendOrderEmails =
  async (
    order
  ) => {
    let attachments = [];

    let invoiceResult =
      null;

    let invoiceFilePath =
      null;

    // ---------------------------------------------------
    // GENERATE GST PDF
    // ---------------------------------------------------

    try {
      invoiceResult =
        await generateGSTInvoicePDF(
          order
        );

      if (
        !invoiceResult ||
        !invoiceResult.success ||
        !invoiceResult.filePath
      ) {
        throw new Error(
          "GST invoice generator did not return a valid PDF file."
        );
      }

      invoiceFilePath =
        invoiceResult.filePath;

      // -------------------------------------------------
      // IMPORTANT:
      // Use PATH, not content/buffer.
      // -------------------------------------------------

      attachments = [
        {
          filename:
            invoiceResult.filename,

          path:
            invoiceResult.filePath,

          contentType:
            "application/pdf",
        },
      ];

      console.log(
        "=============================================="
      );

      console.log(
        "GST invoice ready for email"
      );

      console.log(
        "Filename:",
        invoiceResult.filename
      );

      console.log(
        "Path:",
        invoiceResult.filePath
      );

      console.log(
        "Invoice Number:",
        invoiceResult.invoiceNumber
      );

      console.log(
        "=============================================="
      );
    } catch (error) {
      console.error(
        "GST invoice PDF generation failed:",
        error.message
      );

      attachments = [];

      invoiceResult =
        null;
    }

    // ---------------------------------------------------
    // SEND BOTH EMAILS
    // ---------------------------------------------------

    const [
      adminResult,
      customerResult,
    ] =
      await Promise.all([
        sendAdminOrderEmail(
          order,
          attachments
        ),

        sendCustomerOrderEmail(
          order,
          attachments
        ),
      ]);

    // ---------------------------------------------------
    // CLEAN TEMP PDF
    // ---------------------------------------------------

    if (
      invoiceFilePath
    ) {
      try {
        await deleteInvoicePDF(
          invoiceFilePath
        );
      } catch (error) {
        console.error(
          "Temporary invoice PDF deletion failed:",
          error.message
        );
      }
    }

    // ---------------------------------------------------
    // RESULT
    // ---------------------------------------------------

    return {
      success:
        adminResult.success ||
        customerResult.success,

      invoice:
        invoiceResult
          ? {
              success:
                true,

              filename:
                invoiceResult.filename,

              invoiceNumber:
                invoiceResult.invoiceNumber,

              fileSize:
                invoiceResult.fileSize,
            }
          : {
              success:
                false,

              error:
                "Invoice PDF could not be generated",
            },

      admin:
        adminResult,

      customer:
        customerResult,
    };
  };

// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  transporter,

  verifyEmailConnection,

  createItemsHtml,

  createOrderHtml,

  sendAdminOrderEmail,

  sendCustomerOrderEmail,

  sendOrderEmails,

  // HSN helpers
  normalizeHSNCode,

  getDefaultHSNCode,

  getItemHSNCode,
};
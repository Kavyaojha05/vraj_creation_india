import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiCheck,
  FiShoppingBag,
  FiHome,
  FiPackage,
  FiCreditCard,
  FiMapPin,
  FiPhone,
  FiMail,
  FiTruck,
} from "react-icons/fi";

const BUSINESS_STATE = "Rajasthan";

const GST_RATE = 5;
const CGST_RATE = 2.5;
const SGST_RATE = 2.5;

const money = (value) => {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "0";
  }

  return number.toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
};

const round2 = (value) =>
  Number(Number(value || 0).toFixed(2));

const getItemImage = (item) => {
  return (
    item?.image ||
    item?.productImage ||
    item?.images?.[0] ||
    ""
  );
};

const getItemName = (item) => {
  return (
    item?.name ||
    item?.productName ||
    item?.title ||
    "Product"
  );
};

const getItemPrice = (item) => {
  return Number(
    item?.price ??
      item?.sellingPrice ??
      item?.salePrice ??
      0
  );
};

const getItemQuantity = (item) => {
  return Math.max(
    1,
    Number(
      item?.quantity ??
        item?.qty ??
        1
    )
  );
};

const getItemWeight = (item) => {
  return Number(
    item?.weightGrams ??
      item?.weight ??
      item?.product?.weightGrams ??
      500
  );
};

const normalizeState = (state = "") =>
  String(state)
    .trim()
    .toLowerCase();


// =====================================================
// GST CALCULATION
// =====================================================
// IMPORTANT:
//
// GST IS ADDED ON TOP OF THE TOTAL AMOUNT BEFORE TAX.
//
// Example:
//
// Product Amount After Discount = ₹600
// Shipping                       = ₹60
// --------------------------------
// Total Before Tax               = ₹660
//
// GST 5%                         = ₹33
// --------------------------------
// Grand Total                    = ₹693
//
// Product price is NEVER reduced
// to extract GST.
// =====================================================

const calculateGST = (
  totalAmountBeforeTax,
  customerState
) => {
  const baseAmount = round2(
    Math.max(
      0,
      Number(
        totalAmountBeforeTax || 0
      )
    )
  );

  const sellerState = normalizeState(
    BUSINESS_STATE
  );

  const buyerState = normalizeState(
    customerState || BUSINESS_STATE
  );

  const isInterState =
    sellerState !== buyerState;

  const totalGST = round2(
    baseAmount *
      (GST_RATE / 100)
  );

  let cgst = 0;
  let sgst = 0;
  let igst = 0;

  if (isInterState) {
    // Outside Rajasthan
    igst = totalGST;
  } else {
    // Within Rajasthan
    cgst = round2(
      totalGST / 2
    );

    sgst = round2(
      totalGST - cgst
    );
  }

  const finalAmount = round2(
    baseAmount + totalGST
  );

  return {
    // New GST-exclusive fields
    baseAmount,
    taxableAmount: baseAmount,
    taxableValue: baseAmount,
    totalAmountBeforeTax: baseAmount,

    // GST
    totalGST,
    cgst,
    sgst,
    igst,

    cgstRate: isInterState
      ? 0
      : CGST_RATE,

    sgstRate: isInterState
      ? 0
      : SGST_RATE,

    igstRate: isInterState
      ? GST_RATE
      : 0,

    rate: GST_RATE,

    isInterState,

    sellerState: BUSINESS_STATE,

    customerState:
      customerState ||
      BUSINESS_STATE,

    pricingMode:
      "gst_exclusive",

    // Final amount after GST
    amountWithGST:
      finalAmount,

    finalAmount,
  };
};


const OrderSuccess = () => {
  const [order, setOrder] = useState(null);
  const [visible, setVisible] =
    useState(false);

  // =====================================================
  // LOAD ORDER
  // =====================================================

  useEffect(() => {
    try {
      const savedOrder =
        sessionStorage.getItem(
          "vraj_order"
        );

      if (savedOrder) {
        const parsedOrder =
          JSON.parse(savedOrder);

        setOrder(parsedOrder);
      }
    } catch (error) {
      console.error(
        "Order loading error:",
        error
      );
    }

    const timer = setTimeout(() => {
      setVisible(true);
    }, 100);

    return () =>
      clearTimeout(timer);
  }, []);


  // =====================================================
  // NORMALIZE ORDER
  // =====================================================

  const normalizedOrder =
    useMemo(() => {
      if (!order) {
        return null;
      }

      const pricing =
        order?.pricing || {};

      const items =
        Array.isArray(order?.items)
          ? order.items
          : [];


      // -------------------------------------------------
      // PRODUCT TOTAL
      // -------------------------------------------------

      const subtotal = round2(
        Number(
          pricing?.subtotal ??
            order?.subtotal ??
            items.reduce(
              (total, item) =>
                total +
                getItemPrice(item) *
                  getItemQuantity(item),
              0
            )
        )
      );


      // -------------------------------------------------
      // DISCOUNT
      // -------------------------------------------------

      const discount = round2(
        Number(
          pricing?.discount ??
            pricing?.couponDiscount ??
            order?.discount ??
            0
        )
      );


      // -------------------------------------------------
      // PRODUCT AMOUNT AFTER DISCOUNT
      // -------------------------------------------------

      const productAmountAfterDiscount =
        round2(
          Math.max(
            0,
            subtotal - discount
          )
        );


      // -------------------------------------------------
      // SHIPPING
      // -------------------------------------------------

      const shipping = round2(
        Number(
          order?.shipping?.charge ??
            pricing?.shipping ??
            order?.shippingCharge ??
            0
        )
      );


      // -------------------------------------------------
      // CUSTOMER STATE
      // -------------------------------------------------

      const customerState =
        String(
          order?.customer?.state ||
            order?.gst
              ?.customerState ||
            order?.shipping?.state ||
            BUSINESS_STATE
        ).trim();


      // -------------------------------------------------
      // SAVED GST
      // -------------------------------------------------

      const savedGST =
        order?.gst || {};

      const savedCGST = round2(
        Number(
          savedGST?.cgst || 0
        )
      );

      const savedSGST = round2(
        Number(
          savedGST?.sgst || 0
        )
      );

      const savedIGST = round2(
        Number(
          savedGST?.igst || 0
        )
      );

      const savedTotalGST =
        round2(
          Number(
            savedGST?.totalGST ??
              savedGST?.gstAmount ??
              savedCGST +
                savedSGST +
                savedIGST
          )
        );


      // -------------------------------------------------
      // SAVED TOTAL BEFORE TAX
      // -------------------------------------------------

      const savedTotalBeforeTax =
        round2(
          Number(
            savedGST
              ?.totalAmountBeforeTax ??
              savedGST?.taxableValue ??
              savedGST?.taxableAmount ??
              pricing
                ?.totalAmountBeforeTax ??
              order?.totalAmountBeforeTax ??
              productAmountAfterDiscount +
                shipping
          )
        );


      // -------------------------------------------------
      // CHECK WHETHER SAVED GST EXISTS
      // -------------------------------------------------

      const hasValidSavedGST =
        savedTotalGST > 0 ||
        savedCGST > 0 ||
        savedSGST > 0 ||
        savedIGST > 0;


      // -------------------------------------------------
      // GST DATA
      // -------------------------------------------------

      const calculatedGST =
        hasValidSavedGST
          ? {
              baseAmount:
                savedTotalBeforeTax,

              taxableAmount:
                savedTotalBeforeTax,

              taxableValue:
                savedTotalBeforeTax,

              totalAmountBeforeTax:
                savedTotalBeforeTax,

              totalGST:
                savedTotalGST,

              cgst:
                savedCGST,

              sgst:
                savedSGST,

              igst:
                savedIGST,

              cgstRate: Number(
                savedGST?.cgstRate ??
                  (savedCGST > 0
                    ? CGST_RATE
                    : 0)
              ),

              sgstRate: Number(
                savedGST?.sgstRate ??
                  (savedSGST > 0
                    ? SGST_RATE
                    : 0)
              ),

              igstRate: Number(
                savedGST?.igstRate ??
                  (savedIGST > 0
                    ? GST_RATE
                    : 0)
              ),

              isInterState:
                Boolean(
                  savedGST?.isInterState ||
                    savedIGST > 0
                ),

              sellerState:
                savedGST?.sellerState ||
                BUSINESS_STATE,

              customerState:
                savedGST?.customerState ||
                customerState,

              rate: Number(
                savedGST?.rate ??
                  GST_RATE
              ),

              pricingMode:
                savedGST?.pricingMode ||
                "gst_exclusive",

              amountWithGST:
                round2(
                  savedTotalBeforeTax +
                    savedTotalGST
                ),

              finalAmount:
                round2(
                  savedTotalBeforeTax +
                    savedTotalGST
                ),
            }
          : calculateGST(
              productAmountAfterDiscount +
                shipping,
              customerState
            );


      // -------------------------------------------------
      // FINAL AMOUNT
      // -------------------------------------------------

      const calculatedFinalAmount =
        round2(
          Math.max(
            0,
            calculatedGST
              .totalAmountBeforeTax +
              calculatedGST.totalGST
          )
        );


      return {
        ...order,

        items,

        pricing: {
          ...pricing,

          subtotal,

          discount,

          // Product amount after discount
          productAmountAfterDiscount,

          // IMPORTANT:
          // This is now TOTAL BEFORE TAX,
          // including shipping.
          taxableAmount:
            calculatedGST.taxableAmount,

          taxableValue:
            calculatedGST.taxableValue,

          totalAmountBeforeTax:
            calculatedGST
              .totalAmountBeforeTax,

          shipping,

          totalGST:
            calculatedGST.totalGST,

          finalAmount:
            calculatedFinalAmount,
        },

        gst: calculatedGST,
      };
    }, [order]);


  // =====================================================
  // ORDER NOT FOUND
  // =====================================================

  if (!normalizedOrder) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 px-4 py-16 text-gray-900">
        <div className="mx-auto max-w-xl text-center">

          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border border-[#dca34f]/30 bg-[#dca34f]/10">
            <FiPackage
              size={42}
              className="text-[#b7791f]"
            />
          </div>

          <h1 className="mt-7 text-3xl font-black">
            Order Details Not Found
          </h1>

          <p className="mt-3 text-gray-500">
            We could not find your recent
            order details.
          </p>

          <Link
            to="/#categorys"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[#8f3424] px-6 py-3 font-semibold text-white shadow-lg shadow-[#8f3424]/20 transition hover:-translate-y-0.5 hover:bg-[#a63d2a]"
          >
            <FiShoppingBag />
            Continue Shopping
          </Link>

        </div>
      </div>
    );
  }


  // =====================================================
  // ORDER DATA
  // =====================================================

  const {
    customer = {},
    items = [],
    pricing = {},
    payment = {},
    shipping = {},
    gst = {},
  } = normalizedOrder;


  // =====================================================
  // ORDER NUMBER
  // =====================================================

  const orderNumber =
    normalizedOrder?.orderNumber ||
    normalizedOrder?._id ||
    "VRAJ-ORDER";


  // =====================================================
  // TOTAL ITEMS
  // =====================================================

  const totalItems =
    Number(
      normalizedOrder?.totalItems
    ) ||
    items.reduce(
      (total, item) =>
        total +
        getItemQuantity(item),
      0
    );


  // =====================================================
  // PAYMENT METHOD
  // =====================================================

  const paymentMethod =
    String(
      payment?.method ||
        normalizedOrder?.paymentMethod ||
        "cod"
    ).toLowerCase();


  const paymentLabel =
    paymentMethod === "upi" ||
    paymentMethod === "prepaid"
      ? "UPI / Online Payment"
      : "Cash on Delivery";


  // =====================================================
  // PRODUCT TOTAL
  // =====================================================

  const subtotal = round2(
    Number(
      pricing?.subtotal || 0
    )
  );


  // =====================================================
  // DISCOUNT
  // =====================================================

  const discount = round2(
    Number(
      pricing?.discount || 0
    )
  );


  // =====================================================
  // PRODUCT AMOUNT AFTER DISCOUNT
  // =====================================================

  const productAmountAfterDiscount =
    round2(
      Math.max(
        0,
        subtotal - discount
      )
    );


  // =====================================================
  // SHIPPING
  // =====================================================

  const shippingCharge =
    round2(
      Number(
        pricing?.shipping ??
          shipping?.charge ??
          normalizedOrder
            ?.shippingCharge ??
          0
      )
    );


  // =====================================================
  // TOTAL AMOUNT BEFORE TAX
  // =====================================================

  const totalAmountBeforeTax =
    round2(
      Number(
        pricing
          ?.totalAmountBeforeTax ??
          gst?.totalAmountBeforeTax ??
          gst?.taxableValue ??
          gst?.taxableAmount ??
          productAmountAfterDiscount +
            shippingCharge
      )
    );


  // =====================================================
  // GST
  // =====================================================

  const totalGST = round2(
    Number(
      gst?.totalGST ??
        pricing?.totalGST ??
        0
    )
  );


  const cgst = round2(
    Number(
      gst?.cgst || 0
    )
  );


  const sgst = round2(
    Number(
      gst?.sgst || 0
    )
  );


  const igst = round2(
    Number(
      gst?.igst || 0
    )
  );


  // =====================================================
  // FINAL AMOUNT
  // =====================================================

  const calculatedTotal =
    round2(
      Math.max(
        0,
        totalAmountBeforeTax +
          totalGST
      )
    );

  const finalAmount =
    round2(
      Number(
        pricing?.finalAmount ??
          gst?.finalAmount ??
          calculatedTotal
      )
    );


  // =====================================================
  // WEIGHT
  // =====================================================

  const totalWeight =
    items.reduce(
      (total, item) =>
        total +
        getItemWeight(item) *
          getItemQuantity(item),
      0
    );


  const billableWeight =
    Number(
      shipping
        ?.billableWeightGrams ??
        shipping?.weightGrams ??
        totalWeight
    );


  // =====================================================
  // SHIPPING CHARGES
  // =====================================================

  const weightCharge =
    Number(
      shipping?.weightCharge || 0
    );

  const zoneCharge =
    Number(
      shipping?.zoneCharge || 0
    );


  const isFreeShipping =
    Boolean(
      shipping?.isFree ||
        shippingCharge === 0
    );


  // =====================================================
  // INTER STATE
  // =====================================================

  const isInterState =
    Boolean(
      gst?.isInterState ||
        igst > 0
    );


  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-orange-50 via-white to-amber-50 px-4 py-10 text-gray-900 sm:px-6 lg:px-8">

      <div className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-[#8f3424]/10 blur-[120px]" />

      <div className="pointer-events-none absolute bottom-0 left-0 h-[280px] w-[280px] rounded-full bg-[#dca34f]/10 blur-[100px]" />


      <div
        className={`relative mx-auto max-w-4xl transition-all duration-1000 ${
          visible
            ? "translate-y-0 opacity-100"
            : "translate-y-8 opacity-0"
        }`}
      >

        {/* =================================================
            SUCCESS ICON
        ================================================= */}

        <div className="flex justify-center">

          <div className="relative">

            <div className="absolute inset-0 animate-ping rounded-full bg-green-500/10" />

            <div className="relative flex h-28 w-28 animate-[float_3s_ease-in-out_infinite] items-center justify-center rounded-full border border-green-400/30 bg-gradient-to-br from-green-100 to-green-50 shadow-[0_0_70px_rgba(34,197,94,0.15)]">

              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-500 shadow-lg shadow-green-500/30">

                <FiCheck
                  size={42}
                  strokeWidth={3}
                  className="animate-[scaleIn_0.6s_ease-out] text-white"
                />

              </div>

            </div>

          </div>

        </div>


        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mt-8 text-center">

          <p className="text-sm font-bold uppercase tracking-[0.35em] text-[#b7791f]">
            Vraj Creation
          </p>

          <h1 className="mt-3 text-4xl font-black tracking-tight text-gray-900 sm:text-5xl">
            Thank You!
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-gray-500 sm:text-lg">
            Your order has been placed successfully.
            We have received your order details and
            will process it shortly.
          </p>

          <div className="mx-auto mt-6 inline-flex items-center gap-2 rounded-full border border-[#dca34f]/30 bg-[#dca34f]/10 px-5 py-2.5">

            <FiPackage className="text-[#b7791f]" />

            <span className="text-sm text-gray-500">
              Order
            </span>

            <span className="text-sm font-bold text-[#8f3424]">
              #{orderNumber}
            </span>

          </div>

        </div>


        {/* =================================================
            ORDER CARD
        ================================================= */}

        <div className="mt-10 overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-xl shadow-gray-200/60">

          {/* HEADER */}

          <div className="border-b border-gray-200 bg-gradient-to-r from-[#8f3424]/10 via-white to-[#dca34f]/10 px-5 py-5 sm:px-7">

            <div className="flex items-center justify-between gap-4">

              <div className="flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#8f3424]/10 text-[#8f3424]">
                  <FiShoppingBag size={21} />
                </div>

                <div>

                  <h2 className="font-bold text-gray-900">
                    Your Order
                  </h2>

                  <p className="text-xs text-gray-500">
                    {totalItems}{" "}
                    {totalItems === 1
                      ? "item"
                      : "items"}
                  </p>

                </div>

              </div>

              <div className="text-right">

                <p className="text-xs text-gray-500">
                  Total
                </p>

                <p className="text-xl font-black text-[#b7791f]">
                  ₹{money(finalAmount)}
                </p>

              </div>

            </div>

          </div>


          {/* =================================================
              PRODUCTS
          ================================================= */}

          <div className="divide-y divide-gray-100">

            {items.map(
              (item, index) => {

                const image =
                  getItemImage(item);

                const name =
                  getItemName(item);

                const quantity =
                  getItemQuantity(item);

                const price =
                  getItemPrice(item);

                const itemTotal =
                  price * quantity;

                return (
                  <div
                    key={
                      item?.productId ||
                      item?.sku ||
                      index
                    }
                    className="group flex gap-4 p-5 transition hover:bg-orange-50/40 sm:px-7"
                  >

                    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-gray-200 bg-gray-50">

                      {image ? (
                        <img
                          src={image}
                          alt={name}
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-gray-400">
                          <FiShoppingBag size={25} />
                        </div>
                      )}

                    </div>


                    <div className="min-w-0 flex-1">

                      <h3 className="font-bold uppercase tracking-wide text-gray-800">
                        {name}
                      </h3>

                      <p className="mt-2 text-sm text-gray-500">
                        Quantity:{" "}
                        {quantity}
                      </p>

                      <p className="mt-1 text-sm text-gray-500">
                        ₹{money(price)} ×{" "}
                        {quantity}
                      </p>

                    </div>


                    <div className="self-center text-right">

                      <p className="text-lg font-bold text-gray-900">
                        ₹{money(itemTotal)}
                      </p>

                    </div>

                  </div>
                );
              }
            )}

          </div>


          {/* =================================================
              PRICE SUMMARY
          ================================================= */}

          <div className="border-t border-gray-200 bg-gray-50/70 px-5 py-6 sm:px-7">

            <div className="ml-auto max-w-sm space-y-3">

              {/* PRODUCT TOTAL */}

              <div className="flex justify-between text-sm">

                <span className="text-gray-500">
                  Product Total
                </span>

                <span className="text-gray-800">
                  ₹{money(subtotal)}
                </span>

              </div>


              {/* DISCOUNT */}

              {discount > 0 && (
                <div className="flex justify-between text-sm">

                  <span className="text-green-600">
                    Discount
                  </span>

                  <span className="font-semibold text-green-600">
                    -₹{money(discount)}
                  </span>

                </div>
              )}


              {/* PRODUCT AFTER DISCOUNT */}

              <div className="flex justify-between text-sm">

                <span className="text-gray-500">
                  Product Amount After Discount
                </span>

                <span className="font-semibold text-gray-800">
                  ₹{money(
                    productAmountAfterDiscount
                  )}
                </span>

              </div>


              {/* SHIPPING */}

              <div className="flex justify-between text-sm">

                <span className="flex items-center gap-2 text-gray-500">
                  <FiTruck />
                  Shipping
                </span>

                <span
                  className={
                    isFreeShipping
                      ? "font-semibold text-green-600"
                      : "font-semibold text-gray-800"
                  }
                >
                  {isFreeShipping
                    ? "FREE"
                    : `₹${money(
                        shippingCharge
                      )}`}
                </span>

              </div>


              {/* TOTAL BEFORE TAX */}

              <div className="rounded-xl border border-[#dca34f]/30 bg-[#dca34f]/10 p-3">

                <div className="flex items-center justify-between text-sm">

                  <span className="font-semibold text-gray-700">
                    Total Amount Before Tax
                  </span>

                  <span className="font-bold text-gray-900">
                    ₹{money(
                      totalAmountBeforeTax
                    )}
                  </span>

                </div>

                <p className="mt-1 text-xs leading-5 text-gray-500">
                  Product amount after discount + shipping
                </p>

              </div>


              {/* GST */}

              <div className="rounded-xl border border-gray-200 bg-white p-3">

                {isInterState ? (

                  <div className="flex items-center justify-between text-sm">

                    <span className="text-gray-500">
                      IGST{" "}
                      {Number(
                        gst?.igstRate ||
                          GST_RATE
                      )}
                      %
                    </span>

                    <span className="font-semibold text-gray-800">
                      ₹{money(igst)}
                    </span>

                  </div>

                ) : (

                  <div className="space-y-2">

                    <div className="flex items-center justify-between text-sm">

                      <span className="text-gray-500">
                        CGST{" "}
                        {Number(
                          gst?.cgstRate ||
                            CGST_RATE
                        )}
                        %
                      </span>

                      <span className="font-semibold text-gray-800">
                        ₹{money(cgst)}
                      </span>

                    </div>


                    <div className="flex items-center justify-between text-sm">

                      <span className="text-gray-500">
                        SGST{" "}
                        {Number(
                          gst?.sgstRate ||
                            SGST_RATE
                        )}
                        %
                      </span>

                      <span className="font-semibold text-gray-800">
                        ₹{money(sgst)}
                      </span>

                    </div>

                  </div>

                )}

              </div>


              {/* TOTAL GST */}

              <div className="flex justify-between text-sm">

                <span className="text-gray-500">
                  Total GST
                </span>

                <span className="font-semibold text-gray-800">
                  ₹{money(totalGST)}
                </span>

              </div>


              {/* WEIGHT */}

              <div className="rounded-xl border border-gray-200 bg-white p-3">

                <div className="flex items-center justify-between text-sm">

                  <span className="text-gray-500">
                    Actual Weight
                  </span>

                  <span className="font-semibold">
                    {(
                      totalWeight /
                      1000
                    ).toFixed(2)}{" "}
                    kg
                  </span>

                </div>


                <div className="mt-2 flex items-center justify-between text-sm">

                  <span className="text-gray-500">
                    Billable Weight
                  </span>

                  <span className="font-semibold">
                    {(
                      billableWeight /
                      1000
                    ).toFixed(2)}{" "}
                    kg
                  </span>

                </div>


                {shipping?.zone && (
                  <div className="mt-2 flex items-center justify-between text-sm">

                    <span className="text-gray-500">
                      Delivery Zone
                    </span>

                    <span className="font-semibold">
                      {shipping.zone}
                    </span>

                  </div>
                )}


                {weightCharge > 0 && (
                  <div className="mt-2 flex items-center justify-between text-sm">

                    <span className="text-gray-500">
                      Weight Charge
                    </span>

                    <span>
                      ₹{money(
                        weightCharge
                      )}
                    </span>

                  </div>
                )}


                {zoneCharge > 0 && (
                  <div className="mt-2 flex items-center justify-between text-sm">

                    <span className="text-gray-500">
                      Zone Charge
                    </span>

                    <span>
                      ₹{money(
                        zoneCharge
                      )}
                    </span>

                  </div>
                )}

              </div>


              {/* GRAND TOTAL */}

              <div className="mt-4 flex items-center justify-between border-t border-gray-200 pt-5">

                <div>

                  <span className="text-lg font-bold text-gray-900">
                    Grand Total
                  </span>

                  <p className="mt-1 text-xs text-gray-500">
                    GST added after discount + shipping
                  </p>

                </div>

                <span className="text-3xl font-black text-[#b7791f]">
                  ₹{money(finalAmount)}
                </span>

              </div>


              {/* TAX NOTE */}

              <p className="pt-1 text-center text-xs leading-5 text-gray-400">
                GST @ 5% is calculated on the
                total amount after discount and
                shipping.
              </p>

            </div>

          </div>

        </div>


        {/* =================================================
            DELIVERY + PAYMENT
        ================================================= */}

        <div className="mt-6 grid gap-6 md:grid-cols-2">

          {/* DELIVERY */}

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-lg shadow-gray-100">

            <h3 className="flex items-center gap-2 font-bold text-gray-900">

              <FiMapPin className="text-[#b7791f]" />

              Delivery Details

            </h3>


            <div className="mt-4 space-y-3 text-sm">

              {customer?.fullName && (
                <div className="flex gap-3">

                  <FiShoppingBag className="mt-0.5 shrink-0 text-gray-400" />

                  <span className="text-gray-700">
                    {customer.fullName}
                  </span>

                </div>
              )}


              {customer?.mobile && (
                <div className="flex gap-3">

                  <FiPhone className="mt-0.5 shrink-0 text-gray-400" />

                  <span className="text-gray-700">
                    {customer.mobile}
                  </span>

                </div>
              )}


              {customer?.email && (
                <div className="flex gap-3">

                  <FiMail className="mt-0.5 shrink-0 text-gray-400" />

                  <span className="break-all text-gray-700">
                    {customer.email}
                  </span>

                </div>
              )}


              {customer?.address && (
                <div className="flex gap-3">

                  <FiMapPin className="mt-0.5 shrink-0 text-gray-400" />

                  <span className="leading-6 text-gray-700">

                    {customer.address}

                    {customer.city
                      ? `, ${customer.city}`
                      : ""}

                    {customer.state
                      ? `, ${customer.state}`
                      : ""}

                    {customer.pincode
                      ? ` - ${customer.pincode}`
                      : ""}

                  </span>

                </div>
              )}

            </div>

          </div>


          {/* PAYMENT */}

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-lg shadow-gray-100">

            <h3 className="flex items-center gap-2 font-bold text-gray-900">

              <FiCreditCard className="text-[#b7791f]" />

              Payment

            </h3>


            <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4">

              <div className="flex items-center justify-between">

                <span className="text-sm text-gray-500">
                  Method
                </span>

                <span className="font-semibold text-gray-800">
                  {paymentLabel}
                </span>

              </div>


              <div className="mt-3 flex items-center justify-between">

                <span className="text-sm text-gray-500">
                  Amount
                </span>

                <span className="font-bold text-[#b7791f]">
                  ₹{money(finalAmount)}
                </span>

              </div>


              {paymentMethod ===
                "cod" && (
                <div className="mt-4 rounded-lg bg-[#8f3424]/5 p-3 text-xs leading-5 text-gray-500">
                  Please keep the exact order
                  amount ready when your order
                  is delivered.
                </div>
              )}

            </div>

          </div>

        </div>


        {/* =================================================
            CONFIRMED
        ================================================= */}

        <div className="mt-7 flex flex-col items-center justify-center rounded-2xl border border-green-200 bg-green-50 px-5 py-5 text-center">

          <div className="flex items-center gap-2 text-green-600">

            <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-green-500" />

            <span className="font-semibold">
              Order Confirmed
            </span>

          </div>

          <p className="mt-2 max-w-lg text-sm leading-6 text-gray-500">
            Thank you for shopping with Vraj
            Creation. Your order is now being
            prepared.
          </p>

        </div>


        {/* =================================================
            BUTTONS
        ================================================= */}

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">

          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-7 py-3.5 font-semibold text-gray-700 shadow-sm transition hover:-translate-y-0.5 hover:border-[#dca34f] hover:text-[#8f3424]"
          >
            <FiHome />
            Back to Home
          </Link>


          <Link
            to="/#categorys"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#8f3424] px-7 py-3.5 font-semibold text-white shadow-lg shadow-[#8f3424]/20 transition hover:-translate-y-0.5 hover:bg-[#a63d2a] hover:shadow-xl"
          >
            <FiShoppingBag />
            Continue Shopping
          </Link>

        </div>


        {/* =================================================
            FOOTER
        ================================================= */}

        <p className="mt-8 text-center text-xs text-gray-400">
          Thank you for choosing Vraj Creation —
          Traditional Craft, Beautifully Made.
        </p>

      </div>


      {/* =================================================
          ANIMATIONS
      ================================================= */}

      <style>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0);
          }

          50% {
            transform: translateY(-7px);
          }
        }

        @keyframes scaleIn {
          0% {
            transform: scale(0.3);
            opacity: 0;
          }

          70% {
            transform: scale(1.12);
            opacity: 1;
          }

          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>

    </div>
  );
};

export default OrderSuccess;
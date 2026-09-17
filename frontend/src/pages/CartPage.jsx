import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  FiArrowLeft,
  FiMinus,
  FiPlus,
  FiTrash2,
  FiShoppingBag,
  FiArrowRight,
  FiTag,
  FiX,
  FiTruck,
  FiShield,
  FiCheck,
} from "react-icons/fi";

import { useCart } from "../context/CartContext";
import { useDiscount } from "../context/DiscountContext";

// =====================================================
// HELPERS
// =====================================================

const getItemId = (item) => {
  return (
    item?.productId ||
    item?.sku ||
    item?._id ||
    item?.id
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
    item?.price ||
      item?.salePrice ||
      item?.sellingPrice ||
      0
  );
};

const getItemImage = (item) => {
  if (typeof item?.image === "string") {
    return item.image;
  }

  if (typeof item?.productImage === "string") {
    return item.productImage;
  }

  if (Array.isArray(item?.images)) {
    const firstImage = item.images[0];

    if (typeof firstImage === "string") {
      return firstImage;
    }

    if (firstImage?.url) {
      return firstImage.url;
    }
  }

  return "";
};

const getQuantity = (item) => {
  return Number(item?.quantity || item?.qty || 1);
};

// =====================================================
// CART PAGE
// =====================================================

const CartPage = () => {
  const {
    cartItems = [],
    items = [],
    removeFromCart,
    updateQuantity,
    clearCart,
  } = useCart();

  const {
    discountData,
    clearDiscount,
    isDiscountExpired,
  } = useDiscount();

  const cart = cartItems.length ? cartItems : items;

  // =====================================================
  // SUBTOTAL
  // =====================================================

  const subtotal = useMemo(() => {
    return cart.reduce((total, item) => {
      return (
        total +
        getItemPrice(item) * getQuantity(item)
      );
    }, 0);
  }, [cart]);

  // =====================================================
  // TOTAL ITEMS
  // =====================================================

  const totalItems = useMemo(() => {
    return cart.reduce((total, item) => {
      return total + getQuantity(item);
    }, 0);
  }, [cart]);

  // =====================================================
  // COUPON ELIGIBLE SUBTOTAL
  // =====================================================

  const eligibleSubtotal = useMemo(() => {
    if (!discountData) return 0;

    if (discountData.discountScope === "category") {
      const couponCategory = String(
        discountData.category || ""
      )
        .trim()
        .toLowerCase();

      if (!couponCategory) return 0;

      return cart.reduce((total, item) => {
        const productCategory = String(
          item?.category || ""
        )
          .trim()
          .toLowerCase();

        if (productCategory !== couponCategory) {
          return total;
        }

        return (
          total +
          getItemPrice(item) * getQuantity(item)
        );
      }, 0);
    }

    return subtotal;
  }, [cart, subtotal, discountData]);

  // =====================================================
  // COUPON DISCOUNT
  // =====================================================

  const couponDiscount = useMemo(() => {
    if (!discountData) return 0;

    if (isDiscountExpired()) return 0;

    const percentage = Number(
      discountData.discount || 0
    );

    if (
      !Number.isFinite(percentage) ||
      percentage <= 0
    ) {
      return 0;
    }

    const minimumOrderAmount = Number(
      discountData.minOrderAmount || 0
    );

    if (subtotal < minimumOrderAmount) {
      return 0;
    }

    if (eligibleSubtotal <= 0) {
      return 0;
    }

    let discount =
      (eligibleSubtotal * percentage) / 100;

    const maxDiscount = Number(
      discountData.maxDiscount
    );

    if (
      Number.isFinite(maxDiscount) &&
      maxDiscount > 0
    ) {
      discount = Math.min(
        discount,
        maxDiscount
      );
    }

    discount = Math.min(
      discount,
      eligibleSubtotal
    );

    return Math.max(
      0,
      Number(discount.toFixed(2))
    );
  }, [
    discountData,
    subtotal,
    eligibleSubtotal,
    isDiscountExpired,
  ]);

  // =====================================================
  // FINAL TOTAL
  // =====================================================

  const finalTotal = useMemo(() => {
    return Math.max(
      0,
      subtotal - couponDiscount
    );
  }, [subtotal, couponDiscount]);

  // =====================================================
  // COUPON STATUS
  // =====================================================

  const couponMinimumNotReached =
    discountData &&
    Number(discountData.minOrderAmount || 0) >
      subtotal;

  const couponExpired =
    discountData &&
    isDiscountExpired();

  // =====================================================
  // CHANGE QUANTITY
  // =====================================================

  const changeQuantity = (
    item,
    newQuantity
  ) => {
    const id = getItemId(item);

    if (!id) return;

    if (newQuantity <= 0) {
      removeFromCart?.(id);
      return;
    }

    updateQuantity?.(
      id,
      newQuantity
    );
  };

  // =====================================================
  // EMPTY CART
  // =====================================================

  if (!cart.length) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-[#faf7f2] px-4 py-20 text-[#211c17]">

        {/* Background Decoration */}

        <div className="pointer-events-none absolute -left-32 top-20 h-72 w-72 animate-pulse rounded-full bg-[#dca34f]/10 blur-3xl" />

        <div className="pointer-events-none absolute -right-32 bottom-20 h-80 w-80 animate-pulse rounded-full bg-[#8f3424]/10 blur-3xl" />

        <div className="relative mx-auto max-w-2xl text-center">

          <div className="animate-[bounce_3s_ease-in-out_infinite]">
            <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full border border-[#dca34f]/20 bg-white shadow-xl shadow-[#dca34f]/10">

              <FiShoppingBag
                size={46}
                className="text-[#c18b32]"
              />

            </div>
          </div>

          <p className="mt-8 text-xs font-bold uppercase tracking-[0.3em] text-[#a66a26]">
            Vraj Creation
          </p>

          <h1 className="mt-3 text-3xl font-black sm:text-5xl">
            Your Cart is Empty
          </h1>

          <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-gray-500 sm:text-base">
            Discover beautiful handcrafted décor,
            artistic figurines and traditional Indian
            creations made to add character to your home.
          </p>

          <Link
            to="/gallery"
            className="group relative mt-8 inline-flex overflow-hidden items-center gap-2 rounded-full bg-[#8f3424] px-7 py-3.5 font-semibold text-white shadow-lg shadow-[#8f3424]/20 transition-all duration-300 hover:-translate-y-1 hover:bg-[#a63d2a] hover:shadow-xl"
          >
            <FiShoppingBag />

            <span>
              Continue Shopping
            </span>

            <FiArrowRight
              className="transition-transform duration-300 group-hover:translate-x-1"
            />

          </Link>

        </div>
      </div>
    );
  }

  // =====================================================
  // MAIN CART
  // =====================================================

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#faf7f2] px-4 py-8 text-[#211c17] sm:px-6 lg:px-8">

      {/* =================================================
          BACKGROUND DECORATIONS
      ================================================= */}

      <div className="pointer-events-none absolute -left-40 top-20 h-96 w-96 rounded-full bg-[#dca34f]/8 blur-3xl" />

      <div className="pointer-events-none absolute -right-40 top-[40%] h-[450px] w-[450px] rounded-full bg-[#8f3424]/6 blur-3xl" />

      <div className="relative mx-auto max-w-7xl">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-8 animate-[fadeInDown_0.7s_ease-out]">

          <Link
            to="/gallery"
            className="group inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-[#8f3424]"
          >
            <FiArrowLeft
              className="transition-transform duration-300 group-hover:-translate-x-1"
            />

            Continue Shopping
          </Link>

          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

            <div>

              <div className="mb-2 flex items-center gap-2">
                <span className="h-px w-8 bg-[#dca34f]" />

                <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#a66a26]">
                  Vraj Creation
                </span>
              </div>

              <h1 className="text-3xl font-black tracking-tight sm:text-5xl">
                Shopping Cart
              </h1>

              <p className="mt-2 text-sm text-gray-500">
                {totalItems}{" "}
                {totalItems === 1
                  ? "item"
                  : "items"}{" "}
                selected for your order
              </p>

            </div>

            <button
              type="button"
              onClick={() => clearCart?.()}
              className="group self-start inline-flex items-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-500 shadow-sm transition-all duration-300 hover:border-red-300 hover:bg-red-50 hover:shadow-md"
            >
              <FiTrash2
                size={15}
                className="transition-transform duration-300 group-hover:scale-110"
              />

              Clear Cart
            </button>

          </div>

        </div>

        {/* =================================================
            MAIN GRID
        ================================================= */}

        <div className="grid gap-7 lg:grid-cols-3">

          {/* =================================================
              CART ITEMS
          ================================================= */}

          <div className="space-y-4 lg:col-span-2">

            {cart.map((item, index) => {

              const id =
                getItemId(item) ||
                index;

              const name =
                getItemName(item);

              const price =
                getItemPrice(item);

              const quantity =
                getQuantity(item);

              const image =
                getItemImage(item);

              return (
                <div
                  key={id}
                  style={{
                    animationDelay: `${index * 100}ms`,
                  }}
                  className="group animate-[fadeInUp_0.6s_ease-out_both] rounded-2xl border border-[#e8dfd3] bg-white p-4 shadow-sm transition-all duration-500 hover:-translate-y-1 hover:border-[#dca34f]/40 hover:shadow-xl sm:p-5"
                >

                  <div className="flex gap-4 sm:gap-5">

                    {/* IMAGE */}

                    <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-[#f2ede6] sm:h-32 sm:w-32">

                      {image ? (
                        <img
                          src={image}
                          alt={name}
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[#c5b9aa]">
                          <FiShoppingBag
                            size={30}
                          />
                        </div>
                      )}

                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                    </div>

                    {/* PRODUCT */}

                    <div className="min-w-0 flex-1">

                      <div className="flex items-start justify-between gap-3">

                        <div className="min-w-0">

                          <h2 className="line-clamp-2 text-base font-bold leading-snug text-[#211c17] transition-colors duration-300 group-hover:text-[#8f3424] sm:text-lg">
                            {name}
                          </h2>

                          {item?.category && (
                            <p className="mt-1 text-xs font-medium uppercase tracking-wider text-gray-400">
                              {item.category}
                            </p>
                          )}

                        </div>

                        {/* MOBILE REMOVE */}

                        <button
                          type="button"
                          onClick={() =>
                            removeFromCart?.(id)
                          }
                          className="rounded-lg p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-500 sm:hidden"
                          aria-label="Remove product"
                        >
                          <FiX size={17} />
                        </button>

                      </div>

                      <p className="mt-2 text-base font-bold text-[#a66a26]">
                        ₹
                        {price.toLocaleString(
                          "en-IN"
                        )}
                      </p>

                      {/* QUANTITY */}

                      <div className="mt-4 flex items-center justify-between">

                        <div className="flex items-center overflow-hidden rounded-xl border border-[#e4dbcf] bg-[#faf8f5]">

                          <button
                            type="button"
                            onClick={() =>
                              changeQuantity(
                                item,
                                quantity - 1
                              )
                            }
                            className="flex h-9 w-9 items-center justify-center text-gray-600 transition-all duration-200 hover:bg-[#8f3424] hover:text-white active:scale-90"
                            aria-label="Decrease quantity"
                          >
                            <FiMinus size={14} />
                          </button>

                          <span className="flex h-9 min-w-11 items-center justify-center border-x border-[#e4dbcf] bg-white text-sm font-bold">
                            {quantity}
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              changeQuantity(
                                item,
                                quantity + 1
                              )
                            }
                            className="flex h-9 w-9 items-center justify-center text-gray-600 transition-all duration-200 hover:bg-[#8f3424] hover:text-white active:scale-90"
                            aria-label="Increase quantity"
                          >
                            <FiPlus size={14} />
                          </button>

                        </div>

                        {/* DESKTOP REMOVE */}

                        <button
                          type="button"
                          onClick={() =>
                            removeFromCart?.(id)
                          }
                          className="hidden items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-semibold text-gray-400 transition-all duration-300 hover:bg-red-50 hover:text-red-500 sm:flex"
                        >
                          <FiTrash2 size={15} />
                          Remove
                        </button>

                      </div>

                    </div>

                  </div>

                  {/* ITEM TOTAL */}

                  <div className="mt-4 flex items-center justify-between border-t border-[#eee7de] pt-3">

                    <span className="text-xs font-medium uppercase tracking-wider text-gray-400">
                      Item Total
                    </span>

                    <span className="text-sm font-bold text-[#211c17]">
                      ₹
                      {(
                        price *
                        quantity
                      ).toLocaleString(
                        "en-IN"
                      )}
                    </span>

                  </div>

                </div>
              );
            })}

            {/* =================================================
                TRUST FEATURES
            ================================================= */}

            <div className="grid grid-cols-1 gap-3 pt-2 sm:grid-cols-3">

              <div className="flex items-center gap-3 rounded-xl border border-[#e9e1d7] bg-white p-3.5 shadow-sm">
                <div className="rounded-lg bg-[#f7ead8] p-2 text-[#a66a26]">
                  <FiTruck size={17} />
                </div>

                <div>
                  <p className="text-xs font-bold">
                    Secure Delivery
                  </p>

                  <p className="text-[10px] text-gray-400">
                    Safe & reliable
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-xl border border-[#e9e1d7] bg-white p-3.5 shadow-sm">
                <div className="rounded-lg bg-[#f7ead8] p-2 text-[#a66a26]">
                  <FiShield size={17} />
                </div>

                <div>
                  <p className="text-xs font-bold">
                    Secure Checkout
                  </p>

                  <p className="text-[10px] text-gray-400">
                    Protected payment
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-xl border border-[#e9e1d7] bg-white p-3.5 shadow-sm">
                <div className="rounded-lg bg-[#f7ead8] p-2 text-[#a66a26]">
                  <FiCheck size={17} />
                </div>

                <div>
                  <p className="text-xs font-bold">
                    Handcrafted
                  </p>

                  <p className="text-[10px] text-gray-400">
                    Made with care
                  </p>
                </div>
              </div>

            </div>

          </div>

          {/* =================================================
              ORDER SUMMARY
          ================================================= */}

          <div>

            <div className="sticky top-6 overflow-hidden rounded-3xl border border-[#e7ddd1] bg-white shadow-xl shadow-[#6b4a2e]/5">

              {/* SUMMARY HEADER */}

              <div className="relative overflow-hidden bg-gradient-to-r from-[#211c17] to-[#493328] px-6 py-5 text-white">

                <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[#dca34f]/20 blur-xl" />

                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#e5b567]">
                  Vraj Creation
                </p>

                <h2 className="mt-1 text-xl font-bold">
                  Order Summary
                </h2>

              </div>

              <div className="p-5 sm:p-6">

                {/* =================================================
                    PRICE
                ================================================= */}

                <div className="space-y-3">

                  <div className="flex justify-between text-sm">

                    <span className="text-gray-500">
                      Items ({totalItems})
                    </span>

                    <span className="font-semibold text-[#211c17]">
                      ₹
                      {subtotal.toLocaleString(
                        "en-IN"
                      )}
                    </span>

                  </div>

                  <div className="flex justify-between text-sm">

                    <span className="text-gray-500">
                      Delivery
                    </span>

                    <span className="font-semibold text-green-600">
                      Calculated at checkout
                    </span>

                  </div>

                </div>

                {/* =================================================
                    COUPON
                ================================================= */}

                {discountData &&
                  !couponExpired && (
                    <div className="mt-5 overflow-hidden rounded-2xl border border-[#e4c98e] bg-gradient-to-br from-[#fffaf0] to-[#fff5df] p-4">

                      <div className="flex items-start justify-between gap-3">

                        <div className="flex gap-3">

                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#dca34f]/15">
                            <FiTag
                              size={17}
                              className="text-[#a66a26]"
                            />
                          </div>

                          <div>

                            <p className="text-sm font-bold text-[#8b5a21]">
                              Spin & Win Coupon
                            </p>

                            <p className="mt-1 rounded-md bg-white/70 px-2 py-1 text-xs font-bold tracking-wider text-[#a66a26]">
                              {discountData.couponCode}
                            </p>

                          </div>

                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            clearDiscount()
                          }
                          className="rounded-lg p-1.5 text-gray-400 transition hover:bg-red-50 hover:text-red-500"
                          title="Remove coupon"
                        >
                          <FiX size={15} />
                        </button>

                      </div>

                      {couponMinimumNotReached ? (
                        <div className="mt-3 rounded-lg bg-yellow-50 px-3 py-2 text-xs leading-5 text-yellow-700">
                          Add ₹
                          {(
                            Number(
                              discountData.minOrderAmount ||
                                0
                            ) -
                            subtotal
                          ).toLocaleString(
                            "en-IN"
                          )}{" "}
                          more to unlock this coupon.
                        </div>
                      ) : couponDiscount > 0 ? (
                        <div className="mt-3 flex items-center justify-between rounded-lg bg-green-50 px-3 py-2">

                          <span className="text-xs font-semibold text-green-700">
                            {discountData.discount}% discount applied
                          </span>

                          <span className="text-sm font-bold text-green-600">
                            - ₹
                            {couponDiscount.toLocaleString(
                              "en-IN"
                            )}
                          </span>

                        </div>
                      ) : (
                        <p className="mt-3 text-xs text-gray-500">
                          Coupon saved and will apply
                          when eligible.
                        </p>
                      )}

                    </div>
                  )}

                {/* =================================================
                    TOTAL
                ================================================= */}

                <div className="mt-5 border-t border-[#eee6dc] pt-5">

                  <div className="flex items-end justify-between">

                    <div>
                      <p className="text-xs uppercase tracking-wider text-gray-400">
                        Total Amount
                      </p>

                      {couponDiscount > 0 && (
                        <p className="mt-1 text-xs font-medium text-green-600">
                          You save ₹
                          {couponDiscount.toLocaleString(
                            "en-IN"
                          )}
                        </p>
                      )}
                    </div>

                    <span className="text-2xl font-black text-[#8f3424]">
                      ₹
                      {finalTotal.toLocaleString(
                        "en-IN"
                      )}
                    </span>

                  </div>

                </div>

                {/* =================================================
                    CHECKOUT BUTTON
                ================================================= */}

                <Link
                  to="/checkout"
                  className="group relative mt-6 flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-[#8f3424] px-5 py-4 text-sm font-bold text-white shadow-lg shadow-[#8f3424]/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#a63d29] hover:shadow-xl active:scale-[0.98]"
                >

                  <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

                  <span className="relative">
                    Proceed to Checkout
                  </span>

                  <FiArrowRight
                    className="relative transition-transform duration-300 group-hover:translate-x-1"
                  />

                </Link>

                <Link
                  to="/gallery"
                  className="mt-3 flex w-full items-center justify-center rounded-xl border border-[#ded4c8] px-5 py-3 text-sm font-semibold text-gray-600 transition-all duration-300 hover:border-[#dca34f] hover:bg-[#fffaf2] hover:text-[#8f3424]"
                >
                  Continue Shopping
                </Link>

                {/* =================================================
                    PAYMENT NOTE
                ================================================= */}

                <div className="mt-5 border-t border-[#eee6dc] pt-4 text-center">

                  <p className="text-[10px] font-medium uppercase tracking-wider text-gray-400">
                    Safe & Secure Shopping
                  </p>

                  <div className="mt-2 flex justify-center gap-1 text-[#dca34f]">
                    <span>✦</span>
                    <span>✦</span>
                    <span>✦</span>
                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

      {/* =================================================
          CUSTOM ANIMATIONS
      ================================================= */}

      <style>
        {`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(25px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes fadeInDown {
            from {
              opacity: 0;
              transform: translateY(-20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>

    </div>
  );
};

export default CartPage;
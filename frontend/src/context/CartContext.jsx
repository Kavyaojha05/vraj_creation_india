import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useProducts } from "./ProductContext";

const CartContext = createContext(null);

const CART_STORAGE_KEY = "vraj_creation_cart";

// ============================================================
// NORMALIZE ID
// ============================================================

const normalizeId = (value) => {
  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }

  return String(value)
    .trim()
    .toLowerCase();
};

// ============================================================
// GET PRODUCT ID
// ============================================================

const getProductId = (product) => {
  return (
    product?.productId ||
    product?.sku ||
    product?._id ||
    product?.id ||
    null
  );
};

// ============================================================
// GET ALL IDENTIFIERS
// ============================================================

const getIdentifiers = (product) => {
  if (!product) {
    return [];
  }

  return [
    product?._id,
    product?.id,
    product?.productId,
    product?.sku,
  ]
    .map(normalizeId)
    .filter(Boolean);
};

// ============================================================
// GET PRICE
// ============================================================

const getProductPrice = (product) => {
  const price = Number(
    product?.sellingPrice ??
      product?.price
  );

  if (
    Number.isFinite(price) &&
    price >= 0
  ) {
    return price;
  }

  return null;
};

// ============================================================
// GET STOCK
// ============================================================

const getProductStock = (product) => {
  const stock = Number(
    product?.stock
  );

  if (
    Number.isFinite(stock) &&
    stock >= 0
  ) {
    return stock;
  }

  return null;
};

// ============================================================
// FIND LIVE PRODUCT
// ============================================================

const findLiveProduct = (
  products,
  cartItem
) => {
  if (
    !Array.isArray(products) ||
    !cartItem
  ) {
    return null;
  }

  const cartIdentifiers =
    getIdentifiers(cartItem);

  if (
    cartIdentifiers.length === 0
  ) {
    return null;
  }

  return (
    products.find((product) => {
      const liveIdentifiers =
        getIdentifiers(product);

      return cartIdentifiers.some(
        (cartId) =>
          liveIdentifiers.includes(
            cartId
          )
      );
    }) || null
  );
};

// ============================================================
// CREATE CART ITEM
// ============================================================

const createCartItem = (product) => {
  const productId =
    product?._id ||
    product?.id ||
    null;

  const sku =
    product?.sku ||
    product?.productId ||
    "";

  const productCode =
    product?.productId ||
    product?.sku ||
    "";

  const price =
    getProductPrice(product);

  const stock =
    getProductStock(product);

  return {
    _id: productId,

    id: productId,

    productId: productCode,

    sku,

    name:
      product?.name ||
      "Handcrafted Product",

    image:
      product?.image ||
      "",

    category:
      product?.category ||
      "",

    subcategory:
      product?.subcategory ||
      "",

    description:
      product?.description ||
      "",

    size:
      product?.size ||
      "",

    price:
      price ?? 0,

    sellingPrice:
      price ?? 0,

    stock:
      stock ?? 0,

    quantity: 1,
  };
};

// ============================================================
// CART PROVIDER
// ============================================================

export const CartProvider = ({
  children,
}) => {
  // ==========================================================
  // LIVE PRODUCTS
  // ==========================================================

  const {
    products,
    loading: productsLoading,
  } = useProducts();

  // ==========================================================
  // LOAD CART
  // ==========================================================

  const [cartItems, setCartItems] =
    useState(() => {
      try {
        const savedCart =
          localStorage.getItem(
            CART_STORAGE_KEY
          );

        if (!savedCart) {
          return [];
        }

        const parsedCart =
          JSON.parse(savedCart);

        if (
          !Array.isArray(
            parsedCart
          )
        ) {
          return [];
        }

        return parsedCart.filter(
          Boolean
        );
      } catch (error) {
        console.error(
          "FAILED TO LOAD CART:",
          error
        );

        return [];
      }
    });

  // ==========================================================
  // SAVE CART
  // ==========================================================

  useEffect(() => {
    try {
      localStorage.setItem(
        CART_STORAGE_KEY,
        JSON.stringify(cartItems)
      );

      console.log(
        "CART SAVED:",
        cartItems
      );
    } catch (error) {
      console.error(
        "FAILED TO SAVE CART:",
        error
      );
    }
  }, [cartItems]);

  // ==========================================================
  // SYNC CART WITH LIVE PRODUCTS
  // ==========================================================

  useEffect(() => {
    if (productsLoading) {
      return;
    }

    if (
      !Array.isArray(products) ||
      products.length === 0
    ) {
      return;
    }

    setCartItems(
      (currentItems) => {
        let hasChanges = false;

        const syncedItems =
          currentItems.map(
            (cartItem) => {
              const liveProduct =
                findLiveProduct(
                  products,
                  cartItem
                );

              // ==================================================
              // IMPORTANT
              // ==================================================
              // Product match na mile to cart se DELETE nahi
              // karna hai.
              //
              // Isse temporary ID mismatch ke wajah se cart
              // item disappear nahi hoga.
              // ==================================================

              if (!liveProduct) {
                console.warn(
                  "LIVE PRODUCT NOT FOUND - KEEPING CART ITEM:",
                  cartItem?.name,
                  cartItem?.productId,
                  cartItem?._id
                );

                return cartItem;
              }

              const livePrice =
                getProductPrice(
                  liveProduct
                );

              const liveStock =
                getProductStock(
                  liveProduct
                );

              // ==================================================
              // LIVE DATA INVALID
              // ==================================================

              if (
                livePrice === null ||
                liveStock === null
              ) {
                return cartItem;
              }

              // ==================================================
              // OUT OF STOCK
              // ==================================================

              if (
                liveStock <= 0
              ) {
                console.warn(
                  "PRODUCT OUT OF STOCK:",
                  liveProduct?.name
                );

                hasChanges = true;

                return null;
              }

              // ==================================================
              // QUANTITY
              // ==================================================

              const oldQuantity =
                Number(
                  cartItem?.quantity
                ) || 1;

              const newQuantity =
                Math.min(
                  Math.max(
                    1,
                    oldQuantity
                  ),
                  liveStock
                );

              // ==================================================
              // LIVE IDS
              // ==================================================

              const liveMongoId =
                liveProduct?._id ||
                liveProduct?.id ||
                cartItem?._id ||
                null;

              const liveProductId =
                liveProduct?.productId ||
                liveProduct?.sku ||
                cartItem?.productId ||
                "";

              const liveSku =
                liveProduct?.sku ||
                liveProduct?.productId ||
                cartItem?.sku ||
                "";

              // ==================================================
              // UPDATED ITEM
              // ==================================================

              const updatedItem = {
                ...cartItem,

                _id:
                  liveMongoId,

                id:
                  liveMongoId,

                productId:
                  liveProductId,

                sku:
                  liveSku,

                name:
                  liveProduct?.name ||
                  cartItem?.name ||
                  "Handcrafted Product",

                image:
                  liveProduct?.image ||
                  cartItem?.image ||
                  "",

                category:
                  liveProduct?.category ||
                  cartItem?.category ||
                  "",

                subcategory:
                  liveProduct?.subcategory ||
                  cartItem?.subcategory ||
                  "",

                description:
                  liveProduct?.description ||
                  cartItem?.description ||
                  "",

                size:
                  liveProduct?.size ||
                  cartItem?.size ||
                  "",

                price:
                  livePrice,

                sellingPrice:
                  livePrice,

                stock:
                  liveStock,

                quantity:
                  newQuantity,
              };

              // ==================================================
              // CHANGE DETECTION
              // ==================================================

              if (
                normalizeId(
                  cartItem?._id
                ) !==
                  normalizeId(
                    updatedItem?._id
                  ) ||
                normalizeId(
                  cartItem?.productId
                ) !==
                  normalizeId(
                    updatedItem?.productId
                  ) ||
                normalizeId(
                  cartItem?.sku
                ) !==
                  normalizeId(
                    updatedItem?.sku
                  ) ||
                Number(
                  cartItem?.price
                ) !==
                  Number(
                    updatedItem?.price
                  ) ||
                Number(
                  cartItem?.stock
                ) !==
                  Number(
                    updatedItem?.stock
                  ) ||
                Number(
                  cartItem?.quantity
                ) !==
                  Number(
                    updatedItem?.quantity
                  ) ||
                cartItem?.name !==
                  updatedItem?.name ||
                cartItem?.image !==
                  updatedItem?.image
              ) {
                hasChanges = true;
              }

              return updatedItem;
            }
          );

        const filteredItems =
          syncedItems.filter(
            Boolean
          );

        if (!hasChanges) {
          return currentItems;
        }

        console.log(
          "================================="
        );

        console.log(
          "CART SYNC COMPLETED"
        );

        console.log(
          "Live products:",
          products.length
        );

        console.log(
          "Cart items:",
          filteredItems.length
        );

        console.log(
          "================================="
        );

        return filteredItems;
      }
    );
  }, [
    products,
    productsLoading,
  ]);

  // ==========================================================
  // ADD TO CART
  // ==========================================================

  const addToCart = (product) => {
    if (!product) {
      return {
        success: false,
        message:
          "Product not found.",
      };
    }

    // ========================================================
    // PRODUCT ID
    // ========================================================

    const productId =
      getProductId(product);

    if (!productId) {
      console.error(
        "ADD TO CART FAILED - PRODUCT:",
        product
      );

      return {
        success: false,
        message:
          "Product ID is missing.",
      };
    }

    // ========================================================
    // PRICE
    // ========================================================

    const price =
      getProductPrice(product);

    if (price === null) {
      return {
        success: false,
        message:
          "Product price is not available.",
      };
    }

    // ========================================================
    // STOCK
    // ========================================================

    const stock =
      getProductStock(product);

    if (stock === null) {
      return {
        success: false,
        message:
          "Product stock is not available.",
      };
    }

    // ========================================================
    // OUT OF STOCK
    // ========================================================

    if (stock <= 0) {
      return {
        success: false,
        message:
          "Product is currently out of stock.",
      };
    }

    console.log(
      "================================="
    );

    console.log(
      "ADDING PRODUCT TO CART"
    );

    console.log(
      "Product:",
      product?.name
    );

    console.log(
      "Product ID:",
      productId
    );

    console.log(
      "Mongo ID:",
      product?._id
    );

    console.log(
      "SKU:",
      product?.sku
    );

    console.log(
      "Price:",
      price
    );

    console.log(
      "Stock:",
      stock
    );

    console.log(
      "================================="
    );

    // ========================================================
    // UPDATE CART
    // ========================================================

    setCartItems(
      (currentItems) => {
        const productIdentifiers =
          getIdentifiers(product);

        const existingItemIndex =
          currentItems.findIndex(
            (item) => {
              const itemIdentifiers =
                getIdentifiers(item);

              return itemIdentifiers.some(
                (id) =>
                  productIdentifiers.includes(
                    id
                  )
              );
            }
          );

        // ======================================================
        // EXISTING PRODUCT
        // ======================================================

        if (
          existingItemIndex !== -1
        ) {
          const updatedItems =
            [...currentItems];

          const existingItem =
            updatedItems[
              existingItemIndex
            ];

          const currentQuantity =
            Number(
              existingItem?.quantity
            ) || 1;

          // ====================================================
          // STOCK LIMIT
          // ====================================================

          if (
            currentQuantity >=
            stock
          ) {
            console.warn(
              "STOCK LIMIT REACHED"
            );

            return currentItems;
          }

          // ====================================================
          // UPDATE
          // ====================================================

          updatedItems[
            existingItemIndex
          ] = {
            ...existingItem,

            _id:
              product?._id ||
              product?.id ||
              existingItem?._id ||
              null,

            id:
              product?._id ||
              product?.id ||
              existingItem?.id ||
              null,

            productId:
              product?.productId ||
              product?.sku ||
              existingItem?.productId ||
              "",

            sku:
              product?.sku ||
              product?.productId ||
              existingItem?.sku ||
              "",

            name:
              product?.name ||
              existingItem?.name ||
              "Handcrafted Product",

            image:
              product?.image ||
              existingItem?.image ||
              "",

            category:
              product?.category ||
              existingItem?.category ||
              "",

            subcategory:
              product?.subcategory ||
              existingItem?.subcategory ||
              "",

            description:
              product?.description ||
              existingItem?.description ||
              "",

            size:
              product?.size ||
              existingItem?.size ||
              "",

            price,

            sellingPrice:
              price,

            stock,

            quantity:
              currentQuantity + 1,
          };

          console.log(
            "CART QUANTITY UPDATED:",
            currentQuantity + 1
          );

          return updatedItems;
        }

        // ======================================================
        // NEW PRODUCT
        // ======================================================

        const newCartItem =
          createCartItem(product);

        console.log(
          "NEW CART ITEM:",
          newCartItem
        );

        return [
          ...currentItems,
          newCartItem,
        ];
      }
    );

    return {
      success: true,
      message:
        "Product added to cart.",
      price,
      stock,
      productId,
    };
  };

  // ==========================================================
  // REMOVE FROM CART
  // ==========================================================

  const removeFromCart = (
    productId
  ) => {
    const normalizedId =
      normalizeId(productId);

    setCartItems(
      (currentItems) =>
        currentItems.filter(
          (item) => {
            const ids =
              getIdentifiers(item);

            return !ids.includes(
              normalizedId
            );
          }
        )
    );
  };

  // ==========================================================
  // INCREASE QUANTITY
  // ==========================================================

  const increaseQuantity = (
    productId
  ) => {
    const normalizedId =
      normalizeId(productId);

    setCartItems(
      (currentItems) =>
        currentItems.map(
          (item) => {
            const itemIds =
              getIdentifiers(item);

            if (
              !itemIds.includes(
                normalizedId
              )
            ) {
              return item;
            }

            const quantity =
              Number(
                item?.quantity
              ) || 1;

            const stock =
              Number(
                item?.stock
              );

            if (
              !Number.isFinite(
                stock
              ) ||
              stock <= 0
            ) {
              return item;
            }

            if (
              quantity >= stock
            ) {
              return item;
            }

            return {
              ...item,
              quantity:
                quantity + 1,
            };
          }
        )
    );
  };

  // ==========================================================
  // DECREASE QUANTITY
  // ==========================================================

  const decreaseQuantity = (
    productId
  ) => {
    const normalizedId =
      normalizeId(productId);

    setCartItems(
      (currentItems) =>
        currentItems
          .map((item) => {
            const itemIds =
              getIdentifiers(item);

            if (
              !itemIds.includes(
                normalizedId
              )
            ) {
              return item;
            }

            const quantity =
              Number(
                item?.quantity
              ) || 1;

            if (
              quantity <= 1
            ) {
              return null;
            }

            return {
              ...item,
              quantity:
                quantity - 1,
            };
          })
          .filter(Boolean)
    );
  };

  // ==========================================================
  // UPDATE QUANTITY
  // ==========================================================

  const updateQuantity = (
    productId,
    quantity
  ) => {
    const normalizedId =
      normalizeId(productId);

    const newQuantity =
      Number(quantity);

    if (
      !Number.isFinite(
        newQuantity
      ) ||
      newQuantity <= 0
    ) {
      removeFromCart(
        productId
      );

      return;
    }

    setCartItems(
      (currentItems) =>
        currentItems.map(
          (item) => {
            const itemIds =
              getIdentifiers(item);

            if (
              !itemIds.includes(
                normalizedId
              )
            ) {
              return item;
            }

            const stock =
              Number(
                item?.stock
              );

            if (
              !Number.isFinite(
                stock
              ) ||
              stock <= 0
            ) {
              return item;
            }

            const finalQuantity =
              Math.min(
                Math.max(
                  1,
                  Math.floor(
                    newQuantity
                  )
                ),
                stock
              );

            return {
              ...item,
              quantity:
                finalQuantity,
            };
          }
        )
    );
  };

  // ==========================================================
  // CLEAR CART
  // ==========================================================

  const clearCart = () => {
    setCartItems([]);
  };

  // ==========================================================
  // IS IN CART
  // ==========================================================

  const isInCart = (
    productId
  ) => {
    const normalizedId =
      normalizeId(productId);

    if (!normalizedId) {
      return false;
    }

    return cartItems.some(
      (item) => {
        const ids =
          getIdentifiers(item);

        return ids.includes(
          normalizedId
        );
      }
    );
  };

  // ==========================================================
  // TOTAL ITEMS
  // ==========================================================

  const totalItems =
    useMemo(() => {
      return cartItems.reduce(
        (total, item) => {
          return (
            total +
            (Number(
              item?.quantity
            ) || 0)
          );
        },
        0
      );
    }, [cartItems]);

  // ==========================================================
  // SUBTOTAL
  // ==========================================================

  const subtotal =
    useMemo(() => {
      return cartItems.reduce(
        (total, item) => {
          const price =
            Number(
              item?.sellingPrice ??
                item?.price
            );

          const quantity =
            Number(
              item?.quantity
            ) || 0;

          if (
            !Number.isFinite(
              price
            ) ||
            price < 0
          ) {
            return total;
          }

          return (
            total +
            price * quantity
          );
        },
        0
      );
    }, [cartItems]);

  // ==========================================================
  // FORMAT PRICE
  // ==========================================================

  const formatPrice = (
    amount
  ) => {
    return new Intl.NumberFormat(
      "en-IN",
      {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }
    ).format(
      Number(amount) || 0
    );
  };

  // ==========================================================
  // CONTEXT VALUE
  // ==========================================================

  const value = {
    cartItems,

    addToCart,

    removeFromCart,

    increaseQuantity,

    decreaseQuantity,

    updateQuantity,

    clearCart,

    isInCart,

    totalItems,

    subtotal,

    formatPrice,
  };

  // ==========================================================
  // PROVIDER
  // ==========================================================

  return (
    <CartContext.Provider
      value={value}
    >
      {children}
    </CartContext.Provider>
  );
};

// ============================================================
// USE CART
// ============================================================

export const useCart = () => {
  const context =
    useContext(CartContext);

  if (!context) {
    throw new Error(
      "useCart must be used inside CartProvider"
    );
  }

  return context;
};
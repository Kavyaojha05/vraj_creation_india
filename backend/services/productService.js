const axios = require("axios");

// =====================================================
// VRAJ CREATION - PRODUCT SERVICE
// Trusted Product Verification
// =====================================================

// =====================================================
// PRODUCT API
// =====================================================

const PRODUCT_API_URL =
  process.env.PRODUCT_API_URL ||
  "https://vraj-creation-india.onrender.com/api/public/products";

// =====================================================
// PRICING MODE
// =====================================================

const PRICING_MODE = "gst_exclusive";

// =====================================================
// CACHE
// =====================================================

let productCache = {
  products: [],
  loadedAt: 0,
};

const CACHE_TIME = 30 * 1000;

// =====================================================
// NORMALIZE TEXT
// =====================================================

const normalizeText = (value) => {
  return String(value ?? "")
    .trim()
    .toLowerCase();
};

// =====================================================
// NORMALIZE ID
// =====================================================

const normalizeId = (value) => {
  return String(value ?? "").trim();
};

// =====================================================
// NUMBER
// =====================================================

const toNumber = (value, fallback = 0) => {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : fallback;
};

// =====================================================
// ROUND MONEY
// =====================================================

const roundMoney = (value) => {
  return Number(
    toNumber(value, 0).toFixed(2)
  );
};

// =====================================================
// GET PRODUCT ID
// =====================================================

const getProductId = (product) => {
  return (
    product?._id ||
    product?.id ||
    product?.productId ||
    ""
  );
};

// =====================================================
// GET SKU
// =====================================================

const getProductSku = (product) => {
  return (
    product?.sku ||
    product?.productCode ||
    ""
  );
};

// =====================================================
// GET PRODUCT NAME
// =====================================================

const getProductName = (product) => {
  return (
    product?.name ||
    product?.productName ||
    product?.title ||
    "Product"
  );
};

// =====================================================
// GET HSN CODE
// =====================================================

const getProductHSN = (product) => {
  const hsn =
    product?.hsnCode ??
    product?.hsn ??
    product?.HSNCode ??
    "";

  return String(hsn).trim();
};

// =====================================================
// GET PRODUCT PRICE
// =====================================================

const getProductPrice = (product) => {
  const price = toNumber(
    product?.sellingPrice ??
      product?.price ??
      product?.salePrice ??
      product?.amount ??
      0
  );

  return roundMoney(
    Math.max(0, price)
  );
};

// =====================================================
// GET STOCK
// =====================================================

const getProductStock = (product) => {
  return toNumber(
    product?.stock ??
      product?.quantity ??
      product?.availableStock ??
      0
  );
};

// =====================================================
// GET STATUS
// =====================================================

const getProductStatus = (product) => {
  return normalizeText(
    product?.status || "active"
  );
};

// =====================================================
// IS PRODUCT ACTIVE
// =====================================================

const isProductActive = (product) => {
  const status = getProductStatus(product);

  if (
    status === "inactive" ||
    status === "disabled" ||
    status === "deleted" ||
    status === "out of stock" ||
    status === "out-of-stock"
  ) {
    return false;
  }

  return true;
};

// =====================================================
// FETCH PRODUCTS
// =====================================================

const fetchProducts = async (
  forceRefresh = false
) => {
  const now = Date.now();

  // ---------------------------------------------------
  // USE CACHE
  // ---------------------------------------------------

  if (
    !forceRefresh &&
    productCache.products.length > 0 &&
    now - productCache.loadedAt < CACHE_TIME
  ) {
    return productCache.products;
  }

  try {
    console.log(
      "Fetching products from Vraj Creation public API..."
    );

    const response = await axios.get(
      PRODUCT_API_URL,
      {
        timeout: 15000,

        headers: {
          Accept: "application/json",
        },
      }
    );

    const data = response?.data;

    let products = [];

    // -------------------------------------------------
    // RESPONSE FORMAT
    // -------------------------------------------------

    if (Array.isArray(data)) {
      products = data;
    } else if (
      Array.isArray(data?.products)
    ) {
      products = data.products;
    } else if (
      Array.isArray(data?.data)
    ) {
      products = data.data;
    } else if (
      Array.isArray(data?.data?.products)
    ) {
      products = data.data.products;
    }

    if (!Array.isArray(products)) {
      products = [];
    }

    // -------------------------------------------------
    // SAVE CACHE
    // -------------------------------------------------

    productCache = {
      products,
      loadedAt: Date.now(),
    };

    console.log(
      `Products loaded successfully: ${products.length}`
    );

    return products;
  } catch (error) {
    console.error(
      "Product API Error:",
      error?.response?.status ||
        error?.message ||
        error
    );

    throw new Error(
      "Unable to fetch product information."
    );
  }
};

// =====================================================
// FIND PRODUCT
// =====================================================

const findProduct = async ({
  productId = "",
  sku = "",
  name = "",
} = {}) => {
  let products =
    await fetchProducts();

  const normalizedProductId =
    normalizeId(productId);

  const normalizedProductIdText =
    normalizeText(productId);

  const normalizedSku =
    normalizeText(sku);

  const normalizedName =
    normalizeText(name);

  // ===================================================
  // 1. FIND BY MONGODB / API PRODUCT ID
  // ===================================================

  let product = products.find(
    (item) => {
      const id = normalizeId(
        getProductId(item)
      );

      return (
        normalizedProductId &&
        id === normalizedProductId
      );
    }
  );

  // ===================================================
  // 2. FIND BY SKU
  // ===================================================

  if (!product && normalizedSku) {
    product = products.find(
      (item) => {
        const itemSku =
          normalizeText(
            getProductSku(item)
          );

        return (
          itemSku &&
          itemSku === normalizedSku
        );
      }
    );
  }

  // ===================================================
  // 3. IMPORTANT:
  // PRODUCT ID MAY ACTUALLY BE SKU
  //
  // Example:
  // productId = "VRJ109W"
  //
  // API:
  // _id = "6a97c01..."
  // sku = "VRJ109W"
  // ===================================================

  if (
    !product &&
    normalizedProductIdText
  ) {
    product = products.find(
      (item) => {
        const itemSku =
          normalizeText(
            getProductSku(item)
          );

        return (
          itemSku &&
          itemSku === normalizedProductIdText
        );
      }
    );
  }

  // ===================================================
  // 4. FIND BY NAME
  // ===================================================

  if (!product && normalizedName) {
    product = products.find(
      (item) => {
        return (
          normalizeText(
            getProductName(item)
          ) === normalizedName
        );
      }
    );
  }

  // ===================================================
  // RETRY ONCE WITH FRESH DATA
  // ===================================================

  if (!product) {
    products =
      await fetchProducts(true);

    // -------------------------------------------------
    // PRODUCT ID
    // -------------------------------------------------

    product = products.find(
      (item) => {
        const id = normalizeId(
          getProductId(item)
        );

        return (
          normalizedProductId &&
          id === normalizedProductId
        );
      }
    );

    // -------------------------------------------------
    // SKU
    // -------------------------------------------------

    if (!product && normalizedSku) {
      product = products.find(
        (item) => {
          return (
            normalizeText(
              getProductSku(item)
            ) === normalizedSku
          );
        }
      );
    }

    // -------------------------------------------------
    // PRODUCT ID AS SKU
    // -------------------------------------------------

    if (
      !product &&
      normalizedProductIdText
    ) {
      product = products.find(
        (item) => {
          return (
            normalizeText(
              getProductSku(item)
            ) === normalizedProductIdText
          );
        }
      );
    }

    // -------------------------------------------------
    // NAME
    // -------------------------------------------------

    if (!product && normalizedName) {
      product = products.find(
        (item) => {
          return (
            normalizeText(
              getProductName(item)
            ) === normalizedName
          );
        }
      );
    }
  }

  // ===================================================
  // DEBUG
  // ===================================================

  if (product) {
    console.log(
      `Product verified: ${
        getProductSku(product)
      }`
    );
  } else {
    console.warn(
      "Product verification failed:",
      {
        productId,
        sku,
        name,
      }
    );
  }

  return product || null;
};

// =====================================================
// GET PRODUCT FOR ORDER
// =====================================================

const getProductForOrder = async (
  item
) => {
  const product =
    await findProduct({
      productId:
        item?.productId ||
        item?.id ||
        item?._id ||
        "",

      sku:
        item?.sku ||
        "",

      name:
        item?.name ||
        item?.productName ||
        "",
    });

  // -------------------------------------------------
  // PRODUCT NOT FOUND
  // -------------------------------------------------

  if (!product) {
    throw new Error(
      `Product not found: ${
        item?.name ||
        item?.productId ||
        item?.sku ||
        "Unknown product"
      }`
    );
  }

  // -------------------------------------------------
  // AUTHORITATIVE PRODUCT DATA
  // -------------------------------------------------

  const productId =
    getProductId(product);

  const sku =
    getProductSku(product);

  const name =
    getProductName(product);

  const hsnCode =
    getProductHSN(product);

  const price =
    getProductPrice(product);

  const stock =
    getProductStock(product);

  const status =
    getProductStatus(product);

  // -------------------------------------------------
  // ACTIVE CHECK
  // -------------------------------------------------

  if (!isProductActive(product)) {
    throw new Error(
      `${name} is currently unavailable.`
    );
  }

  // -------------------------------------------------
  // PRICE CHECK
  // -------------------------------------------------

  if (!Number.isFinite(price) || price < 0) {
    throw new Error(
      `${name} has an invalid price.`
    );
  }

  // -------------------------------------------------
  // RETURN SERVER-SIDE PRODUCT
  // -------------------------------------------------

  return {
    original: product,

    // IMPORTANT:
    // Always use the REAL API _id here.
    productId:
      String(productId),

    sku:
      String(sku || ""),

    name,

    // -------------------------------------------------
    // HSN
    // -------------------------------------------------

    hsnCode,

    category:
      product?.category || "",

    subcategory:
      product?.subcategory || "",

    description:
      product?.description || "",

    image:
      product?.image ||
      product?.productImage ||
      "",

    size:
      product?.size || "",

    // -------------------------------------------------
    // GST EXCLUSIVE
    // -------------------------------------------------

    price,

    sellingPrice:
      price,

    pricingMode:
      PRICING_MODE,

    gstInclusive:
      false,

    // -------------------------------------------------
    // STOCK
    // -------------------------------------------------

    stock,

    status,
  };
};

// =====================================================
// VALIDATE ORDER ITEM
// =====================================================

const validateOrderItem = async (
  item
) => {
  // -------------------------------------------------
  // QUANTITY
  // -------------------------------------------------

  const quantity = toNumber(
    item?.quantity,
    0
  );

  if (
    !Number.isInteger(quantity) ||
    quantity < 1
  ) {
    throw new Error(
      `Invalid quantity for ${
        item?.name ||
        item?.sku ||
        "product"
      }.`
    );
  }

  // -------------------------------------------------
  // GET REAL PRODUCT
  // -------------------------------------------------

  const product =
    await getProductForOrder(item);

  // -------------------------------------------------
  // STOCK
  // -------------------------------------------------

  if (product.stock < quantity) {
    throw new Error(
      `${product.name} has only ${product.stock} item(s) available.`
    );
  }

  // -------------------------------------------------
  // PRICE
  // -------------------------------------------------

  if (
    !Number.isFinite(product.price) ||
    product.price < 0
  ) {
    throw new Error(
      `${product.name} has an invalid price.`
    );
  }

  // -------------------------------------------------
  // SUBTOTAL
  // -------------------------------------------------

  const subtotal =
    roundMoney(
      product.price * quantity
    );

  // -------------------------------------------------
  // RETURN VALIDATED ITEM
  // -------------------------------------------------

  return {
    ...product,

    quantity,

    price:
      product.price,

    sellingPrice:
      product.sellingPrice,

    subtotal,

    taxablePrice:
      product.price,

    pricingMode:
      PRICING_MODE,

    gstInclusive:
      false,
  };
};

// =====================================================
// VALIDATE MULTIPLE ORDER ITEMS
// =====================================================

const validateOrderItems = async (
  items = []
) => {
  if (
    !Array.isArray(items) ||
    items.length === 0
  ) {
    throw new Error(
      "Order must contain at least one product."
    );
  }

  const validatedItems = [];

  for (const item of items) {
    const validatedItem =
      await validateOrderItem(item);

    validatedItems.push(
      validatedItem
    );
  }

  return validatedItems;
};

// =====================================================
// CLEAR PRODUCT CACHE
// =====================================================

const clearProductCache = () => {
  productCache = {
    products: [],
    loadedAt: 0,
  };

  console.log(
    "Product cache cleared."
  );
};

// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  fetchProducts,
  findProduct,
  getProductForOrder,
  validateOrderItem,
  validateOrderItems,
  clearProductCache,

  getProductId,
  getProductSku,
  getProductName,
  getProductPrice,
  getProductStock,
  getProductHSN,

  PRICING_MODE,
};
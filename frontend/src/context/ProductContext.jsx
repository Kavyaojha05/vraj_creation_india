import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const PUBLIC_PRODUCTS_API =
  "https://vraj-creation-web-backend.onrender.com/api/public/products";

const ProductContext = createContext(null);

// =====================================================
// SAFE NUMBER
// =====================================================

const toNumber = (value) => {
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
// NORMALIZE PRODUCT
// =====================================================

const normalizeProduct = (product) => {
  if (!product) {
    return null;
  }

  const stock = toNumber(product.stock);

  const sellingPrice = toNumber(
    product.sellingPrice
  );

  return {
    _id: product._id || null,

    id: product._id || null,

    productId:
      product.sku || "",

    sku:
      product.sku || "",

    name:
      product.name || "",

    category:
      product.category || "",

    subcategory:
      product.subcategory || "",

    description:
      product.description || "",

    size:
      product.size || "",

    image:
      product.image || "",

    sellingPrice,

    price: sellingPrice,

    stock,

    status:
      product.status || "active",
  };
};

// =====================================================
// PROVIDER
// =====================================================

export function ProductProvider({
  children,
}) {
  const [products, setProducts] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  // ===================================================
  // FETCH PRODUCTS
  // ===================================================

  const fetchProducts =
    useCallback(async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          PUBLIC_PRODUCTS_API,
          {
            method: "GET",

            headers: {
              Accept:
                "application/json",
            },

            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error(
            `Products API failed: ${response.status}`
          );
        }

        const data =
          await response.json();

        if (!data.success) {
          throw new Error(
            data.message ||
              "Failed to fetch products"
          );
        }

        // =================================================
        // NORMALIZE LIVE PRODUCTS
        // =================================================

        const liveProducts =
          Array.isArray(data.products)
            ? data.products
                .map(normalizeProduct)
                .filter(Boolean)
            : [];

        // =================================================
        // LIVE PRODUCT DEBUG
        // =================================================

        console.log(
          "========== LIVE PRODUCTS =========="
        );

        console.table(
          liveProducts.map(
            (product) => ({
              name:
                product.name,

              sku:
                product.sku,

              category:
                product.category,

              subcategory:
                product.subcategory,

              price:
                product.sellingPrice,

              stock:
                product.stock,

              status:
                product.status,
            })
          )
        );

        // =================================================
        // CATEGORY DEBUG
        // =================================================

        console.log(
          "========== LIVE CATEGORIES =========="
        );

        console.log(
          [
            ...new Set(
              liveProducts
                .map(
                  (product) =>
                    product.category
                )
                .filter(Boolean)
            ),
          ]
        );

        // =================================================
        // SET PRODUCTS
        // =================================================

        setProducts(
          liveProducts
        );
      } catch (error) {
        console.error(
          "PUBLIC PRODUCTS ERROR:",
          error
        );

        setProducts([]);

        setError(
          error?.message ||
            "Unable to load products."
        );
      } finally {
        setLoading(false);
      }
    }, []);

  // ===================================================
  // INITIAL FETCH
  // ===================================================

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // ===================================================
  // FIND BY MONGODB ID
  // ===================================================

  const getProductById =
    useCallback(
      (id) => {
        if (!id) {
          return null;
        }

        const searchId =
          String(id)
            .trim()
            .toLowerCase();

        return (
          products.find(
            (product) =>
              String(
                product._id || ""
              )
                .trim()
                .toLowerCase() ===
                searchId ||
              String(
                product.id || ""
              )
                .trim()
                .toLowerCase() ===
                searchId
          ) || null
        );
      },
      [products]
    );

  // ===================================================
  // FIND BY SKU / PRODUCT ID
  // ===================================================

  const getProductByProductId =
    useCallback(
      (productId) => {
        if (!productId) {
          return null;
        }

        const searchId =
          String(productId)
            .trim()
            .toLowerCase();

        return (
          products.find(
            (product) =>
              String(
                product.productId || ""
              )
                .trim()
                .toLowerCase() ===
                searchId ||
              String(
                product.sku || ""
              )
                .trim()
                .toLowerCase() ===
                searchId
          ) || null
        );
      },
      [products]
    );

  // ===================================================
  // GENERIC PRODUCT FINDER
  // ===================================================

  const getProduct =
    useCallback(
      (value) => {
        if (!value) {
          return null;
        }

        return (
          getProductById(value) ||
          getProductByProductId(value) ||
          null
        );
      },
      [
        getProductById,
        getProductByProductId,
      ]
    );

  // ===================================================
  // CATEGORIES
  // ===================================================

  const categories =
    useMemo(() => {
      return [
        ...new Set(
          products
            .map(
              (product) =>
                product.category
            )
            .filter(Boolean)
        ),
      ];
    }, [products]);

  // ===================================================
  // CONTEXT VALUE
  // ===================================================

  const value = useMemo(
    () => ({
      products,

      loading,

      error,

      categories,

      refreshProducts:
        fetchProducts,

      getProduct,

      getProductById,

      getProductByProductId,
    }),
    [
      products,
      loading,
      error,
      categories,
      fetchProducts,
      getProduct,
      getProductById,
      getProductByProductId,
    ]
  );

  // ===================================================
  // PROVIDER
  // ===================================================

  return (
    <ProductContext.Provider
      value={value}
    >
      {children}
    </ProductContext.Provider>
  );
}

// =====================================================
// HOOK
// =====================================================

export function useProducts() {
  const context =
    useContext(ProductContext);

  if (!context) {
    throw new Error(
      "useProducts must be used inside ProductProvider"
    );
  }

  return context;
}
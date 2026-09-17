import { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { FiArrowLeft, FiLayers } from "react-icons/fi";
import Header from "./Header";
import Footer from "./Footer";
import ProductCard from "./ProductCard";
import { useProducts } from "../context/ProductContext";

export default function CategoryLayout({
  title,
  keywords = [],
  products: customProducts = [],
}) {
  const {
    products: liveProducts,
    loading,
    error,
  } = useProducts();

  // =====================================================
  // SCROLL TOP
  // =====================================================

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [title]);

  // =====================================================
  // MATCHED PRODUCTS
  // =====================================================

  const matchedProducts = useMemo(() => {
    const live = Array.isArray(liveProducts)
      ? liveProducts
      : [];

    const custom = Array.isArray(customProducts)
      ? customProducts
      : [];

    // ===================================================
    // IMPORTANT
    // ===================================================
    // Collection pages already filter products using
    // backend Category / Subcategory.
    //
    // Therefore:
    // customProducts ALWAYS has priority.
    //
    // Even if customProducts is empty,
    // DO NOT return all live products.
    // ===================================================

    if (Array.isArray(customProducts)) {
      return custom.filter((product) => {
        if (!product) return false;

        const productId =
          product._id ||
          product.productId ||
          product.sku ||
          product.id;

        // ------------------------------------------------
        // If product came from live API,
        // make sure it still exists in live products.
        // ------------------------------------------------

        if (!productId) {
          return false;
        }

        const normalizedProductId =
          String(productId)
            .trim()
            .toLowerCase();

        return live.some((liveProduct) => {
          const liveId =
            liveProduct?._id ||
            liveProduct?.productId ||
            liveProduct?.sku ||
            liveProduct?.id;

          return (
            String(liveId || "")
              .trim()
              .toLowerCase() ===
            normalizedProductId
          );
        });
      });
    }

    // ===================================================
    // FALLBACK
    // ===================================================
    // This is only for pages that don't send customProducts.
    // ===================================================

    if (live.length === 0) {
      return [];
    }

    const normalizedKeywords = Array.isArray(keywords)
      ? keywords
          .map((keyword) =>
            String(keyword || "")
              .trim()
              .toLowerCase()
          )
          .filter(Boolean)
      : [];

    if (normalizedKeywords.length === 0) {
      return [];
    }

    return live.filter((product) => {
      const name = String(
        product?.name || ""
      )
        .trim()
        .toLowerCase();

      const category = String(
        product?.category || ""
      )
        .trim()
        .toLowerCase();

      const subcategory = String(
        product?.subcategory || ""
      )
        .trim()
        .toLowerCase();

      return normalizedKeywords.some(
        (keyword) =>
          name.includes(keyword) ||
          category.includes(keyword) ||
          subcategory.includes(keyword)
      );
    });
  }, [
    liveProducts,
    customProducts,
    keywords,
  ]);

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div
      className="
        min-h-screen
        w-full
        bg-[#f8f5f0]
        text-[#1a1714]
        antialiased
        selection:bg-[#8f3424]
        selection:text-white
        dark:bg-[#080605]
        dark:text-[#f4f0eb]
      "
    >
      <Header />

      <main className="w-full overflow-hidden pt-[61px]">

        {/* =====================================================
            HERO
        ===================================================== */}

        <section
          className="
            relative
            overflow-hidden
            border-b
            border-[#e6dfd5]
            bg-[#f4efe6]
            py-14
            sm:py-20
            dark:border-[#221c18]
            dark:bg-[#0f0b09]
          "
        >

          {/* Ambient Glow */}

          <div
            className="
              pointer-events-none
              absolute
              -right-32
              -top-32
              h-80
              w-80
              rounded-full
              bg-[#8f3424]/5
              blur-[120px]
              dark:bg-[#dca34f]/5
            "
          />

          <div
            className="
              pointer-events-none
              absolute
              -bottom-32
              -left-32
              h-80
              w-80
              rounded-full
              bg-[#dca34f]/8
              blur-[120px]
              dark:bg-[#8f3424]/10
            "
          />

          <div
            className="
              relative
              mx-auto
              max-w-7xl
              px-4
              sm:px-6
              lg:px-8
            "
          >

            {/* Back Button */}

            <Link
              to="/#categories"
              className="
                group
                inline-flex
                items-center
                gap-2.5
                text-[11px]
                font-mono
                uppercase
                tracking-[0.25em]
                text-[#8c6d53]
                transition-colors
                duration-300
                hover:text-[#8f3424]
                dark:text-[#b39276]
                dark:hover:text-[#dca34f]
              "
            >
              <FiArrowLeft
                size={14}
                className="
                  transition-transform
                  duration-300
                  group-hover:-translate-x-1
                "
              />

              Back to Collections
            </Link>

            {/* Title */}

            <div
              className="
                mt-6
                flex
                flex-col
                gap-6
                md:flex-row
                md:items-end
                md:justify-between
              "
            >

              <div>

                <span
                  className="
                    text-[11px]
                    font-mono
                    uppercase
                    tracking-[0.3em]
                    text-[#8f3424]
                    dark:text-[#dca34f]
                  "
                >
                  // Vraj Creation &bull; Catalog
                </span>

                <h1
                  className="
                    mt-3
                    text-4xl
                    font-light
                    tracking-tight
                    text-[#1a1714]
                    sm:text-6xl
                    dark:text-[#f4f0eb]
                  "
                >
                  {title}{" "}

                  <span
                    className="
                      font-serif
                      italic
                      text-[#8f3424]
                      dark:text-[#dca34f]
                    "
                  >
                    Collection
                  </span>
                </h1>

              </div>

              {/* Product Count */}

              <div
                className="
                  inline-flex
                  w-fit
                  items-center
                  gap-2.5
                  rounded-full
                  border
                  border-[#dcd2c4]
                  bg-white/80
                  px-4
                  py-2.5
                  text-xs
                  font-mono
                  uppercase
                  tracking-wider
                  text-[#6e5d50]
                  backdrop-blur-md
                  dark:border-[#2b211b]
                  dark:bg-[#16100d]
                  dark:text-[#c4b3a4]
                "
              >

                <FiLayers
                  size={14}
                  className="
                    text-[#8f3424]
                    dark:text-[#dca34f]
                  "
                />

                <span>
                  {loading
                    ? "Loading..."
                    : `${matchedProducts.length} ${
                        matchedProducts.length === 1
                          ? "Piece Available"
                          : "Pieces Available"
                      }`}
                </span>

              </div>

            </div>

          </div>
        </section>

        {/* =====================================================
            PRODUCTS
        ===================================================== */}

        <section className="py-14 sm:py-20">

          <div
            className="
              mx-auto
              max-w-7xl
              px-4
              sm:px-6
              lg:px-8
            "
          >

            {/* =================================================
                LOADING
            ================================================= */}

            {loading ? (
              <div
                className="
                  grid
                  grid-cols-1
                  gap-8
                  sm:grid-cols-2
                  lg:grid-cols-3
                "
              >

                {[1, 2, 3, 4, 5, 6].map(
                  (item) => (
                    <div
                      key={item}
                      className="animate-pulse"
                    >

                      <div
                        className="
                          aspect-[4/5]
                          w-full
                          rounded-2xl
                          bg-[#e9e1d6]
                          dark:bg-[#14100e]
                        "
                      />

                      <div
                        className="
                          mt-4
                          h-5
                          w-3/4
                          rounded
                          bg-[#e9e1d6]
                          dark:bg-[#14100e]
                        "
                      />

                      <div
                        className="
                          mt-3
                          h-4
                          w-1/2
                          rounded
                          bg-[#e9e1d6]
                          dark:bg-[#14100e]
                        "
                      />

                    </div>
                  )
                )}

              </div>
            ) : error ? (

              /* =================================================
                  ERROR
              ================================================== */

              <div
                className="
                  mx-auto
                  max-w-lg
                  rounded-3xl
                  border
                  border-dashed
                  border-[#d4c5b2]
                  bg-white/50
                  px-8
                  py-16
                  text-center
                  backdrop-blur-sm
                  dark:border-[#38281e]
                  dark:bg-[#130d0a]
                "
              >

                <div
                  className="
                    mx-auto
                    flex
                    h-16
                    w-16
                    items-center
                    justify-center
                    rounded-full
                    bg-[#efe7db]
                    text-[#8f3424]
                    dark:bg-[#241913]
                    dark:text-[#dca34f]
                  "
                >
                  <FiLayers size={24} />
                </div>

                <h2
                  className="
                    mt-6
                    text-2xl
                    font-medium
                    tracking-tight
                    text-[#1a1714]
                    dark:text-[#f4f0eb]
                  "
                >
                  Unable to Load Products
                </h2>

                <p
                  className="
                    mx-auto
                    mt-2
                    max-w-md
                    text-sm
                    leading-relaxed
                    text-[#736357]
                    dark:text-[#a6988d]
                  "
                >
                  Products could not be loaded right now.
                  Please try again after some time.
                </p>

              </div>

            ) : matchedProducts.length > 0 ? (

              /* =================================================
                  PRODUCT GRID
              ================================================== */

              <div
                className="
                  grid
                  grid-cols-1
                  gap-8
                  sm:grid-cols-2
                  lg:grid-cols-3
                "
              >

                {matchedProducts.map(
                  (product, index) => {

                    const productKey =
                      product._id ||
                      product.productId ||
                      product.sku ||
                      product.id ||
                      `product-${index}`;

                    return (
                      <ProductCard
                        key={productKey}
                        product={product}
                        index={index}
                      />
                    );
                  }
                )}

              </div>

            ) : (

              /* =================================================
                  EMPTY
              ================================================== */

              <div
                className="
                  mx-auto
                  max-w-lg
                  rounded-3xl
                  border
                  border-dashed
                  border-[#d4c5b2]
                  bg-white/50
                  px-8
                  py-16
                  text-center
                  backdrop-blur-sm
                  dark:border-[#38281e]
                  dark:bg-[#130d0a]
                "
              >

                <div
                  className="
                    mx-auto
                    flex
                    h-16
                    w-16
                    items-center
                    justify-center
                    rounded-full
                    bg-[#efe7db]
                    text-[#8f3424]
                    dark:bg-[#241913]
                    dark:text-[#dca34f]
                  "
                >
                  <FiLayers size={24} />
                </div>

                <h2
                  className="
                    mt-6
                    text-2xl
                    font-medium
                    tracking-tight
                    text-[#1a1714]
                    dark:text-[#f4f0eb]
                  "
                >
                  Collection In Preparation
                </h2>

                <p
                  className="
                    mx-auto
                    mt-2
                    max-w-xs
                    text-sm
                    leading-relaxed
                    text-[#736357]
                    dark:text-[#a6988d]
                  "
                >
                  Exquisite new artisan pieces are
                  currently being curated for this space.
                </p>

                <Link
                  to="/#categories"
                  className="
                    mt-8
                    inline-flex
                    rounded-full
                    bg-[#8f3424]
                    px-7
                    py-3.5
                    text-[11px]
                    font-mono
                    uppercase
                    tracking-[0.2em]
                    text-white
                    transition-all
                    duration-300
                    hover:-translate-y-0.5
                    hover:bg-[#782b1d]
                    hover:shadow-lg
                    dark:bg-[#dca34f]
                    dark:text-[#080605]
                    dark:hover:bg-[#c9903b]
                  "
                >
                  Explore Other Spaces
                </Link>

              </div>
            )}

          </div>

        </section>

      </main>

      <Footer />
    </div>
  );
}
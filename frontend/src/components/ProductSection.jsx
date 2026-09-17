
import { useMemo, useState } from "react";
import { FiLayers } from "react-icons/fi";

import ProductCard from "./ProductCard";
import { useProducts } from "../context/ProductContext";

export default function ProductSection() {
  // =====================================================
  // LIVE PRODUCTS FROM MONGODB
  // =====================================================

  const {
    products,
    loading,
    error,
    categories,
  } = useProducts();

  const [selectedCategory, setSelectedCategory] =
    useState("All");

  // =====================================================
  // CATEGORY TABS
  // =====================================================

  const filterTabs = useMemo(() => {
    return ["All", ...categories];
  }, [categories]);

  // =====================================================
  // FILTER PRODUCTS
  // =====================================================

  const filteredProducts = useMemo(() => {
    if (selectedCategory === "All") {
      return products;
    }

    return products.filter(
      (product) =>
        String(product.category || "").toLowerCase() ===
        String(selectedCategory || "").toLowerCase()
    );
  }, [products, selectedCategory]);

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <section
        className="
          relative
          w-full
          bg-[#fbf6ee]
          px-4
          py-16
          text-[#38271d]
          dark:bg-[#120c09]
          dark:text-[#f3e5d4]
          sm:px-6
          sm:py-20
          lg:px-8
          lg:py-24
        "
      >
        <div className="mx-auto max-w-7xl text-center">
          <div
            className="
              mx-auto
              h-10
              w-10
              animate-spin
              rounded-full
              border-2
              border-[#8f3424]/20
              border-t-[#8f3424]
              dark:border-[#b66d4d]/20
              dark:border-t-[#b66d4d]
            "
          />

          <p
            className="
              mt-4
              text-sm
              text-[#735f50]
              dark:text-[#b9a592]
            "
          >
            Loading products...
          </p>
        </div>
      </section>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error) {
    return (
      <section
        className="
          relative
          w-full
          bg-[#fbf6ee]
          px-4
          py-16
          text-[#38271d]
          dark:bg-[#120c09]
          dark:text-[#f3e5d4]
          sm:px-6
          sm:py-20
          lg:px-8
          lg:py-24
        "
      >
        <div className="mx-auto max-w-2xl text-center">
          <div
            className="
              rounded-2xl
              border
              border-[#8f3424]/20
              bg-[#fffaf3]
              p-8
              dark:border-[#8f3424]/30
              dark:bg-[#1a120d]
            "
          >
            <h2 className="text-xl font-bold">
              Products unavailable
            </h2>

            <p
              className="
                mt-3
                text-sm
                text-[#735f50]
                dark:text-[#b9a592]
              "
            >
              {error}
            </p>
          </div>
        </div>
      </section>
    );
  }

  // =====================================================
  // EMPTY
  // =====================================================

  if (products.length === 0) {
    return (
      <section
        className="
          relative
          w-full
          bg-[#fbf6ee]
          px-4
          py-16
          text-[#38271d]
          dark:bg-[#120c09]
          dark:text-[#f3e5d4]
          sm:px-6
          sm:py-20
          lg:px-8
          lg:py-24
        "
      >
        <div className="mx-auto max-w-2xl text-center">
          <FiLayers
            size={34}
            className="mx-auto text-[#8f3424]"
          />

          <h2 className="mt-4 text-2xl font-bold">
            No products available
          </h2>

          <p
            className="
              mt-2
              text-sm
              text-[#735f50]
              dark:text-[#b9a592]
            "
          >
            Products added from the admin dashboard will
            appear here automatically.
          </p>
        </div>
      </section>
    );
  }

  // =====================================================
  // MAIN UI
  // =====================================================

  return (
    <section
      id="collection"
      className="
        relative
        w-full
        overflow-hidden
        bg-[#fbf6ee]
        py-16
        text-[#38271d]
        transition-colors
        duration-300
        dark:bg-[#120c09]
        dark:text-[#f3e5d4]
        sm:py-20
        lg:py-24
      "
    >
      {/* =================================================
          BACKGROUND GLOWS
      ================================================= */}

      <div
        className="
          pointer-events-none
          absolute
          -left-40
          top-20
          h-96
          w-96
          rounded-full
          bg-[#8f3424]/10
          blur-[130px]
          dark:bg-[#8f3424]/15
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          -right-40
          bottom-20
          h-96
          w-96
          rounded-full
          bg-[#d39a38]/10
          blur-[140px]
          dark:bg-[#d39a38]/10
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
        {/* =================================================
            HEADER
        ================================================= */}

        <div
          data-aos="fade-up"
          className="
            mx-auto
            mb-10
            max-w-3xl
            text-center
            sm:mb-14
          "
        >
          <div
            className="
              mb-3.5
              flex
              items-center
              justify-center
              gap-3
            "
          >
            <span
              className="
                h-px
                w-8
                bg-[#b99568]
                sm:w-12
              "
            />

            <span
              className="
                text-[10px]
                font-bold
                uppercase
                tracking-[0.25em]
                text-[#8f3424]
                dark:text-[#d19a76]
                sm:text-xs
              "
            >
              Our Collection
            </span>

            <span
              className="
                h-px
                w-8
                bg-[#b99568]
                sm:w-12
              "
            />
          </div>

          <h2
            className="
              text-3xl
              font-extrabold
              tracking-tight
              text-[#38271d]
              sm:text-4xl
              lg:text-5xl
              dark:text-[#fffaf2]
            "
          >
            Handcrafted{" "}
            <span
              className="
                text-[#8f3424]
                dark:bg-gradient-to-r
                dark:from-[#f7cf97]
                dark:via-[#dca34f]
                dark:to-[#b8523f]
                dark:bg-clip-text
                dark:text-transparent
              "
            >
              Collection
            </span>
          </h2>

          <p
            className="
              mx-auto
              mt-4
              max-w-2xl
              text-sm
              leading-relaxed
              text-[#735f50]
              dark:text-[#b9a592]
              sm:text-base
            "
          >
            Explore our handcrafted collection, created
            with traditional Indian artistry and modern
            design.
          </p>
        </div>

        {/* =================================================
            CATEGORY FILTERS
        ================================================= */}

        <div
          data-aos="fade-up"
          data-aos-delay="60"
          className="
            mb-10
            flex
            flex-wrap
            items-center
            justify-center
            gap-2
            sm:gap-3
          "
        >
          {filterTabs.map((tab) => {
            const isActive =
              selectedCategory === tab;

            return (
              <button
                key={tab}
                type="button"
                onClick={() =>
                  setSelectedCategory(tab)
                }
                className={`
                  flex
                  items-center
                  gap-1.5
                  rounded-full
                  px-4
                  py-2
                  text-xs
                  font-semibold
                  uppercase
                  tracking-wider
                  transition-all
                  duration-300

                  ${
                    isActive
                      ? `
                        bg-[#8f3424]
                        text-white
                        shadow-md
                        ring-2
                        ring-[#8f3424]/30
                        dark:bg-[#c89269]
                        dark:text-[#140d09]
                        dark:ring-[#c89269]/40
                      `
                      : `
                        border
                        border-[#ded0be]
                        bg-[#fffaf3]
                        text-[#735f50]
                        hover:border-[#8f3424]
                        hover:text-[#8f3424]
                        dark:border-[#38261c]
                        dark:bg-[#1a120d]
                        dark:text-[#b9a592]
                        dark:hover:border-[#c89269]
                        dark:hover:text-white
                      `
                  }
                `}
              >
                {isActive ? (
                  <span>✓</span>
                ) : (
                  <FiLayers size={13} />
                )}

                <span>{tab}</span>
              </button>
            );
          })}
        </div>

        {/* =================================================
            PRODUCT GRID
        ================================================= */}

        {filteredProducts.length > 0 ? (
          <div
            className="
              grid
              grid-cols-1
              gap-5
              sm:grid-cols-2
              md:grid-cols-3
              lg:grid-cols-4
            "
          >
            {filteredProducts.map(
              (product, index) => (
                <div
                  key={
                    product._id ||
                    product.productId ||
                    product.id ||
                    index
                  }
                  data-aos="fade-up"
                  data-aos-delay={
                    (index % 4) * 70
                  }
                >
                  <ProductCard
                    product={product}
                  />
                </div>
              )
            )}
          </div>
        ) : (
          <div
            className="
              rounded-2xl
              border
              border-[#ded0be]
              bg-[#fffaf3]
              p-10
              text-center
              dark:border-[#38261c]
              dark:bg-[#1a120d]
            "
          >
            <FiLayers
              size={30}
              className="
                mx-auto
                text-[#8f3424]
                dark:text-[#dca34f]
              "
            />

            <h3 className="mt-4 text-lg font-bold">
              No products in this category
            </h3>

            <p
              className="
                mt-2
                text-sm
                text-[#735f50]
                dark:text-[#b9a592]
              "
            >
              Try another category.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

import { Link } from "react-router-dom";
import { FiArrowUpRight } from "react-icons/fi";
import { useProducts } from "../context/ProductContext";

// =====================================================
// CATEGORIES CONFIG
// =====================================================
const categories = [
  {
    name: "Home Décor",
    path: "/home-decor",
    keywords: [
      "elephant stool",
      "camel napkin stand",
      "chowki",
      "jhoola",
      "urli",
    ],
    fallbackCategory: "home",
    tag: "01 / Living",
  },
  {
    name: "Wall Décor",
    path: "/wall-decor",
    keywords: [
      "tree of life",
      "wall hanging",
      "mural",
      "peacock wall",
    ],
    fallbackCategory: "wall",
    tag: "02 / Walls",
  },
  {
    name: "Table Décor",
    path: "/table-decor",
    keywords: [
      "boat",
      "cycle",
      "tealight",
      "candle holder",
    ],
    fallbackCategory: "table",
    tag: "03 / Tabletop",
  },
  {
    name: "Resin Art",
    path: "/resin-art",
    keywords: [
      "resin",
      "ocean",
      "geode",
      "crystal",
      "epoxy",
    ],
    fallbackCategory: "resin",
    tag: "04 / Modern",
  },
  {
    name: "Ethnic Furnishing",
    path: "/ethnic-home-furnishing",
    keywords: [
      "jharokha",
      "khidki",
      "carved wood",
      "wooden frame",
    ],
    fallbackCategory: "furnishing",
    tag: "05 / Heritage",
  },
  {
    name: "Desk Accessories",
    path: "/desk-accessories",
    keywords: [
      "bike table clock",
      "pen stand",
      "clock",
      "watch",
    ],
    fallbackCategory: "desk",
    tag: "06 / Office",
  },
];

// =====================================================
// SMART CATEGORY IMAGE HELPER
// =====================================================
const getCategoryCover = (
  products,
  targetKeywords = [],
  fallbackCategory = ""
) => {
  if (!Array.isArray(products) || products.length === 0) {
    return "";
  }

  // ---------------------------------------------------
  // 1. PRECISE PRODUCT NAME MATCH
  // ---------------------------------------------------
  const preciseMatch = products.find((product) => {
    const name = (product.name || "").toLowerCase();

    return targetKeywords.some((keyword) =>
      name.includes(keyword.toLowerCase())
    );
  });

  if (preciseMatch?.image) {
    return preciseMatch.image;
  }

  // ---------------------------------------------------
  // 2. CATEGORY MATCH
  // ---------------------------------------------------
  const categoryMatch = products.find((product) => {
    const category = (product.category || "").toLowerCase();

    return category.includes(
      fallbackCategory.toLowerCase()
    );
  });

  if (categoryMatch?.image) {
    return categoryMatch.image;
  }

  // ---------------------------------------------------
  // 3. SUBCATEGORY MATCH
  // ---------------------------------------------------
  const subcategoryMatch = products.find((product) => {
    const subcategory = (
      product.subcategory || ""
    ).toLowerCase();

    return subcategory.includes(
      fallbackCategory.toLowerCase()
    );
  });

  if (subcategoryMatch?.image) {
    return subcategoryMatch.image;
  }

  // ---------------------------------------------------
  // 4. LAST FALLBACK
  // ---------------------------------------------------
  return products[0]?.image || "";
};

// =====================================================
// COMPONENT
// =====================================================
export default function CategoriesSection() {
  const {
    products,
    loading,
    error,
  } = useProducts();

  // ===================================================
  // BUILD LIVE CATEGORY DATA
  // ===================================================
  const liveCategories = categories.map((category) => ({
    ...category,
    image: getCategoryCover(
      products,
      category.keywords,
      category.fallbackCategory
    ),
  }));

  // ===================================================
  // LOADING STATE
  // ===================================================
  if (loading) {
    return (
      <section
        id="categories"
        className="relative w-full bg-[#f8f5f0] py-24 text-[#1a1714] transition-colors duration-500 dark:bg-[#080605] dark:text-[#f4f0eb] sm:py-32"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 flex flex-col border-b border-[#e6dfd5] pb-10 dark:border-[#221c18] md:flex-row md:items-end md:justify-between">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-[0.3em] text-[#8c6d53] dark:text-[#b39276]">
                // 01. Collections
              </span>

              <h2 className="mt-3 text-3xl font-light tracking-tight sm:text-5xl lg:text-6xl">
                Curated{" "}
                <span className="font-serif italic font-normal text-[#8f3424] dark:text-[#dca34f]">
                  Spaces
                </span>
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <div
                key={category.name}
                className="animate-pulse"
              >
                <div className="aspect-[4/5] w-full rounded-2xl bg-[#e9e1d6] dark:bg-[#14100e]" />

                <div className="mt-4 h-5 w-40 rounded bg-[#e9e1d6] dark:bg-[#14100e]" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // ===================================================
  // ERROR STATE
  // ===================================================
  if (error) {
    return (
      <section
        id="categories"
        className="relative w-full bg-[#f8f5f0] py-24 text-[#1a1714] transition-colors duration-500 dark:bg-[#080605] dark:text-[#f4f0eb] sm:py-32"
      >
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <span className="text-[11px] font-mono uppercase tracking-[0.3em] text-[#8c6d53] dark:text-[#b39276]">
            // 01. Collections
          </span>

          <h2 className="mt-3 text-3xl font-light tracking-tight sm:text-5xl">
            Collections
          </h2>

          <p className="mt-4 text-sm text-red-600 dark:text-red-400">
            Unable to load collection images.
          </p>
        </div>
      </section>
    );
  }

  // ===================================================
  // MAIN UI
  // ===================================================
  return (
    <section
      id="categories"
      className="relative w-full bg-[#f8f5f0] py-24 text-[#1a1714] transition-colors duration-500 dark:bg-[#080605] dark:text-[#f4f0eb] sm:py-32"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* =====================================================
            MODERN HEADER
        ===================================================== */}
        <div
          data-aos="fade-up"
          className="mb-16 flex flex-col border-b border-[#e6dfd5] pb-10 md:flex-row md:items-end md:justify-between dark:border-[#221c18]"
        >
          <div>
            <span className="text-[11px] font-mono uppercase tracking-[0.3em] text-[#8c6d53] dark:text-[#b39276]">
              // 01. Collections
            </span>

            <h2 className="mt-3 text-3xl font-light tracking-tight sm:text-5xl lg:text-6xl">
              Curated{" "}
              <span className="font-serif italic font-normal text-[#8f3424] dark:text-[#dca34f]">
                Spaces
              </span>
            </h2>
          </div>

          <p className="mt-4 max-w-sm text-sm text-[#736357] dark:text-[#a6988d] md:mt-0">
            A refined dialogue between traditional craftsmanship
            and contemporary spatial design.
          </p>
        </div>

        {/* =====================================================
            MODERN GRID
        ===================================================== */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {liveCategories.map((cat, index) => (
            <Link
              key={cat.name}
              to={cat.path}
              data-aos="fade-up"
              data-aos-delay={index * 60}
              className="group relative flex flex-col"
            >
              {/* =================================================
                  IMAGE FRAME
              ================================================= */}
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-[#efe8dc] dark:bg-[#14100e]">
                {cat.image ? (
                  <img
                    src={cat.image}
                    alt={cat.name}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105 filter saturate-[0.9] group-hover:saturate-100"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-[#efe8dc] dark:bg-[#14100e]">
                    <span className="px-6 text-center text-sm text-[#8c6d53] dark:text-[#b39276]">
                      No image available
                    </span>
                  </div>
                )}

                {/* =================================================
                    MINIMAL DARK GRADIENT
                ================================================= */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60 transition-opacity duration-500 group-hover:opacity-80" />

                {/* =================================================
                    FLOATING TOP TAG
                ================================================= */}
                <div className="absolute left-4 top-4">
                  <span className="rounded-full bg-black/40 px-3 py-1 text-[10px] font-mono tracking-wider text-white backdrop-blur-md">
                    {cat.tag}
                  </span>
                </div>

                {/* =================================================
                    FLOATING ARROW
                ================================================= */}
                <div className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition-all duration-500 group-hover:rotate-45 group-hover:bg-[#8f3424] dark:group-hover:bg-[#dca34f] dark:group-hover:text-black">
                  <FiArrowUpRight className="text-base" />
                </div>
              </div>

              {/* =================================================
                  TEXT DETAILS
              ================================================= */}
              <div className="mt-4 flex items-baseline justify-between px-1">
                <h3 className="text-lg font-medium tracking-tight text-[#1a1714] transition-colors duration-300 group-hover:text-[#8f3424] dark:text-[#f4f0eb] dark:group-hover:text-[#dca34f]">
                  {cat.name}
                </h3>

                <span className="text-xs font-mono uppercase tracking-widest text-[#8c6d53] transition-all duration-300 group-hover:translate-x-1 dark:text-[#b39276]">
                  Explore &rarr;
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
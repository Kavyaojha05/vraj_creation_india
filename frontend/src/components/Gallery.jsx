
import { useState, useMemo, useEffect } from "react";

import {
  FiMaximize2,
  FiX,
  FiChevronLeft,
  FiChevronRight,
  FiCheck,
  FiLayers,
  FiArrowUpRight,
} from "react-icons/fi";

import { useProducts } from "../context/ProductContext";

export default function Gallery() {
  // =====================================================
  // LIVE PRODUCTS FROM MONGODB
  // =====================================================

  const {
    products,
    loading,
    error,
  } = useProducts();

  const [selectedCategory, setSelectedCategory] =
    useState("All");

  const [activeModalIndex, setActiveModalIndex] =
    useState(null);

  // =====================================================
  // EXTRACT AVAILABLE CATEGORIES DYNAMICALLY
  // =====================================================

  const filterTabs = useMemo(() => {
    const rawCategories = products
      .map((product) => product.category)
      .filter(Boolean);

    return [
      "All",
      ...new Set(rawCategories),
    ];
  }, [products]);

  // =====================================================
  // FILTERED GALLERY COLLECTION
  // =====================================================

  const galleryItems = useMemo(() => {
    if (selectedCategory === "All") {
      return products;
    }

    return products.filter(
      (item) =>
        (item.category || "").toLowerCase() ===
        selectedCategory.toLowerCase()
    );
  }, [products, selectedCategory]);

  // =====================================================
  // MODAL NAVIGATION & ESCAPE LISTENER
  // =====================================================

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (activeModalIndex === null) return;

      if (e.key === "Escape") {
        setActiveModalIndex(null);
      }

      if (
        e.key === "ArrowRight" &&
        galleryItems.length > 0
      ) {
        setActiveModalIndex(
          (prev) =>
            (prev + 1) % galleryItems.length
        );
      }

      if (
        e.key === "ArrowLeft" &&
        galleryItems.length > 0
      ) {
        setActiveModalIndex(
          (prev) =>
            (prev - 1 + galleryItems.length) %
            galleryItems.length
        );
      }
    };

    if (activeModalIndex !== null) {
      document.body.style.overflow = "hidden";

      window.addEventListener(
        "keydown",
        handleKeyDown
      );
    }

    return () => {
      document.body.style.overflow = "unset";

      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [
    activeModalIndex,
    galleryItems.length,
  ]);

  // =====================================================
  // ACTIVE MODAL ITEM
  // =====================================================

  const activeItem =
    activeModalIndex !== null
      ? galleryItems[activeModalIndex]
      : null;

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <section
        id="gallery"
        className="
          relative
          flex
          min-h-[60vh]
          w-full
          items-center
          justify-center
          overflow-hidden
          bg-[#fbf6ee]
          text-[#38271d]
          dark:bg-[#120c09]
          dark:text-[#f3e5d4]
        "
      >
        <div className="text-center">
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
            Loading gallery...
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
        id="gallery"
        className="
          relative
          flex
          min-h-[60vh]
          w-full
          items-center
          justify-center
          overflow-hidden
          bg-[#fbf6ee]
          px-4
          text-[#38271d]
          dark:bg-[#120c09]
          dark:text-[#f3e5d4]
        "
      >
        <div
          className="
            w-full
            max-w-xl
            rounded-2xl
            border
            border-[#8f3424]/20
            bg-[#fffaf3]
            p-8
            text-center
            dark:border-[#8f3424]/30
            dark:bg-[#1a120d]
          "
        >
          <FiLayers
            size={34}
            className="
              mx-auto
              text-[#8f3424]
              dark:text-[#dca34f]
            "
          />

          <h2 className="mt-4 text-xl font-bold">
            Gallery unavailable
          </h2>

          <p
            className="
              mt-3
              text-sm
              leading-relaxed
              text-[#735f50]
              dark:text-[#b9a592]
            "
          >
            {error}
          </p>
        </div>
      </section>
    );
  }

  // =====================================================
  // EMPTY GALLERY
  // =====================================================

  if (products.length === 0) {
    return (
      <section
        id="gallery"
        className="
          relative
          flex
          min-h-[60vh]
          w-full
          items-center
          justify-center
          overflow-hidden
          bg-[#fbf6ee]
          px-4
          text-[#38271d]
          dark:bg-[#120c09]
          dark:text-[#f3e5d4]
        "
      >
        <div className="text-center">
          <FiLayers
            size={36}
            className="
              mx-auto
              text-[#8f3424]
              dark:text-[#dca34f]
            "
          />

          <h2 className="mt-4 text-2xl font-bold">
            No products available
          </h2>

          <p
            className="
              mt-3
              text-sm
              text-[#735f50]
              dark:text-[#b9a592]
            "
          >
            Products added from the admin dashboard
            will appear in the gallery automatically.
          </p>
        </div>
      </section>
    );
  }

  // =====================================================
  // MAIN GALLERY
  // =====================================================

  return (
    <section
      id="gallery"
      className="
        relative
        w-full
        overflow-hidden
        bg-[#fbf6ee]
        py-16
        text-[#38271d]
        transition-colors
        duration-300
        sm:py-20
        lg:py-24
        dark:bg-[#120c09]
        dark:text-[#f3e5d4]
      "
    >
      {/* =================================================
          SUBTLE BACKGROUND GLOWS
      ================================================= */}

      <div
        className="
          pointer-events-none
          absolute
          -left-40
          top-16
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
          bottom-16
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
            SECTION HEADER
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
                sm:text-xs
                dark:text-[#d19a76]
              "
            >
              Visual Showcase
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
            Artisan Studio{" "}
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
              Gallery
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
              sm:text-base
              dark:text-[#b9a592]
            "
          >
            Take an up-close look at the texture,
            hammering finesse, and vibrant lacquer of
            our handcrafted Rajasthani masterpieces.
          </p>
        </div>

        {/* =================================================
            FILTER NAVIGATION TABS
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
                  <FiCheck size={13} />
                ) : (
                  <FiLayers size={13} />
                )}

                <span>{tab}</span>
              </button>
            );
          })}
        </div>

        {/* =================================================
            DYNAMIC GALLERY MASONRY GRID
        ================================================= */}

        {galleryItems.length > 0 ? (
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
            {galleryItems.map(
              (item, index) => (
                <div
                  key={
                    item._id ||
                    item.productId ||
                    item.id ||
                    index
                  }
                  data-aos="fade-up"
                  data-aos-delay={
                    (index % 4) * 70
                  }
                  onClick={() =>
                    setActiveModalIndex(index)
                  }
                  className="
                    group
                    relative
                    cursor-pointer
                    overflow-hidden
                    rounded-2xl
                    border
                    border-[#ded0be]
                    bg-[#eadbc5]
                    shadow-[0_8px_25px_rgba(56,39,29,0.08)]
                    transition-all
                    duration-500
                    hover:-translate-y-1.5
                    hover:border-[#8f3424]
                    hover:shadow-[0_20px_45px_rgba(143,52,36,0.22)]
                    dark:border-[#38261c]
                    dark:bg-[#1a120d]
                    dark:shadow-[0_10px_30px_rgba(0,0,0,0.4)]
                  "
                >
                  {/* =================================================
                      IMAGE FRAME
                  ================================================= */}

                  <div
                    className="
                      relative
                      aspect-[4/3]
                      w-full
                      overflow-hidden
                      bg-black/10
                    "
                  >
                    <img
                      src={
                        item.image ||
                        "https://via.placeholder.com/800x600?text=Vraj+Creation"
                      }
                      alt={item.name || "Vraj Creation Product"}
                      loading="lazy"
                      className="
                        h-full
                        w-full
                        object-cover
                        transition-transform
                        duration-700
                        ease-out
                        group-hover:scale-110
                      "
                    />

                    {/* =================================================
                        DARK VIGNETTE OVERLAY
                    ================================================= */}

                    <div
                      className="
                        absolute
                        inset-0
                        bg-gradient-to-t
                        from-black/80
                        via-black/20
                        to-transparent
                        opacity-0
                        transition-opacity
                        duration-300
                        group-hover:opacity-100
                      "
                    />

                    {/* =================================================
                        ZOOM TRIGGER
                    ================================================= */}

                    <div
                      className="
                        absolute
                        right-3.5
                        top-3.5
                        flex
                        h-9
                        w-9
                        items-center
                        justify-center
                        rounded-full
                        border
                        border-white/30
                        bg-black/50
                        text-white
                        opacity-0
                        backdrop-blur-md
                        transition-all
                        duration-300
                        group-hover:opacity-100
                        hover:scale-110
                        hover:bg-[#8f3424]
                      "
                    >
                      <FiMaximize2 size={15} />
                    </div>

                    {/* =================================================
                        INFO TEXT ON HOVER
                    ================================================= */}

                    <div
                      className="
                        absolute
                        bottom-0
                        left-0
                        right-0
                        p-4
                        text-white
                        opacity-0
                        transition-opacity
                        duration-300
                        group-hover:opacity-100
                      "
                    >
                      <span
                        className="
                          block
                          text-[9px]
                          font-bold
                          uppercase
                          tracking-[0.2em]
                          text-[#f2c46d]
                        "
                      >
                        {item.category}
                      </span>

                      <h3 className="truncate text-sm font-bold">
                        {item.name}
                      </h3>
                    </div>
                  </div>
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
              size={32}
              className="
                mx-auto
                text-[#8f3424]
                dark:text-[#dca34f]
              "
            />

            <h3 className="mt-4 text-lg font-bold">
              No products found
            </h3>

            <p
              className="
                mt-2
                text-sm
                text-[#735f50]
                dark:text-[#b9a592]
              "
            >
              No products are available in this
              category.
            </p>
          </div>
        )}

        {/* =================================================
            BOTTOM BANNER
        ================================================= */}

        <div
          data-aos="fade-up"
          className="
            mt-14
            text-center
            sm:mt-16
          "
        >
          <p
            className="
              text-xs
              font-semibold
              uppercase
              tracking-[0.22em]
              text-[#92745a]
              dark:text-[#a9917d]
            "
          >
            ✦ High Precision Metal Metallurgy •
            100% Handcrafted In Rajasthan ✦
          </p>
        </div>
      </div>

      {/* =====================================================
          CINEMATIC LIGHTBOX MODAL
      ===================================================== */}

      {activeItem && (
        <div
          role="dialog"
          aria-modal="true"
          className="
            fixed
            inset-0
            z-50
            mt-15
            flex
            items-center
            justify-center
            bg-black/90
            p-4
            backdrop-blur-xl
            transition-all
            duration-300
            sm:p-6
          "
          onClick={() =>
            setActiveModalIndex(null)
          }
        >
          <div
            className="
              relative
              flex
              max-h-[92vh]
              w-full
              max-w-4xl
              flex-col
              overflow-hidden
              rounded-3xl
              border
              border-[#4d382c]
              bg-[#160f0b]
              text-[#f5ebd9]
              shadow-2xl
            "
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            {/* =================================================
                CLOSE BUTTON
            ================================================= */}

            <button
              onClick={() =>
                setActiveModalIndex(null)
              }
              aria-label="Close Preview"
              className="
                absolute
                right-4
                top-4
                z-20
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-full
                border
                border-white/20
                bg-black/60
                text-white
                backdrop-blur-md
                transition-all
                hover:bg-[#8f3424]
              "
            >
              <FiX size={18} />
            </button>

            {/* =================================================
                PREVIOUS IMAGE
            ================================================= */}

            <button
              onClick={() =>
                setActiveModalIndex(
                  (prev) =>
                    (prev -
                      1 +
                      galleryItems.length) %
                    galleryItems.length
                )
              }
              aria-label="Previous image"
              className="
                absolute
                left-4
                top-1/2
                z-20
                flex
                h-10
                w-10
                -translate-y-1/2
                items-center
                justify-center
                rounded-full
                border
                border-white/20
                bg-black/60
                text-white
                backdrop-blur-md
                transition-all
                hover:bg-[#8f3424]
              "
            >
              <FiChevronLeft size={20} />
            </button>

            {/* =================================================
                NEXT IMAGE
            ================================================= */}

            <button
              onClick={() =>
                setActiveModalIndex(
                  (prev) =>
                    (prev + 1) %
                    galleryItems.length
                )
              }
              aria-label="Next image"
              className="
                absolute
                right-4
                top-1/2
                z-20
                flex
                h-10
                w-10
                -translate-y-1/2
                items-center
                justify-center
                rounded-full
                border
                border-white/20
                bg-black/60
                text-white
                backdrop-blur-md
                transition-all
                hover:bg-[#8f3424]
              "
            >
              <FiChevronRight size={20} />
            </button>

            {/* =================================================
                IMAGE STAGE
            ================================================= */}

            <div
              className="
                relative
                aspect-[16/10]
                w-full
                overflow-hidden
                bg-black
                sm:aspect-[16/9]
              "
            >
              <img
                src={
                  activeItem.image ||
                  "https://via.placeholder.com/1200x800?text=Vraj+Creation"
                }
                alt={
                  activeItem.name ||
                  "Vraj Creation Product"
                }
                className="
                  h-full
                  w-full
                  object-cover
                  object-center
                "
              />

              <div
                className="
                  absolute
                  inset-0
                  bg-gradient-to-t
                  from-[#160f0b]
                  via-transparent
                  to-black/20
                "
              />
            </div>

            {/* =================================================
                CAPTION & DETAILS
            ================================================= */}

            <div
              className="
                flex
                flex-col
                p-6
                sm:p-8
              "
            >
              <div
                className="
                  flex
                  flex-wrap
                  items-center
                  justify-between
                  gap-4
                  border-b
                  border-[#3b281e]
                  pb-5
                "
              >
                <div>
                  <span
                    className="
                      text-[10px]
                      font-bold
                      uppercase
                      tracking-[0.2em]
                      text-[#dca34f]
                    "
                  >
                    Category:{" "}
                    {activeItem.category ||
                      "Handcrafted"}
                  </span>

                  <h3
                    className="
                      mt-1
                      text-2xl
                      font-bold
                      text-[#fffaf2]
                      sm:text-3xl
                    "
                  >
                    {activeItem.name}
                  </h3>
                </div>

                <a
                  href="#contact"
                  onClick={() =>
                    setActiveModalIndex(null)
                  }
                  className="
                    inline-flex
                    items-center
                    gap-2
                    rounded-xl
                    bg-[#8f3424]
                    px-5
                    py-2.5
                    text-xs
                    font-bold
                    uppercase
                    tracking-wider
                    text-white
                    shadow-md
                    transition-all
                    hover:bg-[#a63f2d]
                  "
                >
                  Inquire This Artifact

                  <FiArrowUpRight size={15} />
                </a>
              </div>

              <p
                className="
                  mt-4
                  text-sm
                  leading-relaxed
                  text-[#c3b1a2]
                "
              >
                {activeItem.description ||
                  "Handcrafted Indian artwork made from seasoned materials and traditional folk metallurgy."}
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

import { useEffect } from "react";
import {
  FiCheck,
  FiFeather,
  FiHeart,
  FiLayers,
  FiMapPin,
} from "react-icons/fi";

import Header from "../components/Header";
import Footer from "../components/Footer";
import { useProducts } from "../context/ProductContext";

// =====================================================
// DISCOVER PAGE
// =====================================================
const DiscoverPage = () => {
  const {
    products,
    loading: productsLoading,
    error: productsError,
  } = useProducts();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, []);

  // =====================================================
  // IMAGE HELPER
  // =====================================================
  const getCraftImage = (keywords = [], fallbackIndex = 0) => {
    const item = products.find((product) => {
      const name = (product.name || "").toLowerCase();
      const category = (product.category || "").toLowerCase();
      const subcategory = (product.subcategory || "").toLowerCase();

      return keywords.some((keyword) => {
        const key = keyword.toLowerCase();

        return (
          name.includes(key) ||
          category.includes(key) ||
          subcategory.includes(key)
        );
      });
    });

    return (
      item?.image ||
      products[fallbackIndex]?.image ||
      products[0]?.image ||
      ""
    );
  };

  // =====================================================
  // LIVE PRODUCT IMAGES
  // =====================================================
  const heroImage = getCraftImage(
    ["elephant phone stand", "elephant"],
    0
  );

  const historyImage = getCraftImage(
    ["jharokha", "wood"],
    1
  );

  const craftImage = getCraftImage(
    ["musician", "boat", "dancers"],
    2
  );

  // =====================================================
  // LOADING
  // =====================================================
  if (productsLoading) {
    return (
      <div className="min-h-screen bg-[#fbf6ee] text-[#38271d] dark:bg-[#120c09] dark:text-[#f5e9dc]">
        <Header />

        <main className="flex min-h-[70vh] items-center justify-center px-5 pt-[68px]">
          <div className="text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-[#d8c3ac] border-t-[#963c28] dark:border-[#493429] dark:border-t-[#dca06b]" />

            <p className="mt-4 text-sm font-semibold text-[#746355] dark:text-[#bca99a]">
              Loading Vraj Creation...
            </p>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================
  if (productsError) {
    return (
      <div className="min-h-screen bg-[#fbf6ee] text-[#38271d] dark:bg-[#120c09] dark:text-[#f5e9dc]">
        <Header />

        <main className="flex min-h-[70vh] items-center justify-center px-5 pt-[68px]">
          <div className="max-w-md text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#ead9c4] text-[#963c28] dark:bg-[#3c2b21] dark:text-[#dca06b]">
              <FiFeather size={24} />
            </div>

            <h2 className="mt-5 text-2xl font-black">
              Unable to load products
            </h2>

            <p className="mt-3 text-sm leading-6 text-[#746355] dark:text-[#bca99a]">
              {productsError}
            </p>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-hidden bg-[#fbf6ee] text-[#38271d] transition-colors duration-500 dark:bg-[#120c09] dark:text-[#f5e9dc]">
      <Header />

      <main>
        {/* =====================================================
            HERO
        ===================================================== */}
        <section className="relative pt-[68px]">
          <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-14 md:grid-cols-2 md:px-8 md:py-20">

            {/* LEFT */}
            <div data-aos="fade-right">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#dcc8b0] bg-[#fffaf3] px-4 py-2 text-[10px] font-extrabold uppercase tracking-[0.22em] text-[#986442] dark:border-[#493429] dark:bg-[#1b130f] dark:text-[#d6a06d]">
                <FiFeather size={12} />
                Our Story
              </span>

              <h1 className="mt-5 max-w-2xl text-4xl font-black leading-[1.08] tracking-[-0.04em] md:text-6xl">
                The Story Behind{" "}
                <span className="text-[#963c28] dark:text-[#dca06b]">
                  Vraj Creation
                </span>
              </h1>

              <p className="mt-5 max-w-xl text-sm leading-7 text-[#746355] dark:text-[#bca99a] md:text-base">
                Vraj Creation is inspired by the rich artistic traditions of
                Rajasthan, where every handcrafted piece carries a touch of
                culture, creativity and human effort.
              </p>

              <div className="mt-7 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#ead9c4] text-[#963c28] dark:bg-[#3c2b21] dark:text-[#dca06b]">
                  <FiHeart size={18} />
                </div>

                <div>
                  <p className="text-xs font-extrabold">
                    Crafted With Heart
                  </p>

                  <p className="text-[11px] text-[#8a7869] dark:text-[#a99584]">
                    Inspired by Indian heritage
                  </p>
                </div>
              </div>
            </div>

            {/* RIGHT */}
            <div
              data-aos="fade-left"
              className="relative mx-auto w-full max-w-[500px]"
            >
              <div className="absolute -inset-5 rounded-[40px] bg-[#d7b38d]/20 blur-2xl" />

              <div className="relative overflow-hidden rounded-[30px] border border-[#dfcdb8] bg-[#eee1d2] p-3 shadow-[0_25px_70px_rgba(65,40,20,0.15)] dark:border-[#3d2b21] dark:bg-[#251914]">
                {heroImage ? (
                  <img
                    src={heroImage}
                    alt="Vraj Creation Handicraft"
                    className="aspect-[4/4.2] w-full rounded-[23px] object-cover"
                  />
                ) : (
                  <div className="flex aspect-[4/4.2] w-full items-center justify-center rounded-[23px] bg-[#e7d7c5] text-sm font-semibold text-[#806d5d] dark:bg-[#1d1410] dark:text-[#a99584]">
                    No product image available
                  </div>
                )}

                <div className="absolute bottom-7 left-7 right-7 rounded-2xl border border-white/20 bg-black/45 p-4 text-white backdrop-blur-md">
                  <div className="flex items-center gap-2">
                    <FiMapPin size={13} />

                    <p className="text-[9px] font-bold uppercase tracking-[0.2em]">
                      Rajasthan
                    </p>
                  </div>

                  <p className="mt-1 text-sm font-bold">
                    Tradition shaped by skilled hands.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            HISTORY
        ===================================================== */}
        <section className="border-y border-[#eadcca] bg-[#fffaf3] dark:border-[#302219] dark:bg-[#17100c]">
          <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-14 md:grid-cols-2 md:px-8 md:py-18">

            {/* IMAGE */}
            <div
              data-aos="fade-right"
              className="relative overflow-hidden rounded-[28px]"
            >
              {historyImage ? (
                <img
                  src={historyImage}
                  alt="Traditional Rajasthani Handicraft"
                  className="aspect-[4/3] w-full object-cover transition-transform duration-700 hover:scale-105"
                />
              ) : (
                <div className="flex aspect-[4/3] w-full items-center justify-center bg-[#e7d7c5] text-sm font-semibold text-[#806d5d] dark:bg-[#1d1410] dark:text-[#a99584]">
                  No product image available
                </div>
              )}

              <div className="absolute left-5 top-5 flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-[10px] font-extrabold uppercase tracking-wider text-[#8f3424] shadow-sm backdrop-blur dark:bg-[#1b130f]/90 dark:text-[#dca06b]">
                <FiMapPin size={12} />
                Rajasthan
              </div>
            </div>

            {/* CONTENT */}
            <div data-aos="fade-left">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-[#a06a45] dark:text-[#d49a64]">
                A Little History
              </p>

              <h2 className="mt-3 text-3xl font-black tracking-[-0.03em] md:text-4xl">
                Inspired by the{" "}
                <span className="text-[#963c28] dark:text-[#dca06b]">
                  Craft Heritage
                </span>{" "}
                of Rajasthan
              </h2>

              <div className="mt-5 space-y-4 text-sm leading-7 text-[#756456] dark:text-[#bca99a]">
                <p>
                  Rajasthan has a long tradition of folk art and
                  craftsmanship. From beautifully painted wood to detailed
                  metal work, artisans have been creating objects that reflect
                  the colours and spirit of Indian culture for generations.
                </p>

                <p>
                  Vraj Creation takes inspiration from this heritage and
                  brings together traditional artistic ideas with simple,
                  contemporary designs.
                </p>

                <p>
                  Our aim is to preserve the feeling of handmade art while
                  creating pieces that naturally become a part of modern
                  spaces.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            CRAFT SECTION
        ===================================================== */}
        <section>
          <div className="mx-auto max-w-7xl px-5 py-14 md:px-8 md:py-20">

            {/* TITLE */}
            <div
              data-aos="fade-up"
              className="mx-auto max-w-2xl text-center"
            >
              <p className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-[#a06a45] dark:text-[#d49a64]">
                Handmade Tradition
              </p>

              <h2 className="mt-3 text-3xl font-black tracking-[-0.03em] md:text-4xl">
                From Material to{" "}
                <span className="text-[#963c28] dark:text-[#dca06b]">
                  Art
                </span>
              </h2>

              <p className="mt-4 text-sm leading-7 text-[#766557] dark:text-[#bca99a]">
                Every creation takes time, patience and attention to detail.
                The beauty of handmade art lies in the small imperfections
                that make every piece feel unique.
              </p>
            </div>

            {/* CONTENT */}
            <div className="mt-10 grid items-center gap-9 md:grid-cols-2">

              {/* IMAGE */}
              <div
                data-aos="fade-right"
                className="overflow-hidden rounded-[28px] border border-[#e3d3c1] bg-[#f1e5d6] p-3 dark:border-[#3c2a20] dark:bg-[#211710]"
              >
                {craftImage ? (
                  <img
                    src={craftImage}
                    alt="Indian Artisan Craft"
                    className="aspect-[4/3] w-full rounded-[21px] object-cover transition-transform duration-700 hover:scale-105"
                  />
                ) : (
                  <div className="flex aspect-[4/3] w-full items-center justify-center rounded-[21px] bg-[#e7d7c5] text-sm font-semibold text-[#806d5d] dark:bg-[#1d1410] dark:text-[#a99584]">
                    No product image available
                  </div>
                )}
              </div>

              {/* TEXT */}
              <div data-aos="fade-left">
                <h3 className="text-2xl font-black">
                  Crafted Slowly. Made Meaningfully.
                </h3>

                <p className="mt-4 text-sm leading-7 text-[#766557] dark:text-[#bca99a]">
                  Raw materials are carefully selected before artisans begin
                  shaping, carving, painting, bending and finishing each
                  creation. Traditional skills and creative ideas come
                  together through this process.
                </p>

                <div className="mt-6 space-y-3">
                  {[
                    "Carefully selected materials",
                    "Traditional artisan techniques",
                    "Hand-finished detailing",
                    "Unique character in every piece",
                  ].map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 rounded-xl border border-[#eadcca] bg-[#fffaf3] px-4 py-3 dark:border-[#35261d] dark:bg-[#1a120e]"
                    >
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#ead7c0] text-[#8f3424] dark:bg-[#493326] dark:text-[#dda064]">
                        <FiCheck size={13} />
                      </span>

                      <span className="text-xs font-semibold text-[#5f4c3c] dark:text-[#cbb8a7]">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            SIMPLE VALUES
        ===================================================== */}
        <section className="bg-[#f1e6d8] dark:bg-[#19110d]">
          <div className="mx-auto max-w-7xl px-5 py-12 md:px-8 md:py-16">
            <div className="grid gap-5 md:grid-cols-3">

              {/* CARD 1 */}
              <div
                data-aos="fade-up"
                className="rounded-[22px] border border-[#dfcdb8] bg-[#fffaf3] p-6 dark:border-[#3b2b22] dark:bg-[#211710]"
              >
                <FiLayers
                  size={24}
                  className="text-[#963c28] dark:text-[#dca06b]"
                />

                <h3 className="mt-4 text-lg font-black">
                  Authentic Craft
                </h3>

                <p className="mt-2 text-xs leading-6 text-[#79695b] dark:text-[#b7a394]">
                  Inspired by Indian folk art and the traditional
                  craftsmanship of Rajasthan.
                </p>
              </div>

              {/* CARD 2 */}
              <div
                data-aos="fade-up"
                data-aos-delay="100"
                className="rounded-[22px] border border-[#dfcdb8] bg-[#fffaf3] p-6 dark:border-[#3b2b22] dark:bg-[#211710]"
              >
                <FiFeather
                  size={24}
                  className="text-[#963c28] dark:text-[#dca06b]"
                />

                <h3 className="mt-4 text-lg font-black">
                  Artistic Details
                </h3>

                <p className="mt-2 text-xs leading-6 text-[#79695b] dark:text-[#b7a394]">
                  Every shape, texture and finish is given careful attention
                  by skilled hands.
                </p>
              </div>

              {/* CARD 3 */}
              <div
                data-aos="fade-up"
                data-aos-delay="200"
                className="rounded-[22px] border border-[#dfcdb8] bg-[#fffaf3] p-6 dark:border-[#3b2b22] dark:bg-[#211710]"
              >
                <FiHeart
                  size={24}
                  className="text-[#963c28] dark:text-[#dca06b]"
                />

                <h3 className="mt-4 text-lg font-black">
                  Made With Heart
                </h3>

                <p className="mt-2 text-xs leading-6 text-[#79695b] dark:text-[#b7a394]">
                  Handmade creations that bring warmth, character and
                  cultural soul into everyday spaces.
                </p>
              </div>

            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default DiscoverPage;
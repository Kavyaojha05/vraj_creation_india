import { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FiArrowUpRight,
  FiAward,
  FiShield,
  FiCheckCircle,
  FiLayers,
  FiCompass,
} from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";

import Header from "../components/Header";
import Footer from "../components/Footer";
import { useProducts } from "../context/ProductContext";

// =====================================================
// SMART PRIORITY IMAGE HELPER
// =====================================================
const getArtImage = (products, keywords = [], fallbackIndex = 0) => {
  const item = products.find((p) => {
    const name = (p.name || "").toLowerCase();
    const cat = (p.category || "").toLowerCase();
    const subcategory = (p.subcategory || "").toLowerCase();

    return keywords.some((kw) => {
      const lower = kw.toLowerCase();

      return (
        name.includes(lower) ||
        cat.includes(lower) ||
        subcategory.includes(lower)
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
// WORKSHOP ROADMAP
// =====================================================
const workshopRoadmap = [
  {
    step: "01",
    title: "Heavy-Gauge Forging",
    desc: "Solid wrought iron heated and hand-hammered without fragile die-cast molds.",
    badge: "Structural Base",
  },
  {
    step: "02",
    title: "Seasoned Joinery",
    desc: "Native Sheesham wood seasoned naturally to withstand varying climate humidity.",
    badge: "Timber Craft",
  },
  {
    step: "03",
    title: "Anti-Rust Enameling",
    desc: "Triple-layer dipping primer followed by oven-cured anti-corrosive clear coat.",
    badge: "Protective Shield",
  },
  {
    step: "04",
    title: "Hand-Rubbed Patina",
    desc: "Burnished gold, antique copper, and earthy pigments finished by master painters.",
    badge: "Artistic Finish",
  },
];

// =====================================================
// STUDIO STATS
// =====================================================
const studioStats = [
  { value: "3+", label: "Generations of Guild Knowledge" },
  { value: "100%", label: "Solid Iron & Seasoned Wood" },
  { value: "5000+", label: "Artisan Heirlooms Delivered" },
  { value: "0%", label: "Machine Die-Casting Used" },
];

// =====================================================
// ABOUT PAGE
// =====================================================
export default function AboutPage() {
  const {
    products,
    loading: productsLoading,
    error: productsError,
  } = useProducts();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // =====================================================
  // LIVE PRODUCT IMAGES
  // =====================================================
  const heroBgImage = getArtImage(
    products,
    ["tree of life", "jhoola"],
    0
  );

  const forgeArtImage = getArtImage(
    products,
    ["boat", "cycle", "clock"],
    1
  );

  const finishArtImage = getArtImage(
    products,
    ["radha krishna", "tealight"],
    2
  );

  // =====================================================
  // LOADING
  // =====================================================
  if (productsLoading) {
    return (
      <div className="min-h-screen w-full bg-[#fbf6ee] text-[#38271d] dark:bg-[#120c09] dark:text-[#f3e5d4]">
        <Header />

        <main className="flex min-h-[70vh] items-center justify-center pt-[58px]">
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
      <div className="min-h-screen w-full bg-[#fbf6ee] text-[#38271d] dark:bg-[#120c09] dark:text-[#f3e5d4]">
        <Header />

        <main className="flex min-h-[70vh] items-center justify-center px-5 pt-[58px]">
          <div className="max-w-md text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#ead9c4] text-[#963c28] dark:bg-[#3c2b21] dark:text-[#dca06b]">
              <FiCompass size={24} />
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
    <div className="min-h-screen w-full bg-[#fbf6ee] text-[#38271d] antialiased transition-colors duration-300 dark:bg-[#120c09] dark:text-[#f3e5d4]">
      <Header />

      <main className="w-full overflow-hidden pt-[58px]">

        {/* =====================================================
            1. HERO STORY SHOWCASE
        ====================================================== */}
        <section className="relative flex min-h-[75vh] items-center justify-center overflow-hidden border-b border-[#dfcdb7] px-4 py-20 sm:px-6 sm:py-28 lg:px-8 dark:border-[#38261c]">

          {/* Ambient Image Background */}
          <div className="absolute inset-0 z-0">
            {heroBgImage ? (
              <img
                src={heroBgImage}
                alt="Vraj Creation Workshop"
                className="h-full w-full object-cover object-center filter brightness-[0.40] contrast-[1.15] dark:brightness-[0.25]"
              />
            ) : (
              <div className="h-full w-full bg-[#6b4632] dark:bg-[#21140e]" />
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-[#fbf6ee] via-black/60 to-black/80 dark:from-[#120c09] dark:via-[#120c09]/80" />

            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-transparent to-black/70" />
          </div>

          <div className="relative z-10 mx-auto max-w-4xl text-center">

            <div className="inline-flex items-center gap-2 rounded-full border border-[#dca34f]/40 bg-black/60 px-4 py-1.5 backdrop-blur-md">
              <span className="h-2 w-2 animate-pulse rounded-full bg-[#dca34f]" />

              <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#ffd89b] sm:text-xs">
                Jodhpur Heritage Workshop • Rajasthan
              </span>
            </div>

            <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-white drop-shadow-lg sm:text-5xl lg:text-6xl">
              Where Ancient Iron <br />

              <span className="bg-gradient-to-r from-[#ffd89b] via-[#e5a054] to-[#c87652] bg-clip-text text-transparent">
                Becomes Living Art
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-sm leading-relaxed text-[#f3e5d4] drop-shadow sm:text-base sm:leading-8">
              At Vraj Creation, our journey begins on the anvil. We partner
              with generational Rajasthani artisans to translate royal
              architectural heritage into heavy wrought iron murals,
              spiritual centerpieces, and heirloom home accents.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">

              <a
                href="/#collection"
                className="group inline-flex items-center gap-2 rounded-full bg-[#8f3424] px-7 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-xl transition-all duration-300 hover:bg-[#a63f2d] hover:shadow-2xl"
              >
                <span>View Collection</span>

                <FiArrowUpRight
                  size={15}
                  className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </a>

              <Link
                to="/gallery"
                className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-black/40 px-7 py-3 text-xs font-bold uppercase tracking-wider text-white backdrop-blur-md transition-all duration-300 hover:border-[#ffd89b] hover:bg-black/60"
              >
                Inspect Lightbox Gallery
              </Link>

            </div>
          </div>
        </section>

        {/* =====================================================
            2. STUDIO METRICS STRIP
        ====================================================== */}
        <section className="border-b border-[#dfcdb7] bg-[#f2e6d6]/70 dark:border-[#2a1b13] dark:bg-[#170e0a]">
          <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">

            <div className="grid grid-cols-2 gap-6 sm:gap-8 md:grid-cols-4">
              {studioStats.map((stat) => (
                <div key={stat.label} className="text-center">

                  <div className="text-2xl font-extrabold text-[#8f3424] sm:text-3xl lg:text-4xl dark:text-[#dca34f]">
                    {stat.value}
                  </div>

                  <div className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-[#735f50] sm:text-xs dark:text-[#a89587]">
                    {stat.label}
                  </div>

                </div>
              ))}
            </div>

          </div>
        </section>

        {/* =====================================================
            3. ARTISAN MANIFESTO & VISUAL GALLERY
        ====================================================== */}
        <section className="py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

            <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-16">

              {/* IMAGE MATRIX */}
              <div className="relative lg:col-span-6">

                <div className="grid grid-cols-2 gap-4">

                  {/* FORGE IMAGE */}
                  <div className="overflow-hidden rounded-2xl border border-[#d8bd8c] bg-[#eadbc5] p-2 shadow-lg dark:border-[#4d382c] dark:bg-[#1a120d]">

                    <div className="aspect-[3/4] w-full overflow-hidden rounded-xl bg-black">

                      {forgeArtImage ? (
                        <img
                          src={forgeArtImage}
                          alt="Hand Forging Process"
                          className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-[#e7d7c5] text-center text-xs font-semibold text-[#806d5d] dark:bg-[#1d1410] dark:text-[#a99584]">
                          No product image
                        </div>
                      )}

                    </div>

                    <div className="mt-2 text-center text-[11px] font-bold uppercase tracking-wider text-[#8f3424] dark:text-[#dca34f]">
                      Phase: Raw Forging
                    </div>

                  </div>

                  {/* FINISH IMAGE */}
                  <div className="mt-8 overflow-hidden rounded-2xl border border-[#d8bd8c] bg-[#eadbc5] p-2 shadow-lg dark:border-[#4d382c] dark:bg-[#1a120d]">

                    <div className="aspect-[3/4] w-full overflow-hidden rounded-xl bg-black">

                      {finishArtImage ? (
                        <img
                          src={finishArtImage}
                          alt="Artisan Finished Sculpture"
                          className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-[#e7d7c5] text-center text-xs font-semibold text-[#806d5d] dark:bg-[#1d1410] dark:text-[#a99584]">
                          No product image
                        </div>
                      )}

                    </div>

                    <div className="mt-2 text-center text-[11px] font-bold uppercase tracking-wider text-[#8f3424] dark:text-[#dca34f]">
                      Phase: Patina Detail
                    </div>

                  </div>

                </div>

                {/* Ambient Blur */}
                <div className="pointer-events-none absolute -bottom-10 -left-10 h-64 w-64 rounded-full bg-[#8f3424]/15 blur-3xl dark:bg-[#8f3424]/20" />

              </div>

              {/* STORY NARRATIVE */}
              <div className="lg:col-span-6">

                <div className="mb-3 flex items-center gap-3">
                  <span className="h-0.5 w-10 bg-[#8f3424] dark:bg-[#dca34f]" />

                  <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#8f3424] dark:text-[#dca34f]">
                    Our Craft Philosophy
                  </span>
                </div>

                <h2 className="text-3xl font-extrabold leading-tight text-[#38271d] sm:text-4xl lg:text-5xl dark:text-[#fffaf2]">
                  Resisting the Machine. <br />

                  <span className="text-[#8f3424] dark:text-[#dca34f]">
                    Honoring the Hammer.
                  </span>
                </h2>

                <p className="mt-5 text-sm leading-relaxed text-[#735f50] sm:text-base sm:leading-8 dark:text-[#c3b1a2]">
                  Traditional Indian palaces and havelis were never decorated
                  with hollow tin or plastic resins. They were built on solid
                  hand-beaten wrought iron and seasoned timber that withstood
                  generations.
                </p>

                <p className="mt-3 text-sm leading-relaxed text-[#735f50] sm:text-base sm:leading-8 dark:text-[#c3b1a2]">
                  At Vraj Creation, every floral branch, Radha Krishna arch,
                  and wall sculpture carries the subtle chisel marks of our
                  artisans. No two creations are identical, giving your living
                  space a truly authentic, irreplaceable identity.
                </p>

                {/* HIGHLIGHTS */}
                <div className="mt-7 space-y-3.5 border-t border-[#dfcdb7] pt-6 dark:border-[#38261c]">

                  {[
                    "100% Solid Wrought Iron Forged by Hand",
                    "Electrostatic Anti-Corrosion Barrier for Indoor & Balcony Spaces",
                    "Seasoned Hardwood Joinery with Reinforced Mounting Brackets",
                  ].map((text) => (
                    <div key={text} className="flex items-center gap-3">

                      <FiCheckCircle
                        className="shrink-0 text-[#8f3424] dark:text-[#dca34f]"
                        size={17}
                      />

                      <span className="text-xs font-semibold text-[#51372a] sm:text-sm dark:text-[#e4d7cc]">
                        {text}
                      </span>

                    </div>
                  ))}

                </div>
              </div>

            </div>
          </div>
        </section>

        {/* =====================================================
            4. FOUR-STAGE ARTISAN ROADMAP
        ====================================================== */}
        <section className="border-y border-[#dfcdb7] bg-[#f5ecdf]/60 py-16 sm:py-24 dark:border-[#38261c] dark:bg-[#160e0a]/80">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

            <div className="mx-auto mb-12 max-w-2xl text-center sm:mb-16">

              <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#8f3424] dark:text-[#dca34f]">
                Artisanal Methodology
              </span>

              <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-[#38271d] sm:text-4xl dark:text-[#fffaf2]">
                The Anatomy of Our Work
              </h2>

            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">

              {workshopRoadmap.map((stage) => (
                <div
                  key={stage.step}
                  className="group flex flex-col justify-between rounded-2xl border border-[#dfcdb7] bg-[#fffaf2] p-6 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-[#8f3424] hover:shadow-lg dark:border-[#3a271d] dark:bg-[#1a120d]"
                >

                  <div>

                    <div className="flex items-center justify-between">

                      <span className="font-mono text-xl font-extrabold text-[#dca34f]">
                        {stage.step}
                      </span>

                      <span className="rounded-md border border-[#dfcdb7] bg-[#fbf6ee] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#8f3424] dark:border-[#4d382c] dark:bg-[#251a14] dark:text-[#dca34f]">
                        {stage.badge}
                      </span>

                    </div>

                    <h3 className="mt-4 text-base font-bold text-[#38271d] transition-colors group-hover:text-[#8f3424] dark:text-[#fffaf2] dark:group-hover:text-[#dca34f]">
                      {stage.title}
                    </h3>

                    <p className="mt-2 text-xs leading-relaxed text-[#735f50] sm:text-sm dark:text-[#c3b1a2]">
                      {stage.desc}
                    </p>

                  </div>

                  <div className="mt-6 flex h-1 w-full rounded-full bg-[#dfcdb7] dark:bg-[#2d1d15]">
                    <span className="h-full w-12 rounded-full bg-[#8f3424] transition-all duration-500 group-hover:w-full dark:bg-[#dca34f]" />
                  </div>

                </div>
              ))}

            </div>
          </div>
        </section>

        {/* =====================================================
            5. BESPOKE & ARCHITECTURAL CTA
        ====================================================== */}
        <section className="py-16 sm:py-24">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">

            <div className="relative overflow-hidden rounded-3xl border border-[#d8bd8c] bg-gradient-to-r from-[#8f3424] to-[#6d2518] p-8 text-center text-white shadow-2xl sm:p-12 lg:p-14">

              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#ffd89b] sm:text-xs">
                Architectural Installations • Custom Gifting
              </span>

              <h2 className="mx-auto mt-3 max-w-2xl text-2xl font-extrabold tracking-tight sm:text-4xl">
                Need Custom Murals or Heritage Dimensions?
              </h2>

              <p className="mx-auto mt-4 max-w-xl text-xs leading-relaxed text-[#ffd89b]/90 sm:text-sm">
                Our Jodhpur workshop collaborates directly with architects,
                interior decorators, and corporate enterprises across India
                for bespoke metal installations.
              </p>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">

                <a
                  href="tel:+918886869558"
                  className="rounded-full bg-white px-7 py-3 text-xs font-bold uppercase tracking-wider text-[#8f3424] shadow-lg transition-all duration-200 hover:bg-[#ffd89b]"
                >
                  Call +91 88868 69558
                </a>

                <a
                  href="https://wa.me/918886869558?text=Hello%20Vraj%20Creation%2C%20I%20am%20interested%20in%20custom%20architectural%20handicrafts."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-black/25 px-7 py-3 text-xs font-bold uppercase tracking-wider text-white backdrop-blur-md transition-all duration-200 hover:border-white hover:bg-black/40"
                >
                  <FaWhatsapp size={15} />
                  <span>Chat on WhatsApp</span>
                </a>

              </div>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}

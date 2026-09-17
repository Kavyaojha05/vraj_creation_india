import {
  lazy,
  Suspense,
  useEffect,
  useState,
} from "react";

import { Routes, Route } from "react-router-dom";

import AOS from "aos";
import "aos/dist/aos.css";

import { FiArrowUp } from "react-icons/fi";

// ==============================
// COMMON COMPONENTS
// ==============================
import Header from "./components/Header";
import HeroSlider from "./components/HeroSlider";
import CollectionShowcase from "./components/CollectionShowcase";
import ReviewSlider from "./components/ReviewSlider";
import ContactSection from "./components/ContactSection";
import Footer from "./components/Footer";
import CategoriesSection from "./components/CategoriesSection";
import SpinAndWin from "./components/SpinAndWin";

// ==============================
// ADMIN
// ==============================
import AdminLogin from "./pages/AdminLogin";
import SpinCampaignAdmin from "./pages/SpinCampaignAdmin";

// ==============================
// LAZY PAGES
// ==============================
const AboutPage = lazy(() =>
  import("./pages/About")
);

const GalleryPage = lazy(() =>
  import("./pages/GalleryPage")
);

const DiscoverPage = lazy(() =>
  import("./pages/DiscoverPage")
);

const HomeDecorPage = lazy(() =>
  import("./pages/HomeDecorPage")
);

const WallDecorPage = lazy(() =>
  import("./pages/WallDecorPage")
);

const TableDecorPage = lazy(() =>
  import("./pages/TableDecorPage")
);

const ResinArtPage = lazy(() =>
  import("./pages/ResinArtPage")
);

const EthnicFurnishingPage = lazy(() =>
  import("./pages/EthnicFurnishingPage")
);

const DeskAccessoriesPage = lazy(() =>
  import("./pages/DeskAccessoriesPage")
);

const CartPage = lazy(() =>
  import("./pages/CartPage")
);

const CheckoutPage = lazy(() =>
  import("./pages/CheckoutPage")
);

const OrderSuccess = lazy(() =>
  import("./pages/OrderSuccess")
);

// ==============================
// PAGE LOADER
// ==============================
function PageLoader() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center bg-[#f7efe3] text-[#8f3424] dark:bg-[#15100d] dark:text-[#b66d4d]">
      <div className="text-center">
        <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-[#8f3424]/20 border-t-[#8f3424] dark:border-[#b66d4d]/20 dark:border-t-[#b66d4d]" />

        <p className="text-sm">
          Loading...
        </p>
      </div>
    </div>
  );
}

// ==============================
// HOME PAGE
// ==============================
function HomePage() {
  return (
    <>
      <Header />

      <main className="w-full overflow-hidden">
        {/* HERO */}
        <HeroSlider />

        {/* CATEGORIES */}
        <section id="categories">
          <CategoriesSection />
        </section>

        {/* SPIN & WIN */}
        <SpinAndWin />

        {/* COLLECTION */}
        <CollectionShowcase />

        {/* REVIEWS */}
        <section id="reviews">
          <ReviewSlider />
        </section>

        {/* CONTACT */}
        <ContactSection />
      </main>

      <Footer />
    </>
  );
}

// ==============================
// MAIN APP
// ==============================
export default function App() {
  const [showScrollTop, setShowScrollTop] =
    useState(false);

  // ==============================
  // AOS + SCROLL
  // ==============================
  useEffect(() => {
    AOS.init({
      duration: 600,
      easing: "ease-out-cubic",
      once: true,
      offset: 50,
      disable: "mobile",
    });

    let ticking = false;

    const handleScroll = () => {
      if (ticking) return;

      ticking = true;

      requestAnimationFrame(() => {
        setShowScrollTop(
          window.scrollY > 350
        );

        ticking = false;
      });
    };

    window.addEventListener(
      "scroll",
      handleScroll,
      {
        passive: true,
      }
    );

    return () => {
      window.removeEventListener(
        "scroll",
        handleScroll
      );
    };
  }, []);

  // ==============================
  // SCROLL TOP
  // ==============================
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <div
      id="top"
      className="min-h-screen w-full overflow-x-hidden bg-[#f7efe3] text-[#38271d] antialiased dark:bg-[#15100d] dark:text-[#f3e5d4]"
    >
      <Suspense fallback={<PageLoader />}>
        <Routes>

          {/* ==========================
              PUBLIC WEBSITE
          ========================== */}

          <Route
            path="/"
            element={<HomePage />}
          />

          <Route
            path="/about"
            element={<AboutPage />}
          />

          <Route
            path="/gallery"
            element={<GalleryPage />}
          />

          <Route
            path="/discover"
            element={<DiscoverPage />}
          />

          {/* ==========================
              CATEGORIES
          ========================== */}

          <Route
            path="/home-decor"
            element={<HomeDecorPage />}
          />

          <Route
            path="/wall-decor"
            element={<WallDecorPage />}
          />

          <Route
            path="/table-decor"
            element={<TableDecorPage />}
          />

          <Route
            path="/resin-art"
            element={<ResinArtPage />}
          />

          <Route
            path="/ethnic-home-furnishing"
            element={<EthnicFurnishingPage />}
          />

          <Route
            path="/desk-accessories"
            element={<DeskAccessoriesPage />}
          />

          {/* ==========================
              CART / CHECKOUT
          ========================== */}

          <Route
            path="/cart"
            element={<CartPage />}
          />

          <Route
            path="/checkout"
            element={<CheckoutPage />}
          />

          <Route
            path="/order-success"
            element={<OrderSuccess />}
          />

          {/* ==========================
              ADMIN LOGIN
          ========================== */}

          <Route
            path="/admin/login"
            element={<AdminLogin />}
          />

          {/* ==========================
              SPIN & WIN ADMIN
          ========================== */}

          <Route
            path="/admin/spin"
            element={<SpinCampaignAdmin />}
          />

        </Routes>
      </Suspense>

      {/* ==============================
          SCROLL TO TOP
      ============================== */}

      {showScrollTop && (
        <div className="fixed bottom-6 right-6 z-50 sm:bottom-8 sm:right-8">
          <button
            type="button"
            onClick={scrollToTop}
            aria-label="Back to top"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-[#8f3424] text-white shadow-lg transition-transform duration-300 hover:-translate-y-1 hover:bg-[#713622] dark:bg-[#b66d4d] dark:text-[#211914]"
          >
            <FiArrowUp size={18} />
          </button>
        </div>
      )}
    </div>
  );
}

import { useEffect, useState, useRef, useTransition } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FiMenu,
  FiX,
  FiSearch,
  FiSun,
  FiMoon,
  FiInstagram,
  FiArrowUpRight,
  FiShoppingCart,
} from "react-icons/fi";

import {
  FaPinterestP,
  FaWhatsapp,
  FaFacebookF,
} from "react-icons/fa";

import logoImg from "../assets/products/logo.jpeg";
import { useTheme } from "../context/ThemeContext";
import { useCart } from "../context/CartContext";
import { useProducts } from "../context/ProductContext";

// =====================================================
// SOCIAL LINKS
// =====================================================
const socialLinks = [
  {
    icon: FiInstagram,
    href: "https://www.instagram.com/vraj_creation_india?igsi=MWN1NTRnN3pyN291Zg==",
    label: "Instagram",
  },
  {
    icon: FaFacebookF,
    href: "https://www.facebook.com/profile.php?id=1000...",
    label: "Facebook",
  },
  {
    icon: FaPinterestP,
    href: "https://pin.it/1s54OiO68",
    label: "Pinterest",
  },
  {
    icon: FaWhatsapp,
    href: "https://api.whatsapp.com/send?phone=918824968974&text=Hello%20vraj%20creation%20!%20i%20visited%20your%20webside%20and%20i%20want%20to%20know%20more%20about%20your%20products",
    label: "WhatsApp",
  },
];

// =====================================================
// NAVIGATION
// =====================================================
const navLinks = [
  { name: "Home", href: "/#top" },
  {
    name: "About Us",
    href: "/about",
    isRoute: true,
  },
  {
    name: "Categories",
    href: "/#categories",
  },
  {
    name: "Gallery",
    href: "/gallery",
    isRoute: true,
  },
  {
    name: "Reviews",
    href: "/#reviews",
  },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchDropdown, setShowSearchDropdown] =
    useState(false);

  const [, startTransition] = useTransition();

  const searchRef = useRef(null);
  const location = useLocation();

  const { darkMode, toggleTheme } = useTheme();
  const { totalItems } = useCart();

  // =====================================================
  // LIVE PRODUCTS FROM MONGODB
  // =====================================================
  const { products } = useProducts();

  const isSolidPage =
    location.pathname !== "/" || scrolled;

  // =====================================================
  // SCROLL EFFECT
  // =====================================================
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 20;

      setScrolled((prev) =>
        prev !== isScrolled ? isScrolled : prev
      );
    };

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener(
        "scroll",
        handleScroll
      );
    };
  }, []);

  // =====================================================
  // HASH SECTION SCROLL
  // =====================================================
  useEffect(() => {
    if (!location.hash) return;

    const hashId = decodeURIComponent(
      location.hash.substring(1)
    );

    if (!hashId) return;

    let attempts = 0;
    let animationFrame;

    const scrollToSection = () => {
      const section =
        document.getElementById(hashId);

      if (section) {
        const headerOffset = 65;

        const sectionTop =
          section.getBoundingClientRect().top +
          window.scrollY -
          headerOffset;

        window.scrollTo({
          top: Math.max(0, sectionTop),
          behavior: "smooth",
        });

        return;
      }

      attempts += 1;

      if (attempts < 30) {
        animationFrame =
          window.requestAnimationFrame(
            scrollToSection
          );
      }
    };

    animationFrame =
      window.requestAnimationFrame(
        scrollToSection
      );

    return () => {
      if (animationFrame) {
        window.cancelAnimationFrame(
          animationFrame
        );
      }
    };
  }, [location.pathname, location.hash]);

  // =====================================================
  // MOBILE BODY LOCK
  // =====================================================
  useEffect(() => {
    document.body.style.overflow = open
      ? "hidden"
      : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // =====================================================
  // LIVE SEARCH
  // =====================================================
  useEffect(() => {
    const trimmed = searchTerm
      .trim()
      .toLowerCase();

    if (!trimmed) {
      setSearchResults([]);
      setShowSearchDropdown(false);
      return;
    }

    startTransition(() => {
      const filtered = (products || [])
        .filter((product) => {
          const name = (
            product.name || ""
          ).toLowerCase();

          const category = (
            product.category || ""
          ).toLowerCase();

          const subcategory = (
            product.subcategory || ""
          ).toLowerCase();

          const description = (
            product.description || ""
          ).toLowerCase();

          const sku = (
            product.sku ||
            product.productId ||
            ""
          ).toLowerCase();

          return (
            name.includes(trimmed) ||
            category.includes(trimmed) ||
            subcategory.includes(trimmed) ||
            description.includes(trimmed) ||
            sku.includes(trimmed)
          );
        })
        .slice(0, 5);

      setSearchResults(filtered);
      setShowSearchDropdown(true);
    });
  }, [searchTerm, products]);

  // =====================================================
  // CLICK OUTSIDE SEARCH
  // =====================================================
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(
          event.target
        )
      ) {
        setShowSearchDropdown(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  // =====================================================
  // HELPERS
  // =====================================================
  const closeMobileMenu = () => {
    setOpen(false);
  };

  const handleSelectProduct = () => {
    setShowSearchDropdown(false);
    setSearchTerm("");
    closeMobileMenu();
  };

  const textColor = isSolidPage
    ? darkMode
      ? "text-[#f8ead8]"
      : "text-[#3b2416]"
    : "text-white";

  const hoverColor = isSolidPage
    ? darkMode
      ? "hover:text-[#dca34f]"
      : "hover:text-[#8f3424]"
    : "hover:text-[#f2c46d]";

  // =====================================================
  // CART BUTTON CLASSES
  // =====================================================
  const cartButtonClass = isSolidPage
    ? darkMode
      ? "border-[#4a3528] bg-[#1d140e] text-[#f5dfc2] hover:border-[#dca34f] hover:text-[#dca34f]"
      : "border-[#ded0be] bg-white text-[#3b2416] hover:border-[#8f3424] hover:text-[#8f3424]"
    : "border-white/40 bg-black/25 text-white backdrop-blur-md hover:border-[#f2c46d] hover:text-[#f2c46d]";

  return (
    <header
      id="top"
      className={`fixed inset-x-0 top-0 z-[100] w-full transition-all duration-300 ${
        isSolidPage
          ? darkMode
            ? "border-b border-[#3b271d] bg-[#140d09]/95 shadow-xl backdrop-blur-md"
            : "border-b border-[#ded0be] bg-[#fffaf3]/95 shadow-[0_4px_25px_rgba(60,35,20,0.08)] backdrop-blur-md"
          : "border-transparent bg-transparent"
      }`}
    >
      {/* =====================================================
          MAIN HEADER
      ===================================================== */}
      <div className="mx-auto flex h-[58px] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">

        {/* BRAND */}
        <Link
          to="/"
          onClick={closeMobileMenu}
          className="group flex shrink-0 items-center gap-2.5"
        >
          <img
            src={logoImg}
            alt="Vraj Creation Logo"
            className="h-9 w-9 rounded-full border border-[#d4a45c]/80 object-cover shadow-md transition-transform duration-300 group-hover:scale-105 sm:h-10 sm:w-10"
          />

          <div className="flex flex-col leading-none">
            <strong
              className={`text-lg font-extrabold tracking-wider sm:text-xl ${textColor} ${
                !isSolidPage
                  ? "drop-shadow-[0_2px_4px_rgba(0,0,0,0.7)]"
                  : ""
              }`}
            >
              VRAJ
            </strong>

            <span
              className={`mt-0.5 text-[7px] font-bold uppercase tracking-[0.32em] sm:text-[8px] ${
                isSolidPage
                  ? darkMode
                    ? "text-[#dca34f]"
                    : "text-[#8f3424]"
                  : "text-[#f2c46d] drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]"
              }`}
            >
              CREATION
            </span>
          </div>
        </Link>

        {/* =====================================================
            DESKTOP NAVIGATION
        ===================================================== */}
        <nav className="hidden items-center gap-5 lg:flex xl:gap-6">
          {navLinks.map((item) => {
            if (item.isRoute) {
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`text-[13px] font-semibold tracking-wider transition-colors duration-200 ${textColor} ${hoverColor} ${
                    location.pathname ===
                    item.href
                      ? "text-[#8f3424] dark:text-[#dca34f]"
                      : ""
                  } ${
                    !isSolidPage
                      ? "drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
                      : ""
                  }`}
                >
                  {item.name}
                </Link>
              );
            }

            return (
              <a
                key={item.name}
                href={item.href}
                className={`text-[13px] font-semibold tracking-wider transition-colors duration-200 ${textColor} ${hoverColor} ${
                  !isSolidPage
                    ? "drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
                    : ""
                }`}
              >
                {item.name}
              </a>
            );
          })}
        </nav>

        {/* =====================================================
            RIGHT UTILITY BAR
        ===================================================== */}
        <div className="flex items-center gap-2.5 sm:gap-3">

          {/* DESKTOP SEARCH */}
          <div
            ref={searchRef}
            className="relative hidden sm:block"
          >
            <div
              className={`flex h-[34px] w-[180px] items-center gap-2 rounded-full border px-3 transition-all duration-300 lg:w-[220px] ${
                isSolidPage
                  ? darkMode
                    ? "border-[#4a3528] bg-[#1d140e] text-[#f5ebd9] focus-within:border-[#dca34f]"
                    : "border-[#d8c3ae] bg-white text-[#38271d] focus-within:border-[#8f3424]"
                  : "border-white/40 bg-black/30 text-white backdrop-blur-md focus-within:border-[#f2c46d]"
              }`}
            >
              <FiSearch
                size={14}
                className="shrink-0 opacity-70"
              />

              <input
                type="search"
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(
                    event.target.value
                  )
                }
                placeholder="Search products..."
                aria-label="Search products"
                className="w-full bg-transparent text-xs outline-none placeholder:text-current placeholder:opacity-60"
              />

              {searchTerm && (
                <button
                  type="button"
                  onClick={() =>
                    setSearchTerm("")
                  }
                  className="text-xs opacity-60 hover:opacity-100"
                >
                  ×
                </button>
              )}
            </div>

            {/* SEARCH RESULTS */}
            {showSearchDropdown && (
              <div
                className={`absolute right-0 top-[42px] z-50 w-72 overflow-hidden rounded-xl border shadow-2xl backdrop-blur-xl ${
                  darkMode
                    ? "border-[#4a3528] bg-[#1a120d]/98 text-[#f5ebd9]"
                    : "border-[#d9c7b1] bg-[#fffaf3]/98 text-[#3b2416]"
                }`}
              >
                <div className="border-b border-inherit px-3.5 py-2 text-[10px] font-bold uppercase tracking-wider opacity-60">
                  {searchResults.length > 0
                    ? `Matching Products (${searchResults.length})`
                    : "No Results Found"}
                </div>

                {searchResults.length > 0 ? (
                  <div className="max-h-64 divide-y divide-inherit overflow-y-auto">
                    {searchResults.map(
                      (item) => (
                        <Link
                          key={
                            item.id ||
                            item._id ||
                            item.productId
                          }
                          to={`/product/${
                            item.id ||
                            item._id ||
                            item.productId
                          }`}
                          onClick={
                            handleSelectProduct
                          }
                          className={`flex items-center gap-3 p-2.5 transition-colors ${
                            darkMode
                              ? "hover:bg-[#281c15]"
                              : "hover:bg-[#f2e6d6]"
                          }`}
                        >
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-9 w-9 shrink-0 rounded-lg object-cover"
                          />

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-semibold">
                              {item.name}
                            </p>

                            <span className="text-[10px] opacity-65">
                              {item.category}
                            </span>
                          </div>

                          <FiArrowUpRight
                            size={13}
                            className="opacity-60"
                          />
                        </Link>
                      )
                    )}
                  </div>
                ) : (
                  <div className="p-4 text-center text-xs opacity-75">
                    No artifacts found matching "
                    {searchTerm}"
                  </div>
                )}
              </div>
            )}
          </div>

          {/* =====================================================
              DESKTOP SOCIAL LINKS
          ===================================================== */}
          <div className="hidden items-center gap-2 lg:flex">
            {socialLinks.map(
              ({
                icon: Icon,
                href,
                label,
              }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className={`flex h-[32px] w-[32px] items-center justify-center rounded-full border transition-all duration-200 hover:-translate-y-0.5 ${
                    isSolidPage
                      ? darkMode
                        ? "border-[#4a3528] bg-[#1d140e] text-[#f5ebd9] hover:border-[#dca34f] hover:text-[#dca34f]"
                        : "border-[#ded0be] bg-white text-[#38271d] hover:border-[#8f3424] hover:text-[#8f3424]"
                      : "border-white/40 bg-black/25 text-white backdrop-blur-md hover:border-[#f2c46d] hover:text-[#f2c46d]"
                  }`}
                >
                  <Icon size={14} />
                </a>
              )
            )}
          </div>

          {/* =====================================================
              CART BUTTON
          ===================================================== */}
          <Link
            to="/cart"
            onClick={closeMobileMenu}
            aria-label={`Shopping cart, ${totalItems} items`}
            className={`relative flex h-[32px] w-[32px] items-center justify-center rounded-full border transition-all duration-200 hover:-translate-y-0.5 ${cartButtonClass}`}
          >
            <FiShoppingCart size={15} />

            {totalItems > 0 && (
              <span
                className="
                  absolute
                  -right-1
                  -top-1
                  flex
                  h-[17px]
                  min-w-[17px]
                  items-center
                  justify-center
                  rounded-full
                  bg-[#8f3424]
                  px-1
                  text-[8px]
                  font-extrabold
                  leading-none
                  text-white
                  shadow-md
                  ring-2
                  ring-white
                  dark:ring-[#140d09]
                "
              >
                {totalItems > 99
                  ? "99+"
                  : totalItems}
              </span>
            )}
          </Link>

          {/* =====================================================
              THEME TOGGLE
          ===================================================== */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle visual theme"
            className={`flex h-[32px] w-[32px] items-center justify-center rounded-full border transition-all duration-200 hover:-translate-y-0.5 ${
              isSolidPage
                ? darkMode
                  ? "border-[#4a3528] bg-[#1d140e] text-[#f5dfc2] hover:border-[#dca34f] hover:text-[#dca34f]"
                  : "border-[#ded0be] bg-white text-[#3b2416] hover:border-[#8f3424] hover:text-[#8f3424]"
                : "border-white/40 bg-black/25 text-white backdrop-blur-md hover:border-[#f2c46d] hover:text-[#f2c46d]"
            }`}
          >
            {darkMode ? (
              <FiSun size={14} />
            ) : (
              <FiMoon size={14} />
            )}
          </button>

          {/* =====================================================
              MOBILE MENU
          ===================================================== */}
          <button
            type="button"
            onClick={() =>
              setOpen((prev) => !prev)
            }
            aria-label={
              open
                ? "Close menu"
                : "Open menu"
            }
            aria-expanded={open}
            className={`flex h-[32px] w-[32px] items-center justify-center rounded-full border transition-all duration-200 lg:hidden ${
              isSolidPage
                ? darkMode
                  ? "border-[#4a3528] bg-[#1d140e] text-[#f5dfc2]"
                  : "border-[#ded0be] bg-white text-[#3b2416]"
                : "border-white/40 bg-black/25 text-white"
            }`}
          >
            {open ? (
              <FiX size={16} />
            ) : (
              <FiMenu size={16} />
            )}
          </button>
        </div>
      </div>

      {/* =====================================================
          MOBILE DRAWER
      ===================================================== */}
      {open && (
        <div
          className={`absolute left-0 right-0 top-[58px] max-h-[calc(100vh-60px)] overflow-y-auto border-b shadow-2xl backdrop-blur-xl lg:hidden ${
            darkMode
              ? "border-[#3e2a1e] bg-[#140d09]/98 text-[#f0dfcd]"
              : "border-[#ded0be] bg-[#fffaf3]/98 text-[#3b2416]"
          }`}
        >
          <div className="mx-auto max-w-7xl px-5 py-4">

            {/* MOBILE SEARCH */}
            <div
              className={`flex h-10 items-center gap-2 rounded-xl border px-3 ${
                darkMode
                  ? "border-[#4a3528] bg-[#1c120c]"
                  : "border-[#ded0be] bg-white"
              }`}
            >
              <FiSearch
                size={15}
                className="opacity-60"
              />

              <input
                type="search"
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(
                    event.target.value
                  )
                }
                placeholder="Search products..."
                className="w-full bg-transparent text-xs font-medium outline-none placeholder:text-current placeholder:opacity-50"
              />
            </div>

            {/* MOBILE SEARCH RESULTS */}
            {searchTerm.trim() && (
              <div className="mt-2 max-h-48 overflow-y-auto rounded-lg border border-inherit bg-black/5 p-2 dark:bg-white/5">
                {searchResults.length > 0 ? (
                  searchResults.map(
                    (item) => (
                      <Link
                        key={
                          item.id ||
                          item._id ||
                          item.productId
                        }
                        to={`/product/${
                          item.id ||
                          item._id ||
                          item.productId
                        }`}
                        onClick={
                          handleSelectProduct
                        }
                        className="flex items-center gap-2.5 py-1.5 text-xs font-semibold hover:text-[#8f3424] dark:hover:text-[#dca34f]"
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-7 w-7 rounded-md object-cover"
                        />

                        <span className="truncate">
                          {item.name}
                        </span>
                      </Link>
                    )
                  )
                ) : (
                  <p className="py-2 text-center text-xs opacity-70">
                    No matching products
                  </p>
                )}
              </div>
            )}

            {/* =====================================================
                MOBILE CART
            ===================================================== */}
            <Link
              to="/cart"
              onClick={closeMobileMenu}
              className={`
                mt-3
                flex
                items-center
                justify-between
                rounded-xl
                border
                px-4
                py-3
                transition-all
                ${
                  darkMode
                    ? "border-[#4a3528] bg-[#1c120c] hover:border-[#dca34f]"
                    : "border-[#ded0be] bg-white hover:border-[#8f3424]"
                }
              `}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-full
                    ${
                      darkMode
                        ? "bg-[#2a1b13] text-[#dca34f]"
                        : "bg-[#f5eadc] text-[#8f3424]"
                    }
                  `}
                >
                  <FiShoppingCart size={16} />
                </span>

                <div>
                  <p className="text-xs font-extrabold uppercase tracking-wider">
                    Shopping Cart
                  </p>

                  <p className="mt-0.5 text-[10px] opacity-60">
                    {totalItems === 0
                      ? "Your cart is empty"
                      : `${totalItems} ${
                          totalItems === 1
                            ? "item"
                            : "items"
                        } in cart`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {totalItems > 0 && (
                  <span
                    className="
                      flex
                      h-6
                      min-w-6
                      items-center
                      justify-center
                      rounded-full
                      bg-[#8f3424]
                      px-1.5
                      text-[9px]
                      font-extrabold
                      text-white
                    "
                  >
                    {totalItems > 99
                      ? "99+"
                      : totalItems}
                  </span>
                )}

                <FiArrowUpRight
                  size={14}
                  className="opacity-50"
                />
              </div>
            </Link>

            {/* MOBILE NAVIGATION */}
            <nav className="mt-3 flex flex-col divide-y divide-inherit">
              {navLinks.map((item) => {
                if (item.isRoute) {
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={
                        closeMobileMenu
                      }
                      className="flex items-center justify-between py-3 text-xs font-bold uppercase tracking-wider transition-colors hover:text-[#8f3424] dark:hover:text-[#dca34f]"
                    >
                      <span>{item.name}</span>

                      <FiArrowUpRight
                        size={13}
                        className="opacity-50"
                      />
                    </Link>
                  );
                }

                return (
                  <a
                    key={item.name}
                    href={item.href}
                    onClick={
                      closeMobileMenu
                    }
                    className="flex items-center justify-between py-3 text-xs font-bold uppercase tracking-wider transition-colors hover:text-[#8f3424] dark:hover:text-[#dca34f]"
                  >
                    <span>{item.name}</span>

                    <FiArrowUpRight
                      size={13}
                      className="opacity-50"
                    />
                  </a>
                );
              })}
            </nav>

            {/* MOBILE SOCIAL LINKS */}
            <div className="mt-4 flex items-center justify-center gap-4 border-t border-inherit pt-4">
              {socialLinks.map(
                ({
                  icon: Icon,
                  href,
                  label,
                }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-inherit text-sm transition-transform hover:scale-110"
                  >
                    <Icon />
                  </a>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
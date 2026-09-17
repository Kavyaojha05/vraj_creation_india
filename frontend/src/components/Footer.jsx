import { Link } from "react-router-dom";
import {
  FiPhone,
  FiMail,
  FiMapPin,
  FiClock,
  FiInstagram,
  FiArrowUpRight,
} from "react-icons/fi";
import { FaPinterestP, FaWhatsapp } from "react-icons/fa";
import logoImg from "../assets/products/logo.jpeg";

const categories = [
  { name: "Home Décor", path: "/home-decor" },
  { name: "Wall Décor", path: "/wall-decor" },
  { name: "Table Décor", path: "/table-decor" },
  { name: "Resin Art", path: "/resin-art" },
  { name: "Ethnic Furnishing", path: "/ethnic-home-furnishing" },
  { name: "Desk Accessories", path: "/desk-accessories" },
];

const companyLinks = [
  { name: "About Atelier", path: "/about" },
  { name: "Studio Gallery", path: "/gallery" },
  { name: "Craft Philosophy", path: "/discover" },
  { name: "Collection", path: "/#collection", anchor: true },
  { name: "Contact", path: "/#contact", anchor: true },
];

export default function Footer() {
  return (
    <footer className="border-t border-[#dfcdb7] bg-[#fbf6ee] text-[#38271d] dark:border-[#38261c] dark:bg-[#120c09] dark:text-[#f3e5d4]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8">

          {/* BRAND */}
          <div className="sm:col-span-2 lg:col-span-4">
            <Link to="/" className="group inline-flex items-center gap-3">
              <div className="relative">
                <div className="absolute -inset-1 rounded-full border border-[#dca34f]/30 transition-transform duration-500 group-hover:rotate-180" />

                <img
                  src={logoImg}
                  alt="Vraj Creation Logo"
                  className="relative h-14 w-14 rounded-full border-2 border-[#d4a45c] object-cover shadow-md"
                />
              </div>

              <div>
                <h2 className="text-xl font-extrabold tracking-[0.1em] text-[#38271d] dark:text-[#fffaf2]">
                  VRAJ{" "}
                  <span className="text-[#8f3424] dark:text-[#dca34f]">
                    CREATION
                  </span>
                </h2>

                <p className="mt-1 text-[8px] font-bold uppercase tracking-[0.28em] text-[#8f3424] dark:text-[#dca34f]">
                  Jodhpur Handcrafted Heritage
                </p>
              </div>
            </Link>

            <p className="mt-6 max-w-sm text-sm leading-6 text-[#735f50] dark:text-[#b8a697]">
              Purveyors of solid hand-forged wrought iron wall sculptures,
              carved architectural jharokhas, and timeless Indian home
              artifacts crafted with generational Rajasthani mastery.
            </p>

            {/* SOCIAL */}
            <div className="mt-6 flex gap-2.5">
              <a
                href="https://www.instagram.com/vraj_creation_india?igsi=MWN1NTRnN3pyN291Zg=="
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[#d8c6b2] text-[#735f50] transition-all hover:-translate-y-1 hover:border-[#e1306c] hover:bg-[#e1306c] hover:text-white dark:border-[#38261c] dark:text-[#dca34f]"
              >
                <FiInstagram size={17} />
              </a>

              <a
                href="https://pin.it/1s54OiO68"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Pinterest"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[#d8c6b2] text-[#735f50] transition-all hover:-translate-y-1 hover:border-[#e60023] hover:bg-[#e60023] hover:text-white dark:border-[#38261c] dark:text-[#dca34f]"
              >
                <FaPinterestP size={16} />
              </a>

              <a
                href="https://api.whatsapp.com/send?phone=918824968974&text=Hello%20vraj%20creation%20!%20i%20visited%20your%20webside%20and%20i%20want%20to%20know%20more%20about%20your%20products"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[#d8c6b2] text-[#735f50] transition-all hover:-translate-y-1 hover:border-[#25d366] hover:bg-[#25d366] hover:text-white dark:border-[#38261c] dark:text-[#dca34f]"
              >
                <FaWhatsapp size={18} />
              </a>
            </div>
          </div>

          {/* CATEGORIES */}
          <div className="lg:col-span-2">
            <h3 className="mb-5 text-[10px] font-bold uppercase tracking-[0.25em] text-[#8f3424] dark:text-[#dca34f]">
              Collections
            </h3>

            <ul className="space-y-2.5">
              {categories.map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.path}
                    className="group flex items-center gap-2 text-sm text-[#735f50] transition-colors hover:text-[#8f3424] dark:text-[#b8a697] dark:hover:text-[#dca34f]"
                  >
                    <span>{item.name}</span>
                    <FiArrowUpRight
                      size={13}
                      className="opacity-0 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* COMPANY */}
          <div className="lg:col-span-2">
            <h3 className="mb-5 text-[10px] font-bold uppercase tracking-[0.25em] text-[#8f3424] dark:text-[#dca34f]">
              Company
            </h3>

            <ul className="space-y-2.5">
              {companyLinks.map((item) => (
                <li key={item.name}>
                  {item.anchor ? (
                    <a
                      href={item.path}
                      className="group flex items-center gap-2 text-sm text-[#735f50] transition-colors hover:text-[#8f3424] dark:text-[#b8a697] dark:hover:text-[#dca34f]"
                    >
                      <span>{item.name}</span>
                      <FiArrowUpRight
                        size={13}
                        className="opacity-0 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100"
                      />
                    </a>
                  ) : (
                    <Link
                      to={item.path}
                      className="group flex items-center gap-2 text-sm text-[#735f50] transition-colors hover:text-[#8f3424] dark:text-[#b8a697] dark:hover:text-[#dca34f]"
                    >
                      <span>{item.name}</span>
                      <FiArrowUpRight
                        size={13}
                        className="opacity-0 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100"
                      />
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* CONTACT */}
          <div className="lg:col-span-4">
            <h3 className="mb-5 text-[10px] font-bold uppercase tracking-[0.25em] text-[#8f3424] dark:text-[#dca34f]">
              Contact Studio
            </h3>

            <div className="space-y-3.5">
              {/* Location */}
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#8f3424]/10 text-[#8f3424] dark:bg-[#dca34f]/10 dark:text-[#dca34f]">
                  <FiMapPin size={16} />
                </div>

                <span className="text-sm text-[#735f50] dark:text-[#b8a697]">
                  Jodhpur, Rajasthan, India
                </span>
              </div>

              {/* Phone */}
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#8f3424]/10 text-[#8f3424] dark:bg-[#dca34f]/10 dark:text-[#dca34f]">
                  <FiPhone size={16} />
                </div>

                <a
                  href="tel:+918824968974"
                  className="text-sm text-[#735f50] transition-colors hover:text-[#8f3424] dark:text-[#b8a697] dark:hover:text-[#dca34f]"
                >
                  +91 88249 68974
                </a>
              </div>

              {/* Email */}
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#8f3424]/10 text-[#8f3424] dark:bg-[#dca34f]/10 dark:text-[#dca34f]">
                  <FiMail size={16} />
                </div>

                <a
                  href="mailto:VRAJCREATIONOFFICIAL@GMAIL.COM"
                  className="break-all text-sm text-[#735f50] transition-colors hover:text-[#8f3424] dark:text-[#b8a697] dark:hover:text-[#dca34f]"
                >
                  VRAJCREATIONOFFICIAL@GMAIL.COM
                </a>
              </div>

              {/* Hours */}
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#8f3424]/10 text-[#8f3424] dark:bg-[#dca34f]/10 dark:text-[#dca34f]">
                  <FiClock size={16} />
                </div>

                <span className="text-sm text-[#735f50] dark:text-[#b8a697]">
                  Mon – Sat: 10:00 AM – 7:00 PM IST
                </span>
              </div>
            </div>

            {/* SMALL WHATSAPP BUTTON */}
            <a
              href="https://api.whatsapp.com/send?phone=918824968974&text=Hello%20vraj%20creation%20!%20i%20visited%20your%20webside%20and%20i%20want%20to%20know%20more%20about%20your%20products"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#8f3424] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition-all hover:-translate-y-0.5 hover:bg-[#74291d] dark:bg-[#dca34f] dark:text-[#211611] dark:hover:bg-[#e7b665]"
            >
              <FaWhatsapp size={16} />
              WhatsApp
            </a>
          </div>
        </div>

        {/* BOTTOM */}
        <div className="mt-10 border-t border-[#dfcdb7] pt-6 dark:border-[#38261c]">
          <div className="flex flex-col gap-2 text-center text-xs text-[#735f50] sm:flex-row sm:items-center sm:justify-between sm:text-left dark:text-[#8e7a6c]">
            <p>
              © {new Date().getFullYear()} Vraj Creation. All rights reserved.
            </p>

            <p>Jodhpur, Rajasthan • Indian Art • Handmade • Timeless</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
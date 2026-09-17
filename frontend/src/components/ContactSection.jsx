import {
  FiPhone,
  FiMail,
  FiMapPin,
  FiClock,
  FiInstagram,
  FiArrowUpRight,
} from "react-icons/fi";
import { FaWhatsapp, FaPinterestP } from "react-icons/fa";

export default function ContactSection() {
  return (
    <section
      id="contact"
      className="relative w-full overflow-hidden bg-gradient-to-b from-[#fbf6ee] via-[#f7efe3] to-[#f2e6d6] py-16 sm:py-20 lg:py-24 dark:from-[#120c09] dark:via-[#15100d] dark:to-[#1a120d]"
    >
      {/* Decorative Royal Ambient Glows */}
      <div className="pointer-events-none absolute -left-20 top-1/4 h-96 w-96 rounded-full bg-[#8f3424]/15 blur-[120px] dark:bg-[#8f3424]/25" />
      <div className="pointer-events-none absolute -right-20 bottom-1/4 h-96 w-96 rounded-full bg-[#d39a38]/15 blur-[120px] dark:bg-[#d39a38]/20" />

      <div className="relative mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div
          data-aos="fade-up"
          className="mx-auto mb-14 max-w-3xl text-center sm:mb-16"
        >
          <div className="mb-3 inline-flex items-center gap-2.5 rounded-full border border-[#d3b88d]/50 bg-[#fffaf2]/80 px-4 py-1.5 shadow-sm backdrop-blur-md dark:border-[#4a3528] dark:bg-[#1f1712]" >
            <span className="h-2 w-2 rounded-full bg-[#8f3424] animate-pulse dark:bg-[#dca34f]" />
            <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#8f3424] dark:text-[#dca34f]">
              Direct Artisan Connection
            </span>
          </div>

          <h2 className="text-3xl font-extrabold tracking-tight text-[#38271d] sm:text-4xl lg:text-5xl dark:text-[#fffaf2]">
            Connect With{" "}
            <span className="bg-gradient-to-r from-[#8f3424] to-[#c26838] bg-clip-text text-transparent dark:from-[#dca34f] dark:to-[#e8b87a]">
              Vraj Creation
            </span>
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-[#735f50] sm:text-base dark:text-[#c3b1a2]">
            Reach out directly to our Jodhpur workshop for retail inquiries, custom architectural decor, or exclusive wholesale craftsmanship orders.
          </p>
        </div>

        {/* Contact Info Cards Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* Location */}
          <div
            data-aos="fade-up"
            data-aos-delay="0"
            className="group relative flex flex-col overflow-hidden rounded-3xl border border-[#d8c09b] bg-[#fffaf2] p-6 shadow-lg shadow-[#38271d]/5 transition-all duration-500 hover:-translate-y-2 hover:border-[#8f3424] hover:shadow-xl dark:border-[#3d2a1f] dark:bg-[#1c140f] dark:shadow-black/40 dark:hover:border-[#dca34f]"
          >
            <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-[#8f3424]/10 transition-transform duration-500 group-hover:scale-150" />
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#8f3424] to-[#6b251a] text-white shadow-md transition-transform duration-300 group-hover:scale-110">
              <FiMapPin size={24} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#8f3424] dark:text-[#dca34f]">
              Workshop Location
            </span>
            <strong className="mt-1 text-lg font-bold text-[#38271d] dark:text-[#fffaf2]">
              Jodhpur, Rajasthan
            </strong>
            <p className="mt-2 text-xs leading-relaxed text-[#735f50] dark:text-[#c3b1a2]">
              Handcrafted in the heart of traditional Rajasthani ironcraft & woodwork.
            </p>
          </div>

          {/* Phone */}
          <div
            data-aos="fade-up"
            data-aos-delay="100"
            className="group relative flex flex-col overflow-hidden rounded-3xl border border-[#d8c09b] bg-[#fffaf2] p-6 shadow-lg shadow-[#38271d]/5 transition-all duration-500 hover:-translate-y-2 hover:border-[#8f3424] hover:shadow-xl dark:border-[#3d2a1f] dark:bg-[#1c140f] dark:shadow-black/40 dark:hover:border-[#dca34f]"
          >
            <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-[#d39a38]/10 transition-transform duration-500 group-hover:scale-150" />
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#d39a38] to-[#9c6a1e] text-white shadow-md transition-transform duration-300 group-hover:scale-110">
              <FiPhone size={24} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#8f3424] dark:text-[#dca34f]">
              Phone Support
            </span>
            <a
              href="tel:+918824968974"
              className="mt-1 text-lg font-bold text-[#38271d] transition-colors hover:text-[#8f3424] dark:text-[#fffaf2] dark:hover:text-[#dca34f]"
            >
              +91 88249 68974
            </a>
            <p className="mt-2 text-xs leading-relaxed text-[#735f50] dark:text-[#c3b1a2]">
              Call directly for bespoke manufacturing & live order updates.
            </p>
          </div>

          {/* Email */}
          <div
            data-aos="fade-up"
            data-aos-delay="200"
            className="group relative flex flex-col overflow-hidden rounded-3xl border border-[#d8c09b] bg-[#fffaf2] p-6 shadow-lg shadow-[#38271d]/5 transition-all duration-500 hover:-translate-y-2 hover:border-[#8f3424] hover:shadow-xl dark:border-[#3d2a1f] dark:bg-[#1c140f] dark:shadow-black/40 dark:hover:border-[#dca34f]"
          >
            <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-[#70402e]/10 transition-transform duration-500 group-hover:scale-150" />
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#70402e] to-[#452319] text-white shadow-md transition-transform duration-300 group-hover:scale-110">
              <FiMail size={24} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#8f3424] dark:text-[#dca34f]">
              Official Email
            </span>
            <a
              href="mailto:VRAJCREATIONOFFICIAL@GMAIL.COM"
              className="mt-1 break-all text-xs font-bold text-[#38271d] transition-colors hover:text-[#8f3424] sm:text-sm dark:text-[#fffaf2] dark:hover:text-[#dca34f]"
            >
              VRAJCREATIONOFFICIAL@GMAIL.COM
            </a>
            <p className="mt-2 text-xs leading-relaxed text-[#735f50] dark:text-[#c3b1a2]">
              Send official specifications & architectural blueprints.
            </p>
          </div>

          {/* Working Hours */}
          <div
            data-aos="fade-up"
            data-aos-delay="300"
            className="group relative flex flex-col overflow-hidden rounded-3xl border border-[#d8c09b] bg-[#fffaf2] p-6 shadow-lg shadow-[#38271d]/5 transition-all duration-500 hover:-translate-y-2 hover:border-[#8f3424] hover:shadow-xl dark:border-[#3d2a1f] dark:bg-[#1c140f] dark:shadow-black/40 dark:hover:border-[#dca34f]"
          >
            <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-[#b99568]/10 transition-transform duration-500 group-hover:scale-150" />
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#b99568] to-[#80633f] text-white shadow-md transition-transform duration-300 group-hover:scale-110">
              <FiClock size={24} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#8f3424] dark:text-[#dca34f]">
              Working Hours
            </span>
            <strong className="mt-1 text-lg font-bold text-[#38271d] dark:text-[#fffaf2]">
              Mon - Sat
            </strong>
            <p className="mt-2 text-xs leading-relaxed text-[#735f50] dark:text-[#c3b1a2]">
              10:00 AM – 07:00 PM IST
              <span className="block font-medium opacity-80">Sunday: Closed</span>
            </p>
          </div>
        </div>

        {/* Action Channels Banner (Social Quick Links) */}
        <div
          data-aos="fade-up"
          className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-3"
        >
          {/* WhatsApp Direct */}
          <a
            href="https://api.whatsapp.com/send?phone=918824968974&text=Hello%20vraj%20creation%20!%20i%20visited%20your%20webside%20and%20i%20want%20to%20know%20more%20about%20your%20products"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative flex items-center justify-between overflow-hidden rounded-2xl border border-[#25D366]/40 bg-gradient-to-r from-[#25D366]/10 to-transparent p-5 shadow-md transition-all duration-300 hover:-translate-y-1 hover:border-[#25D366] hover:bg-[#25D366]/20 hover:shadow-lg dark:bg-[#25D366]/10"
          >
            <div className="flex items-center gap-3.5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#25D366] text-white shadow-md transition-transform duration-300 group-hover:scale-110">
                <FaWhatsapp size={24} />
              </div>
              <div>
                <strong className="block text-sm font-bold text-[#1f2d24] dark:text-[#d6f5e2]">
                  WhatsApp Studio
                </strong>
                <span className="text-xs text-[#4b6353] dark:text-[#9bc2a9]">
                  Instant Chat & Support
                </span>
              </div>
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#25D366]/20 text-[#25D366] transition-all duration-300 group-hover:bg-[#25D366] group-hover:text-white">
              <FiArrowUpRight size={16} className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </div>
          </a>

          {/* Instagram Direct */}
          <a
            href="https://www.instagram.com/vraj_creation_india?igsi=MWN1NTRnN3pyN291Zg=="
            target="_blank"
            rel="noopener noreferrer"
            className="group relative flex items-center justify-between overflow-hidden rounded-2xl border border-[#E1306C]/40 bg-gradient-to-r from-[#E1306C]/10 to-transparent p-5 shadow-md transition-all duration-300 hover:-translate-y-1 hover:border-[#E1306C] hover:bg-[#E1306C]/20 hover:shadow-lg dark:bg-[#E1306C]/10"
          >
            <div className="flex items-center gap-3.5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white shadow-md transition-transform duration-300 group-hover:scale-110">
                <FiInstagram size={22} />
              </div>
              <div>
                <strong className="block text-sm font-bold text-[#351b24] dark:text-[#f8dce5]">
                  Instagram Feed
                </strong>
                <span className="text-xs text-[#754454] dark:text-[#cfa2b1]">
                  @vraj_creation_india
                </span>
              </div>
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#E1306C]/20 text-[#E1306C] transition-all duration-300 group-hover:bg-[#E1306C] group-hover:text-white">
              <FiArrowUpRight size={16} className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </div>
          </a>

          {/* Pinterest Direct */}
          <a
            href="https://pin.it/1s54OiO68"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative flex items-center justify-between overflow-hidden rounded-2xl border border-[#E60023]/40 bg-gradient-to-r from-[#E60023]/10 to-transparent p-5 shadow-md transition-all duration-300 hover:-translate-y-1 hover:border-[#E60023] hover:bg-[#E60023]/20 hover:shadow-lg dark:bg-[#E60023]/10"
          >
            <div className="flex items-center gap-3.5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#E60023] text-white shadow-md transition-transform duration-300 group-hover:scale-110">
                <FaPinterestP size={22} />
              </div>
              <div>
                <strong className="block text-sm font-bold text-[#381a1c] dark:text-[#fcdbdc]">
                  Pinterest Boards
                </strong>
                <span className="text-xs text-[#77474a] dark:text-[#d6a5a8]">
                  Decor Inspirations
                </span>
              </div>
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#E60023]/20 text-[#E60023] transition-all duration-300 group-hover:bg-[#E60023] group-hover:text-white">
              <FiArrowUpRight size={16} className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </div>
          </a>
        </div>
      </div>
    </section>
  );
}
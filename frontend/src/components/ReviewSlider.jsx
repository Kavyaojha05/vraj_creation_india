import { useState, useEffect } from "react";
import { FiStar, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { RiDoubleQuotesL } from "react-icons/ri";
import myPhoto from "../assets/products/vraj1.png";

const reviews = [
  {
    id: 1,
    name: "Neha Sharma",
    location: "Jaipur, Rajasthan",
    initial: "N",
    rating: 5,
    review:
      "The products are so elegant and beautifully crafted. Totally loved the quality, finishing and authentic royal packaging!",
  },
  {
    id: 2,
    name: "Rahul Mehta",
    location: "Ahmedabad, Gujarat",
    initial: "R",
    rating: 5,
    review:
      "Beautiful craftsmanship and intricate metal details. The Krishna Jhoola looks even more breathtaking in person than in pictures.",
  },
  {
    id: 3,
    name: "Priya Joshi",
    location: "Pune, Maharashtra",
    initial: "P",
    rating: 5,
    review:
      "Loved the traditional Rajasthani design and fine hand-painted touches. It has become an eye-catching centerpiece in our living room.",
  },
];

export default function ReviewSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-slide every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % reviews.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % reviews.length);
  };

  const activeReview = reviews[currentIndex];

  return (
    <section
      id="reviews"
      className="relative w-full overflow-hidden bg-[#efe3d1] py-16 sm:py-20 lg:py-24 dark:bg-[#18110d]"
    >
      {/* Background Glows */}
      <div className="pointer-events-none absolute -left-32 top-10 h-80 w-80 rounded-full bg-[#8f3424]/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 bottom-10 h-80 w-80 rounded-full bg-[#d39a38]/10 blur-3xl" />

      <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div
          data-aos="fade-up"
          className="mx-auto mb-12 max-w-3xl text-center sm:mb-14 lg:mb-16"
        >
          <div className="mb-4 flex items-center justify-center gap-3">
            <span className="h-px w-8 bg-[#b99568] sm:w-12" />
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#8f3424] sm:text-xs dark:text-[#d19a76]">
              ✦ Customer Love ✦
            </p>
            <span className="h-px w-8 bg-[#b99568] sm:w-12" />
          </div>

          <h2 className="text-3xl font-bold leading-tight text-[#38271d] sm:text-4xl lg:text-5xl dark:text-[#f3e5d4]">
            Words From Our{" "}
            <span className="text-[#8f3424] dark:text-[#d19a76]">
              Happy Homes
            </span>
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-[#735f50] sm:text-base sm:leading-7 dark:text-[#b9a592]">
            Every handcrafted piece carries a story of heritage and passion. Here is
            what collectors and homemakers cherish about Vraj Creation.
          </p>
        </div>

        {/* Dual Card Showcase Layout */}
        <div className="grid w-full grid-cols-1 items-stretch gap-8 lg:grid-cols-12 lg:gap-10">

          {/* Active Review Testimonial Card */}
          <div
            data-aos="fade-right"
            className="relative flex min-h-[420px] flex-col justify-between overflow-hidden rounded-3xl border border-[#d3b88d] bg-[#fffaf2] p-8 shadow-[0_15px_40px_rgba(56,39,29,0.10)] sm:p-10 lg:col-span-7 lg:p-12 dark:border-[#574437] dark:bg-[#211914] dark:shadow-[0_15px_40px_rgba(0,0,0,0.3)]"
          >
            {/* Watermark Quote Icon */}
            <RiDoubleQuotesL className="pointer-events-none absolute right-6 top-6 text-7xl text-[#8f3424]/10 dark:text-[#d19a76]/10" />

            <div>
              {/* Star Ratings */}
              <div className="mb-6 flex items-center gap-1.5 text-[#d39a38]">
                {[...Array(activeReview.rating)].map((_, i) => (
                  <FiStar
                    key={i}
                    size={19}
                    fill="currentColor"
                    strokeWidth={1.5}
                  />
                ))}
              </div>

              {/* Dynamic Review Text with Transition */}
              <blockquote
                key={activeReview.id}
                className="relative text-lg font-medium leading-relaxed text-[#38271d] transition-opacity duration-500 sm:text-xl sm:leading-9 dark:text-[#f3e5d4]"
              >
                “{activeReview.review}”
              </blockquote>
            </div>

            {/* Customer Details & Navigation Controls */}
            <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-[#ebd8c1] pt-6 dark:border-[#3d2e24]">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#8f3424] to-[#71281a] text-lg font-bold text-white shadow-md dark:from-[#b66d4d] dark:to-[#8f4f34] dark:text-[#211914]">
                  {activeReview.initial}
                </div>

                <div>
                  <strong className="block text-base font-bold text-[#38271d] dark:text-[#f3e5d4]">
                    {activeReview.name}
                  </strong>
                  <span className="block text-xs text-[#92745a] dark:text-[#a9917d]">
                    {activeReview.location} • Verified Buyer
                  </span>
                </div>
              </div>

              {/* Slider Controls */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrev}
                  aria-label="Previous Review"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-[#d3b88d] bg-white text-[#8f3424] shadow-sm transition-all duration-300 hover:bg-[#8f3424] hover:text-white dark:border-[#574437] dark:bg-[#2c201a] dark:text-[#d19a76] dark:hover:bg-[#b66d4d] dark:hover:text-[#211914]"
                >
                  <FiChevronLeft size={18} />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  aria-label="Next Review"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-[#d3b88d] bg-white text-[#8f3424] shadow-sm transition-all duration-300 hover:bg-[#8f3424] hover:text-white dark:border-[#574437] dark:bg-[#2c201a] dark:text-[#d19a76] dark:hover:bg-[#b66d4d] dark:hover:text-[#211914]"
                >
                  <FiChevronRight size={18} />
                </button>
              </div>
            </div>

            {/* Pagination Dots */}
            <div className="mt-5 flex items-center gap-2">
              {reviews.map((_, dotIndex) => (
                <button
                  key={dotIndex}
                  type="button"
                  onClick={() => setCurrentIndex(dotIndex)}
                  aria-label={`Go to slide ${dotIndex + 1}`}
                  className={`h-2 rounded-full transition-all duration-300 ${currentIndex === dotIndex
                      ? "w-8 bg-[#8f3424] dark:bg-[#b66d4d]"
                      : "w-2 bg-[#d3b88d] dark:bg-[#604a3a]"
                    }`}
                />
              ))}
            </div>
          </div>

          {/* Right Image Showcase Card (Using myPhoto) */}
          <div
            data-aos="fade-left"
            className="group relative flex min-h-[420px] w-full overflow-hidden rounded-3xl border border-[#d3b88d] bg-[#eadbc5] shadow-[0_15px_40px_rgba(56,39,29,0.10)] lg:col-span-5 dark:border-[#574437] dark:bg-[#211914]"
          >
            <img
              src={myPhoto}
              alt="Vraj Creation Handcrafted Art"
              className="h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
            />

            {/* Soft Ambient Vignette for Contrast */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10" />
          </div>

        </div>

        {/* Bottom Guarantee Banner */}
        <div
          data-aos="fade-up"
          data-aos-delay="150"
          className="mt-12 text-center"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#92745a] dark:text-[#9c826c]">
            ✦ 100% Authentic Handcrafts • Secured Express Delivery • 5-Star Rated ✦
          </p>
        </div>
      </div>
    </section>
  );
}
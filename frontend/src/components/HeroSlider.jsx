import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade } from "swiper/modules";
import {
  FiArrowRight,
  FiChevronLeft,
  FiChevronRight,
  FiLoader,
} from "react-icons/fi";

import "swiper/css";
import "swiper/css/effect-fade";

import video1 from "../assets/videos/video1.mp4";
import video2 from "../assets/videos/video2.mp4";
import video3 from "../assets/videos/video3.mp4";

const slides = [
  {
    video: video1,
    tag: "VRAJ CREATION INDIA",
    tagSub: "Handcrafted • Traditional • Unique",
    title: "Where Indian Tradition",
    highlight: "Meets Modern Décor.",
    desc:
      "Handcrafted wall décor, table décor, artistic figurines & unique gifting pieces inspired by the rich heritage of India.",
    btnText: "DISCOVER VRAJ CREATION",
    btnHref: "/discover",
  },
  {
    video: video2,
    tag: "BEAUTIFUL SPACES START WITH BEAUTIFUL DETAILS",
    tagSub: "Art • Décor • Craftsmanship",
    title: "Decorate Your Space.",
    highlight: "Celebrate Indian Art.",
    desc:
      "Unique wall décor, table décor and handcrafted creations designed to bring warmth, character and beauty to your space.",
    btnText: "DISCOVER VRAJ CREATION",
    btnHref: "/discover",
  },
  {
    video: video3,
    tag: "HANDCRAFTED ART",
    tagSub: "Musician Figures • Tea Light Holders",
    title: "Light Up Your Space",
    highlight: "With Indian Art.",
    desc:
      "Beautifully crafted musician figure tea light holders that add warmth, character and an artistic touch to your décor.",
    btnText: "DISCOVER VRAJ CREATION",
    btnHref: "/discover",
  },
];

export default function HeroSlider() {
  const swiperRef = useRef(null);
  const videoRefs = useRef({});

  const [active, setActive] = useState(0);
  const [heroLoaded, setHeroLoaded] = useState(false);
  const [loadedVideos, setLoadedVideos] = useState({});
  const [videoErrors, setVideoErrors] = useState({});

  const firstVideoLoaded = loadedVideos[0];

  useEffect(() => {
    const firstVideo = videoRefs.current[0];

    if (!firstVideo) return;

    const handleLoaded = () => {
      setLoadedVideos((prev) => ({
        ...prev,
        0: true,
      }));

      setTimeout(() => {
        setHeroLoaded(true);
      }, 250);
    };

    if (firstVideo.readyState >= 3) {
      handleLoaded();
    } else {
      firstVideo.addEventListener(
        "canplay",
        handleLoaded
      );
    }

    return () => {
      firstVideo.removeEventListener(
        "canplay",
        handleLoaded
      );
    };
  }, []);

  const handleVideoLoaded = (index) => {
    setLoadedVideos((prev) => ({
      ...prev,
      [index]: true,
    }));
  };

  const handleVideoError = (index) => {
    setVideoErrors((prev) => ({
      ...prev,
      [index]: true,
    }));

    if (index === 0) {
      setHeroLoaded(true);
    }
  };

  return (
    <section className="relative h-[100svh] min-h-[580px] w-full overflow-hidden bg-[#17110d]">

      {/* =====================================================
          INITIAL PAGE LOADER
      ===================================================== */}

      {!heroLoaded && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center bg-[#17110d]">
          <div className="flex flex-col items-center text-center">

            <div className="relative mb-6 flex h-16 w-16 items-center justify-center">
              <div className="absolute inset-0 animate-ping rounded-full bg-[#e5b567]/10" />

              <div className="relative flex h-14 w-14 items-center justify-center rounded-full border border-[#e5b567]/40 bg-black/30 backdrop-blur-md">
                <FiLoader
                  size={25}
                  className="animate-spin text-[#e5b567]"
                />
              </div>
            </div>

            <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#e5b567]">
              Vraj Creation
            </p>

            <p className="mt-2 text-[11px] tracking-[0.15em] text-white/50">
              Loading handcrafted experience...
            </p>

            <div className="mt-6 h-1 w-32 overflow-hidden rounded-full bg-white/10">
              <div className="h-full w-1/2 animate-pulse rounded-full bg-[#e5b567]" />
            </div>

          </div>
        </div>
      )}

      {/* =====================================================
          SWIPER
      ===================================================== */}

      <div
        className={`h-full w-full transition-opacity duration-1000 ${
          heroLoaded
            ? "opacity-100"
            : "opacity-0"
        }`}
      >
        <Swiper
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
          }}
          modules={[Autoplay, EffectFade]}
          effect="fade"
          fadeEffect={{
            crossFade: true,
          }}
          loop={true}
          speed={800}
          autoplay={{
            delay: 6000,
            disableOnInteraction: false,
            pauseOnMouseEnter: false,
          }}
          onSlideChange={(swiper) => {
            setActive(swiper.realIndex);
          }}
          className="!h-full !w-full"
        >
          {slides.map((slide, index) => (
            <SwiperSlide
              key={index}
              className="relative !h-full !w-full overflow-hidden"
            >

              {/* =================================================
                  VIDEO BACKGROUND
              ================================================= */}

              {!videoErrors[index] ? (
                <video
                  ref={(element) => {
                    if (element) {
                      videoRefs.current[index] =
                        element;
                    }
                  }}
                  src={slide.video}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload={
                    index === 0
                      ? "auto"
                      : "metadata"
                  }
                  onCanPlay={() =>
                    handleVideoLoaded(index)
                  }
                  onError={() =>
                    handleVideoError(index)
                  }
                  className={`
                    absolute
                    inset-0
                    h-full
                    w-full
                    object-cover
                    object-center
                    brightness-[0.92]
                    contrast-[1.05]
                    transition-opacity
                    duration-1000
                    ${
                      loadedVideos[index]
                        ? "opacity-100"
                        : "opacity-0"
                    }
                  `}
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-[#2b211a] via-[#17110d] to-black" />
              )}

              {/* =================================================
                  VIDEO LOADING OVERLAY
              ================================================= */}

              {!loadedVideos[index] &&
                !videoErrors[index] && (
                  <div className="absolute inset-0 z-[5] bg-[#17110d]">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#2b211a] via-[#17110d] to-black" />

                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-[#e5b567]" />
                    </div>
                  </div>
                )}

              {/* =================================================
                  LEFT DARK OVERLAY
              ================================================= */}

              <div
                className="
                  absolute
                  inset-0
                  z-10
                  bg-gradient-to-r
                  from-black/80
                  via-black/35
                  to-transparent
                "
              />

              {/* =================================================
                  BOTTOM OVERLAY
              ================================================= */}

              <div
                className="
                  absolute
                  inset-x-0
                  bottom-0
                  z-10
                  h-32
                  bg-gradient-to-t
                  from-black/70
                  to-transparent
                "
              />

              {/* =================================================
                  CONTENT
              ================================================= */}

              <div className="relative z-20 flex h-full w-full items-center">
                <div className="mx-auto w-full max-w-7xl px-6 sm:px-10 lg:px-12">
                  <div className="max-w-2xl text-left">

                    {/* TAG */}

                    <div className="mb-3.5 flex flex-col gap-1">
                      <span
                        className="
                          text-[11px]
                          font-bold
                          uppercase
                          tracking-[0.25em]
                          text-[#e5b567]
                          drop-shadow-sm
                          sm:text-xs
                        "
                      >
                        ✦ {slide.tag}
                      </span>

                      {slide.tagSub && (
                        <span
                          className="
                            text-[10px]
                            font-medium
                            tracking-[0.18em]
                            text-[#f0dfcd]/80
                            sm:text-[11px]
                          "
                        >
                          {slide.tagSub}
                        </span>
                      )}
                    </div>

                    {/* TITLE */}

                    <h1
                      className="
                        mb-4
                        text-3xl
                        font-extrabold
                        leading-tight
                        text-white
                        drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]
                        sm:text-5xl
                        lg:text-6xl
                      "
                    >
                      <span className="block">
                        {slide.title}
                      </span>

                      <span
                        className="
                          mt-1
                          block
                          bg-gradient-to-r
                          from-[#ffd89b]
                          to-[#e5a054]
                          bg-clip-text
                          text-transparent
                        "
                      >
                        {slide.highlight}
                      </span>
                    </h1>

                    {/* DESCRIPTION */}

                    <p
                      className="
                        mb-7
                        max-w-xl
                        text-sm
                        leading-relaxed
                        text-[#f0dfcd]
                        drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]
                        sm:text-base
                      "
                    >
                      {slide.desc}
                    </p>

                    {/* BUTTON */}

                    <div className="flex items-center">
                      <Link
                        to={slide.btnHref}
                        className="
                          group
                          inline-flex
                          items-center
                          gap-2.5
                          rounded-full
                          bg-[#8f3424]
                          px-6
                          py-3.5
                          text-xs
                          font-bold
                          uppercase
                          tracking-wider
                          text-white
                          shadow-lg
                          transition-all
                          duration-300
                          hover:-translate-y-0.5
                          hover:bg-[#a83d29]
                          hover:shadow-xl
                          active:scale-95
                          sm:px-7
                          sm:text-sm
                        "
                      >
                        <span>{slide.btnText}</span>

                        <FiArrowRight
                          size={16}
                          className="
                            transition-transform
                            duration-300
                            group-hover:translate-x-1
                          "
                        />
                      </Link>
                    </div>

                  </div>
                </div>
              </div>

            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* =====================================================
          PREVIOUS BUTTON
      ===================================================== */}

      <button
        type="button"
        onClick={() =>
          swiperRef.current?.slidePrev()
        }
        aria-label="Previous slide"
        className="
          absolute
          left-6
          top-1/2
          z-30
          hidden
          -translate-y-1/2
          items-center
          justify-center
          rounded-full
          border
          border-white/25
          bg-black/35
          p-2.5
          text-white
          backdrop-blur-sm
          transition-all
          duration-300
          hover:border-[#8f3424]
          hover:bg-[#8f3424]
          sm:flex
        "
      >
        <FiChevronLeft size={20} />
      </button>

      {/* =====================================================
          NEXT BUTTON
      ===================================================== */}

      <button
        type="button"
        onClick={() =>
          swiperRef.current?.slideNext()
        }
        aria-label="Next slide"
        className="
          absolute
          right-6
          top-1/2
          z-30
          hidden
          -translate-y-1/2
          items-center
          justify-center
          rounded-full
          border
          border-white/25
          bg-black/35
          p-2.5
          text-white
          backdrop-blur-sm
          transition-all
          duration-300
          hover:border-[#8f3424]
          hover:bg-[#8f3424]
          sm:flex
        "
      >
        <FiChevronRight size={20} />
      </button>

      {/* =====================================================
          SLIDE INDICATORS
      ===================================================== */}

      <div
        className="
          absolute
          bottom-8
          left-6
          right-6
          z-30
          flex
          items-center
          justify-between
          sm:left-12
          sm:right-12
        "
      >
        <div className="flex items-center gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() =>
                swiperRef.current?.slideToLoop(
                  index
                )
              }
              aria-label={`Go to slide ${index + 1}`}
              aria-current={
                active === index
                  ? "true"
                  : undefined
              }
              className={`
                h-1.5
                rounded-full
                transition-all
                duration-300
                ${
                  active === index
                    ? "w-8 bg-[#e5b567]"
                    : "w-3 bg-white/40 hover:bg-white/70"
                }
              `}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
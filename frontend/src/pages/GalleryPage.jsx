import { useEffect, useRef, useState } from "react";
import {
  FiLayers,
  FiVideo,
  FiImage,
  FiPlay,
  FiPause,
} from "react-icons/fi";

import Header from "../components/Header";
import Footer from "../components/Footer";

import video1 from "../assets/videos/video1.mp4";
import video2 from "../assets/videos/video2.mp4";
import video3 from "../assets/videos/video3.mp4";
import video4 from "../assets/videos/video4.mp4";
import video5 from "../assets/videos/video5.mp4";

import { useProducts } from "../context/ProductContext";

const galleryVideos = [
  {
    id: "video1",
    src: video1,
    title: "Green Jharokha",
    description: "Beautiful handcrafted wall décor",
  },
  {
    id: "video2",
    src: video2,
    title: "Handpainted Elephant Stool 01",
    description: "Traditional craftsmanship with modern styling",
  },
  {
    id: "video3",
    src: video3,
    title: "Musician Figures Tea Light Holders Set",
    description: "Elegant handcrafted musician figures",
  },
  {
    id: "video4",
    src: video4,
    title: "Hanging Radha Krishna Jhoola",
    description: "Unique decorative metal artwork",
  },
  {
    id: "video5",
    src: video5,
    title: "Handpainted Square Chowki Table Decor",
    description: "Beautiful handcrafted home accents",
  },
];

const FALLBACK_IMAGE =
  "https://via.placeholder.com/800x800?text=Vraj+Creation";

const getProductImage = (product) => {
  if (!product) {
    return FALLBACK_IMAGE;
  }

  if (
    typeof product.image === "string" &&
    product.image.trim() !== ""
  ) {
    return product.image;
  }

  if (
    typeof product.productImage === "string" &&
    product.productImage.trim() !== ""
  ) {
    return product.productImage;
  }

  if (
    typeof product.imageUrl === "string" &&
    product.imageUrl.trim() !== ""
  ) {
    return product.imageUrl;
  }

  if (
    typeof product.thumbnail === "string" &&
    product.thumbnail.trim() !== ""
  ) {
    return product.thumbnail;
  }

  if (
    Array.isArray(product.images) &&
    product.images.length > 0
  ) {
    const image = product.images[0];

    if (typeof image === "string") {
      return image;
    }

    if (image && typeof image === "object") {
      return (
        image.url ||
        image.secure_url ||
        image.image ||
        image.src ||
        FALLBACK_IMAGE
      );
    }
  }

  return FALLBACK_IMAGE;
};

const GalleryPage = () => {
  const {
    products,
    loading: productsLoading,
    error: productsError,
  } = useProducts();

  const [activeTab, setActiveTab] = useState("videos");
  const [activeVideo, setActiveVideo] = useState(null);
  const [pageReady, setPageReady] = useState(false);

  const videoRefs = useRef({});
  const hoverTimers = useRef({});

  useEffect(() => {
    const timer = setTimeout(() => {
      setPageReady(true);
    }, 900);

    return () => clearTimeout(timer);
  }, []);

  const stopVideo = (video) => {
    if (!video) return;

    try {
      video.pause();
      video.currentTime = 0;
      video.muted = true;
    } catch (error) {
      console.warn("Unable to stop video:", error);
    }
  };

  const stopAllVideos = () => {
    Object.values(videoRefs.current).forEach((video) => {
      stopVideo(video);
    });

    Object.values(hoverTimers.current).forEach((timer) => {
      clearTimeout(timer);
    });

    hoverTimers.current = {};
    setActiveVideo(null);
  };

  const playVideo = async (id, withSound = true) => {
    const video = videoRefs.current[id];

    if (!video) return;

    Object.entries(videoRefs.current).forEach(
      ([videoId, otherVideo]) => {
        if (videoId !== id) {
          stopVideo(otherVideo);
        }
      }
    );

    try {
      video.currentTime = 0;
      video.playsInline = true;

      if (withSound) {
        video.muted = false;
        video.volume = 1;

        await video.play();

        setActiveVideo(id);
        return;
      }

      video.muted = true;

      await video.play();

      setActiveVideo(id);
    } catch (error) {
      console.warn("Audio autoplay blocked. Trying muted video.");

      try {
        video.muted = true;
        await video.play();

        setActiveVideo(id);
      } catch (playError) {
        console.warn("Video playback failed:", playError);
        setActiveVideo(null);
      }
    }
  };

  const handleVideoClick = async (id) => {
    const video = videoRefs.current[id];

    if (!video) return;

    if (activeVideo === id && !video.paused) {
      stopVideo(video);
      setActiveVideo(null);
      return;
    }

    await playVideo(id, true);
  };

  const handleVideoMouseEnter = (id) => {
    clearTimeout(hoverTimers.current[id]);

    hoverTimers.current[id] = setTimeout(() => {
      playVideo(id, true);
    }, 150);
  };

  const handleVideoMouseLeave = (id) => {
    clearTimeout(hoverTimers.current[id]);

    hoverTimers.current[id] = setTimeout(() => {
      const video = videoRefs.current[id];

      if (video) {
        stopVideo(video);
      }

      setActiveVideo((current) =>
        current === id ? null : current
      );
    }, 100);
  };

  const handleVideoEnded = (id) => {
    const video = videoRefs.current[id];

    if (video) {
      stopVideo(video);
    }

    setActiveVideo(null);
  };

  const changeTab = (tab) => {
    if (tab === "images") {
      stopAllVideos();
    }

    setActiveTab(tab);
  };

  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        stopAllVideos();
      }
    };

    const handleBlur = () => {
      stopAllVideos();
    };

    document.addEventListener(
      "visibilitychange",
      handleVisibility
    );

    window.addEventListener("blur", handleBlur);

    return () => {
      document.removeEventListener(
        "visibilitychange",
        handleVisibility
      );

      window.removeEventListener("blur", handleBlur);
    };
  }, []);

  useEffect(() => {
    return () => {
      Object.values(videoRefs.current).forEach((video) => {
        stopVideo(video);
      });

      Object.values(hoverTimers.current).forEach((timer) => {
        clearTimeout(timer);
      });
    };
  }, []);

  const handleImageError = (event) => {
    const currentSrc =
      event.currentTarget.getAttribute("src");

    if (currentSrc !== FALLBACK_IMAGE) {
      event.currentTarget.src = FALLBACK_IMAGE;
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f5ef] text-[#211c17] transition-colors duration-500 dark:bg-[#11100e] dark:text-white">
      <Header />

      <main
        className={`transition-all duration-1000 ${
          pageReady
            ? "translate-y-0 opacity-100"
            : "translate-y-5 opacity-0"
        }`}
      >
        <section className="relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-28">
          <div className="pointer-events-none absolute -left-40 top-20 h-80 w-80 rounded-full bg-amber-500/10 blur-3xl" />

          <div className="pointer-events-none absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-orange-500/10 blur-3xl" />

          <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
            <div
              data-aos="fade-up"
              className="max-w-4xl"
            >
              <div className="mb-6 inline-flex items-center gap-3 rounded-full border border-amber-700/20 bg-white/70 px-4 py-2 text-sm font-semibold text-amber-800 shadow-sm backdrop-blur dark:border-amber-400/20 dark:bg-white/5 dark:text-amber-300">
                <FiLayers />

                <span>Vraj Creation Gallery</span>
              </div>

              <h1 className="text-4xl font-black leading-tight tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                Crafted with{" "}
                <span className="text-amber-700 dark:text-amber-400">
                  Tradition
                </span>
                ,
                <br />
                Designed for{" "}
                <span className="text-orange-700 dark:text-orange-400">
                  Modern Homes
                </span>
              </h1>

              <p className="mt-7 max-w-2xl text-base leading-8 text-neutral-600 dark:text-neutral-400 sm:text-lg">
                Explore our handcrafted décor,
                artistic sculptures and timeless
                home accents created with passion
                and traditional craftsmanship.
              </p>
            </div>
          </div>
        </section>

        <section className="pb-24">
          <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
            <div
              data-aos="fade-up"
              className="mb-10 flex justify-center"
            >
              <div className="inline-flex rounded-2xl border border-black/10 bg-white p-1.5 shadow-sm dark:border-white/10 dark:bg-white/5">
                <button
                  type="button"
                  onClick={() => changeTab("videos")}
                  className={`flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition ${
                    activeTab === "videos"
                      ? "bg-[#211c17] text-white shadow-md dark:bg-white dark:text-[#211c17]"
                      : "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-white/10"
                  }`}
                >
                  <FiVideo />

                  <span>Videos</span>

                  <span className="rounded-full bg-black/10 px-2 py-0.5 text-xs dark:bg-white/10">
                    {galleryVideos.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => changeTab("images")}
                  className={`flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition ${
                    activeTab === "images"
                      ? "bg-[#211c17] text-white shadow-md dark:bg-white dark:text-[#211c17]"
                      : "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-white/10"
                  }`}
                >
                  <FiImage />

                  <span>Images</span>

                  <span className="rounded-full bg-black/10 px-2 py-0.5 text-xs dark:bg-white/10">
                    {products?.length || 0}
                  </span>
                </button>
              </div>
            </div>

            {productsLoading &&
              activeTab === "images" && (
                <div className="flex min-h-[300px] items-center justify-center">
                  <div className="text-center">
                    <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-neutral-300 border-t-[#211c17] dark:border-neutral-700 dark:border-t-white" />

                    <p className="mt-4 text-sm font-semibold text-neutral-500 dark:text-neutral-400">
                      Loading gallery...
                    </p>
                  </div>
                </div>
              )}

            {!productsLoading &&
              productsError &&
              activeTab === "images" && (
                <div className="rounded-3xl border border-dashed border-red-300 bg-red-50 p-12 text-center dark:border-red-900 dark:bg-red-950/20">
                  <FiImage
                    size={40}
                    className="mx-auto mb-4 text-red-400"
                  />

                  <h3 className="text-xl font-bold">
                    Unable to load gallery
                  </h3>

                  <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
                    {productsError}
                  </p>
                </div>
              )}

            {activeTab === "videos" && (
              <div className="grid grid-cols-1 gap-7 md:grid-cols-2 lg:grid-cols-3">
                {galleryVideos.map((item, index) => {
                  const isPlaying =
                    activeVideo === item.id;

                  return (
                    <article
                      key={item.id}
                      data-aos="fade-up"
                      data-aos-delay={index * 80}
                      className="group overflow-hidden rounded-3xl border border-black/10 bg-white shadow-sm transition duration-500 hover:-translate-y-1 hover:shadow-2xl dark:border-white/10 dark:bg-[#181613]"
                    >
                      <div
                        className="relative aspect-[4/5] cursor-pointer overflow-hidden bg-black"
                        onClick={() =>
                          handleVideoClick(item.id)
                        }
                        onMouseEnter={() =>
                          handleVideoMouseEnter(item.id)
                        }
                        onMouseLeave={() =>
                          handleVideoMouseLeave(item.id)
                        }
                      >
                        <video
                          ref={(element) => {
                            if (element) {
                              videoRefs.current[item.id] =
                                element;

                              element.playsInline = true;
                            }
                          }}
                          src={item.src}
                          className="absolute inset-0 block h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                          playsInline
                          preload="metadata"
                          onEnded={() =>
                            handleVideoEnded(item.id)
                          }
                        />

                        {!isPlaying && (
                          <div className="pointer-events-none absolute inset-0 bg-black/25 transition-opacity duration-300 group-hover:bg-black/10" />
                        )}

                        {!isPlaying && (
                          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/40 bg-black/50 text-white shadow-2xl backdrop-blur-md transition duration-300 group-hover:scale-110 group-hover:bg-black/70">
                              <FiPlay
                                size={25}
                                fill="currentColor"
                                className="ml-1"
                              />
                            </div>
                          </div>
                        )}

                        {isPlaying && (
                          <div className="pointer-events-none absolute left-4 top-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md">
                              <FiPause size={17} />
                            </div>
                          </div>
                        )}

                        <div className="pointer-events-none absolute right-4 top-4 rounded-full bg-black/50 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-md">
                          {String(index + 1).padStart(
                            2,
                            "0"
                          )}
                        </div>

                        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

                        <div className="pointer-events-none absolute bottom-0 left-0 right-0 p-5 text-white">
                          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">
                            Handcrafted
                          </p>

                          <h3 className="text-xl font-bold leading-tight">
                            {item.title}
                          </h3>

                          <p className="mt-1 text-sm text-white/75">
                            {item.description}
                          </p>

                          <p className="mt-3 text-xs font-medium text-white/70">
                            {isPlaying
                              ? "Playing • Audio ON"
                              : "Hover to play • Tap on mobile"}
                          </p>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}

            {activeTab === "images" &&
              !productsLoading &&
              !productsError && (
                <>
                  {products?.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                      {products.map(
                        (product, index) => {
                          const image =
                            getProductImage(product);

                          const name =
                            product?.name ||
                            "Handcrafted Product";

                          const category =
                            product?.category ||
                            "Handcrafted Collection";

                          return (
                            <article
                              key={
                                product?._id ||
                                product?.id ||
                                product?.productId ||
                                `product-${index}`
                              }
                              data-aos="fade-up"
                              data-aos-delay={
                                (index % 4) * 70
                              }
                              className="group overflow-hidden rounded-3xl border border-black/10 bg-white shadow-sm transition duration-500 hover:-translate-y-1 hover:shadow-xl dark:border-white/10 dark:bg-[#181613]"
                            >
                              <div className="relative aspect-square overflow-hidden bg-neutral-100 dark:bg-neutral-900">
                                <img
                                  src={image}
                                  alt={name}
                                  loading="lazy"
                                  decoding="async"
                                  onError={
                                    handleImageError
                                  }
                                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />

                                <div className="absolute right-3 top-3 rounded-full bg-black/55 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-md">
                                  {String(
                                    index + 1
                                  ).padStart(2, "0")}
                                </div>
                              </div>

                              <div className="p-5">
                                <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-amber-700 dark:text-amber-400">
                                  Vraj Creation
                                </p>

                                <h3 className="line-clamp-2 text-base font-bold text-[#211c17] dark:text-white">
                                  {name}
                                </h3>

                                <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
                                  {category}
                                </p>
                              </div>
                            </article>
                          );
                        }
                      )}
                    </div>
                  ) : (
                    <div className="rounded-3xl border border-dashed border-black/20 bg-white/60 p-12 text-center dark:border-white/20 dark:bg-white/5">
                      <FiImage
                        size={40}
                        className="mx-auto mb-4 text-neutral-400"
                      />

                      <h3 className="text-xl font-bold">
                        No images available
                      </h3>

                      <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
                        Product images will appear here.
                      </p>
                    </div>
                  )}
                </>
              )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default GalleryPage;
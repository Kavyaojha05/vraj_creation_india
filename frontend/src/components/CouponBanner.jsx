import { useEffect, useState } from "react";
import { couponAPI } from "../services/api";

const CAMPAIGN_API =
"https://vraj-creation-web-backend.onrender.com/api/campaign/spin";

const CouponBanner = () => {
  const [coupons, setCoupons] = useState([]);
  const [campaign, setCampaign] = useState(null);

  const [loading, setLoading] = useState(true);
  const [campaignLoading, setCampaignLoading] =
    useState(true);

  const [copiedCode, setCopiedCode] = useState("");

  const [timeLeft, setTimeLeft] = useState(null);

  // =====================================================
  // FETCH COUPONS + SPIN CAMPAIGN
  // =====================================================

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setCampaignLoading(true);

        // -----------------------------------------------
        // FETCH NORMAL COUPONS
        // -----------------------------------------------

        const couponResponse =
          await couponAPI.getAll();

        const couponList = Array.isArray(
          couponResponse?.coupons
        )
          ? couponResponse.coupons
          : [];

        const now = new Date();

        const activeCoupons =
          couponList.filter((coupon) => {
            if (coupon.active !== true) {
              return false;
            }

            if (
              coupon.startDate &&
              new Date(coupon.startDate) > now
            ) {
              return false;
            }

            if (
              coupon.expiryDate &&
              new Date(coupon.expiryDate) <= now
            ) {
              return false;
            }

            return true;
          });

        setCoupons(activeCoupons);

        // -----------------------------------------------
        // FETCH SPIN CAMPAIGN
        // -----------------------------------------------

        const campaignResponse =
          await fetch(CAMPAIGN_API);

        const campaignData =
          await campaignResponse.json();

        if (
          campaignData?.success &&
          campaignData?.active &&
          campaignData?.campaign
        ) {
          setCampaign(
            campaignData.campaign
          );
        } else {
          setCampaign(null);
        }
      } catch (error) {
        console.error(
          "Coupon/Campaign fetch error:",
          error
        );

        setCoupons([]);
        setCampaign(null);
      } finally {
        setLoading(false);
        setCampaignLoading(false);
      }
    };

    fetchData();
  }, []);

  // =====================================================
  // LIVE CAMPAIGN COUNTDOWN
  // =====================================================

  useEffect(() => {
    if (!campaign?.expiryDate) {
      setTimeLeft(null);
      return;
    }

    const updateTimer = () => {
      const now =
        new Date().getTime();

      const expiry =
        new Date(
          campaign.expiryDate
        ).getTime();

      const difference =
        expiry - now;

      if (difference <= 0) {
        setTimeLeft({
          expired: true,
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
        });

        setCampaign(null);

        return;
      }

      const days = Math.floor(
        difference /
          (1000 * 60 * 60 * 24)
      );

      const hours = Math.floor(
        (difference %
          (1000 * 60 * 60 * 24)) /
          (1000 * 60 * 60)
      );

      const minutes = Math.floor(
        (difference %
          (1000 * 60 * 60)) /
          (1000 * 60)
      );

      const seconds = Math.floor(
        (difference %
          (1000 * 60)) /
          1000
      );

      setTimeLeft({
        expired: false,
        days,
        hours,
        minutes,
        seconds,
      });
    };

    updateTimer();

    const timer =
      setInterval(
        updateTimer,
        1000
      );

    return () => {
      clearInterval(timer);
    };
  }, [campaign]);

  // =====================================================
  // COPY COUPON
  // =====================================================

  const handleCopy = async (code) => {
    try {
      await navigator.clipboard.writeText(
        code
      );

      setCopiedCode(code);

      setTimeout(() => {
        setCopiedCode("");
      }, 2000);
    } catch (error) {
      console.error(
        "Copy coupon error:",
        error
      );
    }
  };

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (date) => {
    if (!date) return "";

    return new Date(
      date
    ).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  // =====================================================
  // FORMAT TIME
  // =====================================================

  const formatTime = (value) => {
    return String(value).padStart(
      2,
      "0"
    );
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading || campaignLoading) {
    return (
      <section className="w-full px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="animate-pulse rounded-3xl bg-gray-100 p-8 dark:bg-gray-900">
            <div className="mx-auto h-7 w-52 rounded bg-gray-200 dark:bg-gray-800" />

            <div className="mx-auto mt-4 h-4 max-w-md rounded bg-gray-200 dark:bg-gray-800" />

            <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map(
                (item) => (
                  <div
                    key={item}
                    className="h-40 rounded-3xl bg-gray-200 dark:bg-gray-800"
                  />
                )
              )}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // =====================================================
  // NO OFFERS
  // =====================================================

  if (
    coupons.length === 0 &&
    !campaign
  ) {
    return null;
  }

  // =====================================================
  // UI
  // =====================================================

  return (
    <section
      id="offers"
      className="relative w-full overflow-hidden px-4 py-16 sm:px-6 lg:px-8"
    >
      {/* =================================================
          BACKGROUND
      ================================================= */}

      <div className="pointer-events-none absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#d39a38]/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl">

        {/* =================================================
            SPIN & WIN CAMPAIGN
        ================================================= */}

        {campaign &&
          timeLeft &&
          !timeLeft.expired && (
            <div className="mb-12 overflow-hidden rounded-[2rem] border border-[#d39a38]/30 bg-gradient-to-br from-[#8f3424] via-[#74291d] to-[#4b1d16] p-6 text-white shadow-[0_20px_60px_rgba(0,0,0,0.18)] sm:p-8 lg:p-10">

              {/* Decorative */}
              <div className="pointer-events-none absolute" />

              <div className="relative grid items-center gap-8 lg:grid-cols-[1fr_auto]">

                {/* LEFT */}
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-[#dca34f]/40 bg-black/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-[#f5cf82]">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-[#f5cf82]" />

                    Spin & Win
                  </div>

                  <h2 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
                    {campaign.name ||
                      "Vraj Creation Spin & Win"}
                  </h2>

                  <p className="mt-4 max-w-2xl text-sm leading-7 text-white/75 sm:text-base">
                    Spin the wheel and win an
                    exclusive discount of 3%,
                    5%, 7% or 10%.
                  </p>

                  {/* Rewards */}
                  <div className="mt-6 flex flex-wrap gap-3">
                    {[
                      3,
                      5,
                      7,
                      10,
                    ].map(
                      (reward) => (
                        <div
                          key={reward}
                          className="rounded-2xl border border-[#dca34f]/30 bg-white/10 px-5 py-3 backdrop-blur-sm"
                        >
                          <span className="text-2xl font-black text-[#f5cf82]">
                            {reward}%
                          </span>

                          <span className="ml-1 text-xs font-bold uppercase text-white/70">
                            OFF
                          </span>
                        </div>
                      )
                    )}
                  </div>

                  {/* Validity */}
                  <p className="mt-6 text-xs text-white/60">
                    Offer valid until{" "}
                    <span className="font-bold text-white">
                      {formatDate(
                        campaign.expiryDate
                      )}
                    </span>
                  </p>
                </div>

                {/* RIGHT COUNTDOWN */}
                <div className="min-w-[280px] rounded-3xl border border-[#dca34f]/30 bg-black/20 p-5 backdrop-blur-sm sm:p-6">

                  <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-[#f5cf82]">
                    Offer Ends In
                  </p>

                  <div className="mt-5 grid grid-cols-4 gap-2">

                    {/* DAYS */}
                    <div className="rounded-2xl bg-white/10 p-3 text-center">
                      <p className="text-2xl font-black sm:text-3xl">
                        {formatTime(
                          timeLeft.days
                        )}
                      </p>

                      <p className="mt-1 text-[9px] font-bold uppercase tracking-widest text-white/60">
                        Days
                      </p>
                    </div>

                    {/* HOURS */}
                    <div className="rounded-2xl bg-white/10 p-3 text-center">
                      <p className="text-2xl font-black sm:text-3xl">
                        {formatTime(
                          timeLeft.hours
                        )}
                      </p>

                      <p className="mt-1 text-[9px] font-bold uppercase tracking-widest text-white/60">
                        Hours
                      </p>
                    </div>

                    {/* MINUTES */}
                    <div className="rounded-2xl bg-white/10 p-3 text-center">
                      <p className="text-2xl font-black sm:text-3xl">
                        {formatTime(
                          timeLeft.minutes
                        )}
                      </p>

                      <p className="mt-1 text-[9px] font-bold uppercase tracking-widest text-white/60">
                        Min
                      </p>
                    </div>

                    {/* SECONDS */}
                    <div className="rounded-2xl bg-white/10 p-3 text-center">
                      <p className="text-2xl font-black text-[#f5cf82] sm:text-3xl">
                        {formatTime(
                          timeLeft.seconds
                        )}
                      </p>

                      <p className="mt-1 text-[9px] font-bold uppercase tracking-widest text-white/60">
                        Sec
                      </p>
                    </div>

                  </div>

                  <p className="mt-5 text-center text-xs text-white/50">
                    Limited-time Spin & Win
                    campaign
                  </p>
                </div>
              </div>
            </div>
          )}

        {/* =================================================
            SECTION HEADER
        ================================================= */}

        <div className="mx-auto mb-10 max-w-2xl text-center">

          <span className="inline-flex items-center gap-2 rounded-full border border-[#d39a38]/30 bg-[#d39a38]/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-[#a66f08] dark:text-[#dca34f]">

            <span className="h-2 w-2 animate-pulse rounded-full bg-[#d39a38]" />

            Special Offers

          </span>

          <h2 className="mt-5 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl lg:text-5xl">

            Exclusive{" "}

            <span className="text-[#8f3424] dark:text-[#dca34f]">
              Offers
            </span>

          </h2>

          <p className="mt-4 text-sm leading-7 text-gray-600 dark:text-gray-400 sm:text-base">
            Enjoy special discounts from
            Vraj Creation. Copy your
            favourite coupon code and use
            it when making your enquiry.
          </p>
        </div>

        {/* =================================================
            COUPON GRID
        ================================================= */}

        {coupons.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

            {coupons.map(
              (coupon) => (
                <div
                  key={coupon._id}
                  className="group relative overflow-hidden rounded-3xl border border-[#d39a38]/20 bg-white p-6 shadow-[0_10px_40px_rgba(0,0,0,0.06)] transition-all duration-500 hover:-translate-y-2 hover:border-[#d39a38]/50 hover:shadow-[0_20px_50px_rgba(0,0,0,0.12)] dark:bg-gray-900"
                >

                  {/* Decorative circles */}

                  <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-[#d39a38]/10 transition-transform duration-500 group-hover:scale-150" />

                  <div className="pointer-events-none absolute -bottom-16 -left-16 h-32 w-32 rounded-full bg-[#8f3424]/5" />

                  <div className="relative">

                    {/* TOP ROW */}

                    <div className="flex items-start justify-between gap-4">

                      <div>
                        <span className="inline-flex rounded-full bg-[#8f3424]/10 px-3 py-1.5 text-xs font-semibold text-[#8f3424] dark:bg-[#8f3424]/20 dark:text-[#dca34f]">
                          {coupon.source ||
                            "Vraj Creation"}
                        </span>
                      </div>

                      <div className="text-right">

                        <p className="text-3xl font-black leading-none text-[#8f3424] dark:text-[#dca34f]">
                          {coupon.discount}%
                        </p>

                        <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                          OFF
                        </p>

                      </div>

                    </div>

                    {/* DESCRIPTION */}

                    <h3 className="mt-6 text-xl font-bold text-gray-900 dark:text-white">
                      {coupon.description ||
                        `Get ${coupon.discount}% discount`}
                    </h3>

                    {/* CONDITIONS */}

                    <div className="mt-4 space-y-2">

                      {Number(
                        coupon.minOrderAmount
                      ) > 0 && (
                        <p className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">

                          <span className="text-[#d39a38]">
                            ✓
                          </span>

                          Minimum order ₹
                          {Number(
                            coupon.minOrderAmount
                          ).toLocaleString(
                            "en-IN"
                          )}

                        </p>
                      )}

                      {Number(
                        coupon.maxDiscount
                      ) > 0 && (
                        <p className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">

                          <span className="text-[#d39a38]">
                            ✓
                          </span>

                          Maximum discount ₹
                          {Number(
                            coupon.maxDiscount
                          ).toLocaleString(
                            "en-IN"
                          )}

                        </p>
                      )}

                      {coupon.expiryDate && (
                        <p className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">

                          <span className="text-[#d39a38]">
                            ✓
                          </span>

                          Valid until{" "}
                          {formatDate(
                            coupon.expiryDate
                          )}

                        </p>
                      )}

                    </div>

                    {/* COUPON CODE */}

                    <div className="mt-6 rounded-2xl border-2 border-dashed border-[#d39a38]/40 bg-[#d39a38]/5 p-3">

                      <div className="flex items-center gap-3">

                        <div className="min-w-0 flex-1">

                          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
                            Coupon Code
                          </p>

                          <p className="mt-1 truncate font-mono text-lg font-black tracking-wider text-[#8f3424] dark:text-[#dca34f]">
                            {coupon.code}
                          </p>

                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            handleCopy(
                              coupon.code
                            )
                          }
                          className={`shrink-0 rounded-xl px-4 py-3 text-sm font-bold text-white transition-all duration-300 active:scale-95 ${
                            copiedCode ===
                            coupon.code
                              ? "bg-green-600"
                              : "bg-[#8f3424] hover:bg-[#74291d]"
                          }`}
                        >
                          {copiedCode ===
                          coupon.code
                            ? "Copied!"
                            : "Copy"}
                        </button>

                      </div>
                    </div>

                    {/* FOOTER */}

                    <div className="mt-5 flex items-center justify-between border-t border-gray-200 pt-4 dark:border-gray-800">

                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                        Limited offer
                      </span>

                      <span className="text-xs font-semibold text-[#8f3424] dark:text-[#dca34f]">
                        Vraj Creation
                      </span>

                    </div>

                  </div>
                </div>
              )
            )}

          </div>
        )}

      </div>
    </section>
  );
};

export default CouponBanner;
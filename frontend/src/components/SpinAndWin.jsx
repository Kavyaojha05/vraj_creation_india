import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  FiGift,
  FiPhone,
  FiUser,
  FiCopy,
  FiCheck,
  FiRefreshCw,
  FiClock,
  FiPercent,
  FiX,
  FiAlertCircle,
} from "react-icons/fi";

import {
  spinAPI,
  spinCampaignAPI,
} from "../services/api";

import { useDiscount } from "../context/DiscountContext";

// =====================================================
// SPIN & WIN
// =====================================================

const REWARDS = [3, 5, 7, 10];

const SpinAndWin = () => {
  // ===================================================
  // DISCOUNT CONTEXT
  // ===================================================

  const {
    saveDiscount,
  } = useDiscount();

  // ===================================================
  // CAMPAIGN
  // ===================================================

  const [campaign, setCampaign] =
    useState(null);

  const [
    campaignLoading,
    setCampaignLoading,
  ] = useState(true);

  // ===================================================
  // FORM
  // ===================================================

  const [name, setName] =
    useState("");

  const [mobile, setMobile] =
    useState("");

  // ===================================================
  // SPIN
  // ===================================================

  const [sessionId, setSessionId] =
    useState("");

  const [spinning, setSpinning] =
    useState(false);

  const [rotation, setRotation] =
    useState(0);

  // ===================================================
  // RESULT
  // ===================================================

  const [reward, setReward] =
    useState(null);

  const [couponCode, setCouponCode] =
    useState("");

  const [copied, setCopied] =
    useState(false);

  // ===================================================
  // UI
  // ===================================================

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  // ===================================================
  // MODAL
  // ===================================================

  const [showModal, setShowModal] =
    useState(false);

  // ===================================================
  // LOAD CAMPAIGN
  // ===================================================

  useEffect(() => {
    loadCampaign();
  }, []);

  const loadCampaign =
    async () => {
      try {
        setCampaignLoading(true);
        setError("");

        const response =
          await spinCampaignAPI.get();

        console.log(
          "SPIN CAMPAIGN FRONTEND RESPONSE:",
          response
        );

        if (
          response?.success &&
          response?.campaign
        ) {
          setCampaign(
            response.campaign
          );
        } else {
          setCampaign(null);
        }
      } catch (error) {
        console.error(
          "Spin campaign error:",
          error
        );

        setCampaign(null);
      } finally {
        setCampaignLoading(false);
      }
    };

  // ===================================================
  // AUTO HIDE WHEN CAMPAIGN EXPIRES
  // ===================================================

  useEffect(() => {
    if (
      !campaign ||
      !campaign.expiryDate
    ) {
      return;
    }

    const expiryTime =
      new Date(
        campaign.expiryDate
      ).getTime();

    if (
      Number.isNaN(
        expiryTime
      )
    ) {
      console.error(
        "Invalid Spin & Win expiry date:",
        campaign.expiryDate
      );

      return;
    }

    const remainingTime =
      expiryTime - Date.now();

    // Already expired
    if (
      remainingTime <= 0
    ) {
      setCampaign(null);
      setSessionId("");
      setReward(null);
      setCouponCode("");
      setShowModal(false);
      setSpinning(false);

      return;
    }

    // Automatically hide exactly at expiry time
    const expiryTimer =
      setTimeout(() => {
        setCampaign(null);
        setSessionId("");
        setReward(null);
        setCouponCode("");
        setShowModal(false);
        setSpinning(false);
      }, remainingTime);

    return () => {
      clearTimeout(
        expiryTimer
      );
    };
  }, [campaign]);

  // ===================================================
  // ACTIVE CAMPAIGN
  // ===================================================

  const isCampaignActive =
    useMemo(() => {
      if (!campaign) {
        return false;
      }

      if (
        campaign.enabled !== true
      ) {
        return false;
      }

      if (
        !campaign.startDate ||
        !campaign.expiryDate
      ) {
        return false;
      }

      const now = new Date();

      const start =
        new Date(
          campaign.startDate
        );

      const expiry =
        new Date(
          campaign.expiryDate
        );

      if (
        Number.isNaN(
          start.getTime()
        ) ||
        Number.isNaN(
          expiry.getTime()
        )
      ) {
        return false;
      }

      return (
        now >= start &&
        now < expiry
      );
    }, [campaign]);

  // ===================================================
  // AVAILABLE REWARDS
  // ===================================================

  const availableRewards =
    useMemo(() => {
      if (
        !campaign?.rewards ||
        !Array.isArray(
          campaign.rewards
        )
      ) {
        return REWARDS;
      }

      const rewards =
        campaign.rewards
          .filter(
            (item) =>
              item?.active !==
                false &&
              REWARDS.includes(
                Number(
                  item?.wheelValue
                )
              )
          )
          .map((item) =>
            Number(
              item.wheelValue
            )
          );

      return rewards.length
        ? [...new Set(rewards)]
        : REWARDS;
    }, [campaign]);

  // ===================================================
  // RESET
  // ===================================================

  const resetSpin = () => {
    setSessionId("");
    setReward(null);
    setCouponCode("");
    setCopied(false);
    setError("");
    setSuccess("");
    setSpinning(false);
    setRotation(0);
    setShowModal(false);

    /*
      IMPORTANT:
      DiscountContext ko clear nahi karna.

      User spin kar chuka hai aur coupon
      checkout ke liye available rehna chahiye.
    */
  };

  // ===================================================
  // START SESSION
  // ===================================================

  const handleStart = async (
    event
  ) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const cleanName =
      name.trim();

    const cleanMobile =
      mobile.replace(
        /\D/g,
        ""
      );

    if (!cleanName) {
      setError(
        "Please enter your name."
      );

      return;
    }

    if (
      cleanMobile.length !== 10
    ) {
      setError(
        "Please enter a valid 10-digit mobile number."
      );

      return;
    }

    if (!isCampaignActive) {
      setCampaign(null);
      return;
    }

    try {
      setSpinning(true);

      const response =
        await spinAPI.start({
          name: cleanName,
          mobile: cleanMobile,
        });

      console.log(
        "SPIN START RESPONSE:",
        response
      );

      if (
        !response?.success
      ) {
        throw new Error(
          response?.message ||
            "Unable to start Spin & Win."
        );
      }

      if (
        !response?.sessionId
      ) {
        throw new Error(
          "Spin session ID was not received from server."
        );
      }

      setSessionId(
        response.sessionId
      );

      setReward(null);
      setCouponCode("");
      setCopied(false);

      setSuccess(
        "Your spin session is ready!"
      );
    } catch (error) {
      console.error(
        "Spin start error:",
        error
      );

      setError(
        error?.response?.data
          ?.message ||
          error?.message ||
          "Unable to start Spin & Win."
      );
    } finally {
      setSpinning(false);
    }
  };

  // ===================================================
  // SPIN WHEEL
  // ===================================================

  const handleSpin =
    async () => {
      if (!isCampaignActive) {
        setCampaign(null);
        return;
      }

      if (!sessionId) {
        setError(
          "Spin session not found."
        );

        return;
      }

      if (
        spinning ||
        reward
      ) {
        return;
      }

      setError("");
      setSuccess("");
      setCopied(false);

      try {
        setSpinning(true);

        const response =
          await spinAPI.spin(
            sessionId
          );

        console.log(
          "SPIN RESULT RESPONSE:",
          response
        );

        if (
          !response?.success
        ) {
          throw new Error(
            response?.message ||
              "Spin failed."
          );
        }

        // =============================================
        // REWARD
        // =============================================

        const returnedReward =
          Number(
            response?.coupon
              ?.wheelValue ??
              response?.coupon
                ?.discount ??
              response?.reward
                ?.wheelValue ??
              response?.reward
                ?.discount ??
              response?.wheelValue ??
              response?.discount ??
              0
          );

        const finalReward =
          REWARDS.includes(
            returnedReward
          )
            ? returnedReward
            : 3;

        console.log(
          "FINAL SPIN REWARD:",
          finalReward
        );

        // =============================================
        // WHEEL POSITION
        // =============================================

        const rewardIndex =
          availableRewards.indexOf(
            finalReward
          );

        const safeIndex =
          rewardIndex >= 0
            ? rewardIndex
            : 0;

        const segmentAngle =
          360 /
          availableRewards.length;

        const targetAngle =
          360 -
          safeIndex *
            segmentAngle -
          segmentAngle / 2;

        const extraRotations =
          360 * 5;

        const newRotation =
          rotation +
          extraRotations +
          targetAngle;

        setRotation(
          newRotation
        );

        // =============================================
        // COUPON CODE
        // =============================================

        const returnedCoupon =
          response?.coupon
            ?.code ||
          response?.reward
            ?.code ||
          response?.couponCode ||
          response?.code ||
          "";

        if (
          !returnedCoupon
        ) {
          throw new Error(
            "Coupon code was not received from server."
          );
        }

        // =============================================
        // COUPON DATA
        // =============================================

        const backendDiscountAmount =
          response?.coupon
            ?.discountAmount ??
          response?.reward
            ?.discountAmount ??
          response?.discountAmount ??
          null;

        const backendMaxDiscount =
          response?.coupon
            ?.maxDiscount ??
          response?.reward
            ?.maxDiscount ??
          response?.maxDiscount ??
          null;

        const backendMinOrderAmount =
          response?.coupon
            ?.minOrderAmount ??
          response?.reward
            ?.minOrderAmount ??
          response?.minOrderAmount ??
          0;

        const backendScope =
          response?.coupon
            ?.discountScope ||
          response?.reward
            ?.discountScope ||
          response?.discountScope ||
          "all";

        const backendCategory =
          response?.coupon
            ?.category ||
          response?.reward
            ?.category ||
          response?.category ||
          null;

        const backendExpiry =
          response?.coupon
            ?.expiryDate ||
          response?.reward
            ?.expiryDate ||
          response?.expiryDate ||
          campaign?.expiryDate ||
          null;

        // =============================================
        // MAX DISCOUNT
        // =============================================

        const normalizedMaxDiscount =
          backendMaxDiscount !==
            null &&
          backendMaxDiscount !==
            undefined &&
          backendMaxDiscount !==
            "" &&
          Number(
            backendMaxDiscount
          ) > 0
            ? Number(
                backendMaxDiscount
              )
            : null;

        // =============================================
        // DISCOUNT AMOUNT
        // =============================================

        const normalizedDiscountAmount =
          backendDiscountAmount !==
            null &&
          backendDiscountAmount !==
            undefined &&
          backendDiscountAmount !==
            "" &&
          Number(
            backendDiscountAmount
          ) > 0
            ? Number(
                backendDiscountAmount
              )
            : null;

        // =============================================
        // DISCOUNT PAYLOAD
        // =============================================

        const discountPayload = {
          discount:
            finalReward,

          couponCode:
            returnedCoupon,

          discountScope:
            backendScope,

          category:
            backendCategory,

          minOrderAmount:
            Number(
              backendMinOrderAmount ||
                0
            ),

          maxDiscount:
            normalizedMaxDiscount,

          discountAmount:
            normalizedDiscountAmount,

          expiryDate:
            backendExpiry,

          source:
            response?.coupon
              ?.source ||
            response?.reward
              ?.source ||
            response?.source ||
            "Spin & Win",

          type:
            "percentage",

          wheelValue:
            response?.coupon
              ?.wheelValue ??
            response?.reward
              ?.wheelValue ??
            finalReward,

          claimId:
            response?.claimId ||
            response?.claim?._id ||
            response?.claim?.id ||
            null,

          sessionExpiresAt:
            response?.sessionExpiresAt ||
            null,

          campaignExpiresAt:
            response?.campaignExpiresAt ||
            campaign?.expiryDate ||
            null,

          message:
            response?.coupon
              ?.description ||
            response?.reward
              ?.description ||
            response?.message ||
            `Congratulations! You won ${finalReward}% OFF.`,
        };

        console.log(
          "DISCOUNT PAYLOAD BEFORE SAVE:",
          discountPayload
        );

        // =============================================
        // SAVE DISCOUNT
        // =============================================

        const discountResult =
          saveDiscount(
            discountPayload
          );

        console.log(
          "SAVE DISCOUNT RESULT:",
          discountResult
        );

        if (
          !discountResult?.success
        ) {
          throw new Error(
            discountResult?.message ||
              "Unable to save Spin & Win discount."
          );
        }

        // =============================================
        // VERIFY LOCAL STORAGE
        // =============================================

        try {
          const savedDiscount =
            localStorage.getItem(
              "vraj_spin_discount"
            );

          console.log(
            "VERIFY SAVED SPIN DISCOUNT:",
            savedDiscount
          );
        } catch (storageError) {
          console.error(
            "Discount storage verification error:",
            storageError
          );
        }

        // =============================================
        // WHEEL ANIMATION
        // =============================================

        setTimeout(() => {
          setReward(
            finalReward
          );

          setCouponCode(
            returnedCoupon
          );

          setSuccess(
            `Congratulations! You won ${finalReward}% OFF.`
          );

          setSpinning(false);

          setShowModal(true);
        }, 4500);
      } catch (error) {
        console.error(
          "Spin error:",
          error
        );

        setError(
          error?.response?.data
            ?.message ||
            error?.message ||
            "Unable to spin the wheel."
        );

        setSpinning(false);
      }
    };

  // ===================================================
  // COPY COUPON
  // ===================================================

  const copyCoupon =
    async () => {
      if (!couponCode) {
        return;
      }

      try {
        await navigator.clipboard.writeText(
          couponCode
        );

        setCopied(true);

        setTimeout(() => {
          setCopied(false);
        }, 2000);
      } catch (error) {
        console.error(
          "Copy error:",
          error
        );

        setError(
          "Unable to copy coupon. Please copy it manually."
        );
      }
    };

  // ===================================================
  // CLOSE MODAL
  // ===================================================

  const closeModal = () => {
    if (spinning) {
      return;
    }

    setShowModal(false);
  };

  // ===================================================
  // LOADING
  // ===================================================

  if (
    campaignLoading
  ) {
    return null;
  }

  // ===================================================
  // CAMPAIGN NOT ACTIVE
  //
  // IMPORTANT:
  // Expired / disabled campaign frontend se
  // completely remove ho jayega.
  // ===================================================

  if (
    !isCampaignActive
  ) {
    return null;
  }

  // ===================================================
  // MAIN UI
  // ===================================================

  return (
    <>
      <section
        id="spin-and-win"
        className="relative overflow-hidden px-4 py-16 sm:px-6 lg:px-8"
      >
        <div className="pointer-events-none absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-amber-500/10 blur-3xl" />

        <div className="relative mx-auto max-w-6xl">
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-sm font-semibold text-amber-500">
              <FiGift />
              Special Offer
            </div>

            <h2 className="text-3xl font-bold sm:text-4xl lg:text-5xl">
              Spin & Win
            </h2>

            <p className="mt-4 text-sm leading-7 opacity-70 sm:text-base">
              Spin the wheel and get an exclusive
              discount coupon for your next order.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            {/* ==========================================
                WHEEL
            ========================================== */}

            <div className="flex flex-col items-center justify-center rounded-3xl border border-amber-500/20 bg-white/5 p-6 shadow-xl backdrop-blur-xl sm:p-10">
              <div className="relative">
                <div className="absolute left-1/2 top-0 z-20 -translate-x-1/2 -translate-y-3">
                  <div className="h-0 w-0 border-l-[13px] border-r-[13px] border-t-[28px] border-l-transparent border-r-transparent border-t-amber-500 drop-shadow-lg" />
                </div>

                <div
                  className="relative h-64 w-64 rounded-full border-8 border-amber-500 shadow-2xl transition-transform sm:h-80 sm:w-80"
                  style={{
                    transform: `rotate(${rotation}deg)`,

                    transitionDuration:
                      "4500ms",

                    transitionTimingFunction:
                      "cubic-bezier(0.12, 0.8, 0.2, 1)",

                    background: `conic-gradient(
                      #8f3424 0deg 90deg,
                      #d39a38 90deg 180deg,
                      #7b4a2f 180deg 270deg,
                      #dca34f 270deg 360deg
                    )`,
                  }}
                >
                  <div className="absolute left-1/2 top-1/2 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-4 border-white/70 bg-gray-950 text-center shadow-xl">
                    <div>
                      <FiGift className="mx-auto mb-1 text-xl text-amber-400" />

                      <span className="text-xs font-bold text-white">
                        SPIN
                      </span>
                    </div>
                  </div>

                  {availableRewards.map(
                    (
                      value,
                      index
                    ) => {
                      const angle =
                        index *
                          (360 /
                            availableRewards.length) +
                        45;

                      return (
                        <div
                          key={`${value}-${index}`}
                          className="absolute left-1/2 top-1/2 h-full w-full"
                          style={{
                            transform: `translate(-50%, -50%) rotate(${angle}deg)`,
                          }}
                        >
                          <div className="absolute left-1/2 top-5 -translate-x-1/2 text-lg font-black text-white drop-shadow-md sm:top-8 sm:text-2xl">
                            {value}%
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={
                  handleSpin
                }
                disabled={
                  spinning ||
                  !sessionId ||
                  !!reward
                }
                className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-amber-500 px-8 py-3 font-bold text-white shadow-lg transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {spinning ? (
                  <>
                    <FiRefreshCw className="animate-spin" />
                    Spinning...
                  </>
                ) : reward ? (
                  <>
                    <FiCheck />
                    You Won!
                  </>
                ) : (
                  <>
                    <FiGift />
                    Spin Now
                  </>
                )}
              </button>

              <div className="mt-4 flex items-center gap-2 text-xs opacity-60">
                <FiClock />
                One spin per mobile number
              </div>
            </div>

            {/* ==========================================
                FORM
            ========================================== */}

            <div className="rounded-3xl border border-amber-500/20 bg-white/5 p-6 shadow-xl backdrop-blur-xl sm:p-10">
              <div className="mb-8">
                <span className="text-sm font-semibold uppercase tracking-widest text-amber-500">
                  Lucky Spin
                </span>

                <h3 className="mt-2 text-2xl font-bold sm:text-3xl">
                  Try Your Luck 🎁
                </h3>

                <p className="mt-3 text-sm leading-6 opacity-70">
                  Enter your details to unlock the
                  Spin & Win wheel.
                </p>
              </div>

              {error && (
                <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-500">
                  <FiAlertCircle className="mt-0.5 shrink-0" />

                  <span>
                    {error}
                  </span>
                </div>
              )}

              {success &&
                !reward && (
                  <div className="mb-5 rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-500">
                    {success}
                  </div>
                )}

              <form
                onSubmit={
                  handleStart
                }
                className="space-y-5"
              >
                {/* NAME */}

                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Your Name
                  </label>

                  <div className="relative">
                    <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 opacity-50" />

                    <input
                      type="text"
                      value={name}
                      onChange={(
                        event
                      ) =>
                        setName(
                          event.target.value
                        )
                      }
                      placeholder="Enter your name"
                      disabled={
                        !!sessionId
                      }
                      className="w-full rounded-xl border border-white/10 bg-black/10 py-3 pl-11 pr-4 outline-none transition focus:border-amber-500 disabled:opacity-50"
                    />
                  </div>
                </div>

                {/* MOBILE */}

                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Mobile Number
                  </label>

                  <div className="relative">
                    <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 opacity-50" />

                    <input
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      value={mobile}
                      onChange={(
                        event
                      ) =>
                        setMobile(
                          event.target.value.replace(
                            /\D/g,
                            ""
                          )
                        )
                      }
                      placeholder="10-digit mobile number"
                      disabled={
                        !!sessionId
                      }
                      className="w-full rounded-xl border border-white/10 bg-black/10 py-3 pl-11 pr-4 outline-none transition focus:border-amber-500 disabled:opacity-50"
                    />
                  </div>
                </div>

                {/* START */}

                {!sessionId && (
                  <button
                    type="submit"
                    disabled={
                      spinning
                    }
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 px-5 py-3.5 font-bold text-white shadow-lg transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {spinning ? (
                      <>
                        <FiRefreshCw className="animate-spin" />
                        Starting...
                      </>
                    ) : (
                      <>
                        <FiGift />
                        Start Spin & Win
                      </>
                    )}
                  </button>
                )}

                {/* SESSION READY */}

                {sessionId &&
                  !reward && (
                    <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 text-center">
                      <div className="flex items-center justify-center gap-2 font-semibold text-amber-500">
                        <FiPercent />
                        Your spin is ready!
                      </div>

                      <p className="mt-2 text-xs opacity-70">
                        Click "Spin Now" on the wheel.
                      </p>
                    </div>
                  )}

                {/* RESULT */}

                {reward && (
                  <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-6 text-center">
                    <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-amber-500 text-2xl text-white">
                      🎉
                    </div>

                    <h4 className="text-2xl font-black">
                      {reward}% OFF
                    </h4>

                    <p className="mt-2 text-sm opacity-70">
                      Congratulations{" "}
                      {name}!
                    </p>

                    {couponCode && (
                      <div className="mt-5 rounded-xl border border-dashed border-amber-500/50 bg-black/10 p-4">
                        <div className="mb-2 text-xs uppercase tracking-widest opacity-60">
                          Your Coupon
                        </div>

                        <div className="flex items-center justify-center gap-3">
                          <span className="break-all text-lg font-black tracking-wider text-amber-500">
                            {
                              couponCode
                            }
                          </span>

                          <button
                            type="button"
                            onClick={
                              copyCoupon
                            }
                            className="rounded-lg p-2 transition hover:bg-white/10"
                            title="Copy coupon"
                          >
                            {copied ? (
                              <FiCheck className="text-green-500" />
                            ) : (
                              <FiCopy />
                            )}
                          </button>
                        </div>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() =>
                        setShowModal(
                          true
                        )
                      }
                      className="mt-5 w-full rounded-xl bg-amber-500 px-5 py-3 font-bold text-white transition hover:bg-amber-600"
                    >
                      View Coupon
                    </button>
                  </div>
                )}
              </form>

              {sessionId &&
                reward && (
                  <button
                    type="button"
                    onClick={
                      resetSpin
                    }
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold opacity-70 transition hover:bg-white/5 hover:opacity-100"
                  >
                    <FiRefreshCw />
                    Reset
                  </button>
                )}
            </div>
          </div>
        </div>
      </section>

      {/* =================================================
          COUPON MODAL
      ================================================= */}

      {showModal &&
        reward && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
            <div className="relative w-full max-w-md rounded-3xl border border-amber-500/30 bg-gray-950 p-7 text-white shadow-2xl">
              <button
                type="button"
                onClick={
                  closeModal
                }
                disabled={
                  spinning
                }
                className="absolute right-4 top-4 rounded-full p-2 opacity-60 transition hover:bg-white/10 hover:opacity-100"
                aria-label="Close"
              >
                <FiX />
              </button>

              <div className="text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-amber-500/20 text-4xl">
                  🎉
                </div>

                <h3 className="mt-5 text-3xl font-black">
                  You Won!
                </h3>

                <p className="mt-2 opacity-70">
                  Congratulations! You got
                </p>

                <div className="mt-3 text-5xl font-black text-amber-400">
                  {reward}%
                </div>

                <p className="mt-1 font-semibold">
                  DISCOUNT
                </p>

                {couponCode && (
                  <div className="mt-7 rounded-2xl border border-dashed border-amber-500/50 bg-amber-500/10 p-5">
                    <div className="text-xs uppercase tracking-widest opacity-60">
                      Coupon Code
                    </div>

                    <div className="mt-2 break-all text-xl font-black tracking-widest text-amber-400">
                      {
                        couponCode
                      }
                    </div>

                    <button
                      type="button"
                      onClick={
                        copyCoupon
                      }
                      className="mt-4 inline-flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 font-bold text-white transition hover:bg-amber-600"
                    >
                      {copied ? (
                        <>
                          <FiCheck />
                          Copied
                        </>
                      ) : (
                        <>
                          <FiCopy />
                          Copy Coupon
                        </>
                      )}
                    </button>
                  </div>
                )}

                <p className="mt-5 text-xs leading-5 opacity-50">
                  Your discount has been saved
                  automatically. Add products to
                  your cart and continue to checkout.
                </p>

                <button
                  type="button"
                  onClick={
                    closeModal
                  }
                  className="mt-6 w-full rounded-xl border border-white/10 px-5 py-3 font-semibold transition hover:bg-white/10"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          </div>
        )}
    </>
  );
};

export default SpinAndWin;
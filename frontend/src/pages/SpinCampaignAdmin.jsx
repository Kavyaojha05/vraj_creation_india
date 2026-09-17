import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FiCheck,
  FiClock,
  FiGift,
  FiLogOut,
  FiPower,
  FiRefreshCw,
  FiSave,
  FiSettings,
  FiShield,
  FiX,
} from "react-icons/fi";

import {
  spinCampaignAPI,
  adminAuthAPI,
  getAdminToken,
  clearAdminSession,
} from "../services/api";

// =====================================================
// DEFAULT REWARDS
// =====================================================

const DEFAULT_REWARDS = [
  {
    wheelValue: 3,
    discount: 3,
    code: "VRAJ-SPIN-3",
    name: "3% Discount",
    description: "Get 3% off on your order.",
    minOrderAmount: 0,
    maxDiscount: 0,
    maxUses: 100,
    usedCount: 0,
    active: true,
  },
  {
    wheelValue: 5,
    discount: 5,
    code: "VRAJ-SPIN-5",
    name: "5% Discount",
    description: "Get 5% off on your order.",
    minOrderAmount: 0,
    maxDiscount: 0,
    maxUses: 100,
    usedCount: 0,
    active: true,
  },
  {
    wheelValue: 7,
    discount: 7,
    code: "VRAJ-SPIN-7",
    name: "7% Discount",
    description: "Get 7% off on your order.",
    minOrderAmount: 0,
    maxDiscount: 0,
    maxUses: 100,
    usedCount: 0,
    active: true,
  },
  {
    wheelValue: 10,
    discount: 10,
    code: "VRAJ-SPIN-10",
    name: "10% Discount",
    description: "Get 10% off on your order.",
    minOrderAmount: 0,
    maxDiscount: 0,
    maxUses: 100,
    usedCount: 0,
    active: true,
  },
];

// =====================================================
// HELPERS
// =====================================================

const createDefaultRewards = () =>
  DEFAULT_REWARDS.map((reward) => ({
    ...reward,
  }));

const getResponseData = (response) => {
  return (
    response?.campaign ||
    response?.data?.campaign ||
    response?.data ||
    response ||
    null
  );
};

const toLocalDateTimeInput = (value) => {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const pad = (number) =>
    String(number).padStart(2, "0");

  return `${date.getFullYear()}-${pad(
    date.getMonth() + 1
  )}-${pad(date.getDate())}T${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}`;
};

const getDateFromInput = (value) => {
  if (!value) return null;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString();
};

const getInitialStartDate = () => {
  const now = new Date();

  now.setSeconds(0, 0);

  return toLocalDateTimeInput(now);
};

const getInitialExpiryDate = () => {
  const date = new Date();

  date.setDate(date.getDate() + 10);
  date.setSeconds(0, 0);

  return toLocalDateTimeInput(date);
};

// =====================================================
// COMPONENT
// =====================================================

export default function SpinCampaignAdmin() {
  const navigate = useNavigate();

  // =====================================================
  // AUTH
  // =====================================================

  const [authChecking, setAuthChecking] =
    useState(true);

  // =====================================================
  // CAMPAIGN STATES
  // =====================================================

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deactivating, setDeactivating] =
    useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [campaignExists, setCampaignExists] =
    useState(false);

  const [name, setName] = useState(
    "Vraj Creation Spin & Win"
  );

  const [enabled, setEnabled] =
    useState(false);

  const [startDate, setStartDate] = useState(
    getInitialStartDate()
  );

  const [expiryDate, setExpiryDate] =
    useState(getInitialExpiryDate());

  const [durationDays, setDurationDays] =
    useState(10);

  const [sessionMinutes, setSessionMinutes] =
    useState(5);

  const [oneSpinPerMobile, setOneSpinPerMobile] =
    useState(true);

  const [rewards, setRewards] = useState(
    createDefaultRewards()
  );

  // =====================================================
  // MEMO
  // =====================================================

  const activeRewards = useMemo(() => {
    return rewards.filter(
      (reward) => reward.active
    );
  }, [rewards]);

  const totalUsed = useMemo(() => {
    return rewards.reduce(
      (total, reward) =>
        total + Number(reward.usedCount || 0),
      0
    );
  }, [rewards]);

  const totalLimit = useMemo(() => {
    return rewards.reduce(
      (total, reward) =>
        total + Number(reward.maxUses || 0),
      0
    );
  }, [rewards]);

  // =====================================================
  // MESSAGE HELPERS
  // =====================================================

  const showMessage = (text) => {
    setMessage(text);
    setError("");

    window.setTimeout(() => {
      setMessage("");
    }, 4000);
  };

  const showError = (text) => {
    setError(text);
    setMessage("");

    window.setTimeout(() => {
      setError("");
    }, 5000);
  };

  // =====================================================
  // ADMIN AUTHENTICATION
  // =====================================================

  useEffect(() => {
    let mounted = true;

    const verifyAdminSession = async () => {
      const token = getAdminToken();

      if (!token) {
        if (mounted) {
          setAuthChecking(false);
        }

        navigate("/admin/login", {
          replace: true,
        });

        return;
      }

      try {
        const response =
          await adminAuthAPI.verify();

        if (
          !response?.success ||
          !response?.authenticated
        ) {
          clearAdminSession();

          if (mounted) {
            setAuthChecking(false);
          }

          navigate("/admin/login", {
            replace: true,
          });

          return;
        }

        if (mounted) {
          setAuthChecking(false);
        }
      } catch (error) {
        console.error(
          "Admin Authentication Error:",
          error
        );

        clearAdminSession();

        if (mounted) {
          setAuthChecking(false);
        }

        navigate("/admin/login", {
          replace: true,
        });
      }
    };

    verifyAdminSession();

    return () => {
      mounted = false;
    };
  }, [navigate]);

  // =====================================================
  // LOAD CAMPAIGN
  // =====================================================

  const loadCampaign = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await spinCampaignAPI.get();

      const campaign =
        getResponseData(response);

      if (!campaign || !campaign._id) {
        setCampaignExists(false);
        setEnabled(false);
        return;
      }

      setCampaignExists(true);

      setName(
        campaign.name ||
          "Vraj Creation Spin & Win"
      );

      setEnabled(
        Boolean(campaign.enabled)
      );

      setStartDate(
        toLocalDateTimeInput(
          campaign.startDate
        ) || getInitialStartDate()
      );

      setExpiryDate(
        toLocalDateTimeInput(
          campaign.expiryDate
        ) || getInitialExpiryDate()
      );

      setDurationDays(
        Number(campaign.durationDays || 10)
      );

      setSessionMinutes(
        Number(campaign.sessionMinutes || 5)
      );

      setOneSpinPerMobile(
        campaign.oneSpinPerMobile ===
          undefined
          ? true
          : Boolean(
              campaign.oneSpinPerMobile
            )
      );

      const backendRewards =
        Array.isArray(campaign.rewards)
          ? campaign.rewards
          : [];

      const mergedRewards =
        DEFAULT_REWARDS.map(
          (defaultReward) => {
            const backendReward =
              backendRewards.find(
                (reward) =>
                  Number(
                    reward.wheelValue
                  ) ===
                  Number(
                    defaultReward.wheelValue
                  )
              );

            if (!backendReward) {
              return {
                ...defaultReward,
              };
            }

            return {
              ...defaultReward,
              ...backendReward,

              wheelValue: Number(
                backendReward.wheelValue ||
                  defaultReward.wheelValue
              ),

              discount: Number(
                backendReward.discount ??
                  defaultReward.discount
              ),

              minOrderAmount: Number(
                backendReward.minOrderAmount ||
                  0
              ),

              maxDiscount: Number(
                backendReward.maxDiscount ||
                  0
              ),

              maxUses: Number(
                backendReward.maxUses ??
                  defaultReward.maxUses
              ),

              usedCount: Number(
                backendReward.usedCount || 0
              ),

              active:
                backendReward.active ===
                undefined
                  ? true
                  : Boolean(
                      backendReward.active
                    ),
            };
          }
        );

      setRewards(mergedRewards);
    } catch (err) {
      console.error(
        "Load Spin Campaign Error:",
        err
      );

      showError(
        err?.response?.data?.message ||
          "Spin campaign load nahi ho paaya."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // LOAD CAMPAIGN AFTER AUTH
  // =====================================================

  useEffect(() => {
    if (!authChecking) {
      loadCampaign();
    }
  }, [authChecking]);

  // =====================================================
  // UPDATE REWARD
  // =====================================================

  const updateReward = (
    index,
    field,
    value
  ) => {
    setRewards(
      (currentRewards) =>
        currentRewards.map(
          (reward, rewardIndex) => {
            if (
              rewardIndex !== index
            ) {
              return reward;
            }

            return {
              ...reward,
              [field]: value,
            };
          }
        )
    );
  };

  // =====================================================
  // DISCOUNT CHANGE
  // =====================================================

  const handleDiscountChange = (
    index,
    value
  ) => {
    const numericValue = Number(value);

    updateReward(
      index,
      "discount",
      Number.isFinite(numericValue)
        ? numericValue
        : 0
    );
  };

  // =====================================================
  // NUMBER CHANGE
  // =====================================================

  const handleRewardNumberChange = (
    index,
    field,
    value
  ) => {
    const numericValue = Number(value);

    updateReward(
      index,
      field,
      Number.isFinite(numericValue) &&
        numericValue >= 0
        ? numericValue
        : 0
    );
  };

  // =====================================================
  // VALIDATE
  // =====================================================

  const validateForm = () => {
    if (!name.trim()) {
      return "Campaign name required hai.";
    }

    if (!startDate) {
      return "Start date/time select karo.";
    }

    if (!expiryDate) {
      return "Expiry date/time select karo.";
    }

    const start = new Date(startDate);
    const expiry = new Date(expiryDate);

    if (Number.isNaN(start.getTime())) {
      return "Start date invalid hai.";
    }

    if (Number.isNaN(expiry.getTime())) {
      return "Expiry date invalid hai.";
    }

    if (expiry <= start) {
      return "Expiry date Start date ke baad honi chahiye.";
    }

    if (
      !Number(durationDays) ||
      Number(durationDays) < 1
    ) {
      return "Duration minimum 1 day hona chahiye.";
    }

    if (
      !Number(sessionMinutes) ||
      Number(sessionMinutes) < 1
    ) {
      return "Session time minimum 1 minute hona chahiye.";
    }

    if (activeRewards.length === 0) {
      return "Kam se kam ek reward active hona chahiye.";
    }

    // Only allowed wheel rewards
    const allowedValues = [
      3,
      5,
      7,
      10,
    ];

    for (const reward of rewards) {
      if (
        !allowedValues.includes(
          Number(reward.wheelValue)
        )
      ) {
        return "Sirf 3%, 5%, 7% aur 10% rewards allowed hain.";
      }

      if (!reward.code?.trim()) {
        return `${reward.wheelValue}% reward ka coupon code required hai.`;
      }

      const discount = Number(
        reward.discount
      );

      if (
        !Number.isFinite(discount) ||
        discount <= 0 ||
        discount > 100
      ) {
        return `${reward.wheelValue}% reward ka discount 1-100 ke beech hona chahiye.`;
      }

      const maxUses = Number(
        reward.maxUses
      );

      if (
        !Number.isFinite(maxUses) ||
        maxUses < 0
      ) {
        return `${reward.wheelValue}% reward ka Max Uses invalid hai.`;
      }

      if (
        maxUses > 0 &&
        Number(reward.usedCount || 0) >
          maxUses
      ) {
        return `${reward.wheelValue}% reward ka Max Uses used count se kam nahi ho sakta.`;
      }
    }

    // Duplicate coupon codes check
    const codes = rewards.map((reward) =>
      reward.code
        ?.trim()
        .toUpperCase()
    );

    const uniqueCodes =
      new Set(codes);

    if (
      uniqueCodes.size !==
      codes.length
    ) {
      return "Har reward ka coupon code unique hona chahiye.";
    }

    return "";
  };

  // =====================================================
  // BUILD PAYLOAD
  // =====================================================

  const buildPayload = () => {
    return {
      name: name.trim(),

      // =================================================
      // IMPORTANT FIX
      // Existing campaign ko Save karne par ACTIVE karega
      // =================================================
      enabled: true,

      startDate:
        getDateFromInput(startDate),

      expiryDate:
        getDateFromInput(expiryDate),

      durationDays:
        Number(durationDays),

      sessionMinutes:
        Number(sessionMinutes),

      oneSpinPerMobile,

      rewards: rewards.map(
        (reward) => ({
          wheelValue: Number(
            reward.wheelValue
          ),

          discount: Number(
            reward.discount
          ),

          code: reward.code
            .trim()
            .toUpperCase(),

          name:
            reward.name?.trim() ||
            `${reward.discount}% Discount`,

          description:
            reward.description?.trim() ||
            "",

          minOrderAmount: Number(
            reward.minOrderAmount || 0
          ),

          maxDiscount: Number(
            reward.maxDiscount || 0
          ),

          maxUses: Number(
            reward.maxUses || 0
          ),

          usedCount: Number(
            reward.usedCount || 0
          ),

          active: Boolean(
            reward.active
          ),
        })
      ),
    };
  };

  // =====================================================
  // SAVE CAMPAIGN
  // =====================================================

  const handleSave = async () => {
    const validationError =
      validateForm();

    if (validationError) {
      showError(validationError);
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload =
        buildPayload();

      console.log(
        "Spin Campaign Save Payload:",
        payload
      );

      let response;

      if (campaignExists) {
        response =
          await spinCampaignAPI.update(
            payload
          );
      } else {
        response =
          await spinCampaignAPI.activate(
            payload
          );
      }

      const updatedCampaign =
        getResponseData(response);

      if (updatedCampaign?._id) {
        setCampaignExists(true);
      }

      setEnabled(true);

      showMessage(
        campaignExists
          ? "Spin & Win campaign successfully update aur ACTIVE ho gaya."
          : "Spin & Win campaign successfully activate ho gaya."
      );

      await loadCampaign();
    } catch (err) {
      console.error(
        "Save Spin Campaign Error:",
        err
      );

      showError(
        err?.response?.data?.message ||
          "Campaign save nahi ho paaya."
      );
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // DEACTIVATE
  // =====================================================

  const handleDeactivate = async () => {
    if (
      !window.confirm(
        "Kya aap Spin & Win campaign ko OFF karna chahte hain?"
      )
    ) {
      return;
    }

    try {
      setDeactivating(true);
      setError("");

      await spinCampaignAPI.deactivate();

      setEnabled(false);

      showMessage(
        "Spin & Win campaign OFF kar diya gaya."
      );

      await loadCampaign();
    } catch (err) {
      console.error(
        "Deactivate Campaign Error:",
        err
      );

      showError(
        err?.response?.data?.message ||
          "Campaign deactivate nahi ho paaya."
      );
    } finally {
      setDeactivating(false);
    }
  };

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = async () => {
    try {
      await adminAuthAPI.logout();
    } catch (error) {
      console.error(
        "Admin Logout Error:",
        error
      );

      clearAdminSession();
    } finally {
      navigate("/admin/login", {
        replace: true,
      });
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (authChecking || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7efe3] text-[#38271d] dark:bg-[#15100d] dark:text-[#f3e5d4]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-[#8f3424]/20 border-t-[#8f3424] dark:border-[#b66d4d]/20 dark:border-t-[#b66d4d]" />

          <p className="text-sm font-medium">
            {authChecking
              ? "Checking admin access..."
              : "Spin Campaign load ho raha hai..."}
          </p>
        </div>
      </div>
    );
  }

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="min-h-screen bg-[#f7efe3] text-[#38271d] dark:bg-[#15100d] dark:text-[#f3e5d4]">
      {/* =================================================
          HEADER
      ================================================= */}

      <header className="border-b border-[#8f3424]/10 bg-white/80 backdrop-blur dark:border-white/10 dark:bg-[#211914]/90">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-5 sm:px-6 lg:px-8">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#8f3424] text-white shadow-md dark:bg-[#b66d4d] dark:text-[#211914]">
                <FiGift size={21} />
              </div>

              <div>
                <h1 className="text-xl font-bold sm:text-2xl">
                  Spin & Win Manager
                </h1>

                <p className="text-xs text-[#38271d]/60 dark:text-[#f3e5d4]/60 sm:text-sm">
                  Vraj Creation campaign settings
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={loadCampaign}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl border border-[#8f3424]/15 bg-white px-4 py-2.5 text-sm font-semibold text-[#8f3424] shadow-sm transition hover:bg-[#8f3424] hover:text-white disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-[#2a201b] dark:text-[#dca34f] dark:hover:bg-[#b66d4d] dark:hover:text-[#211914]"
            >
              <FiRefreshCw size={16} />

              <span className="hidden sm:inline">
                Refresh
              </span>
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-500/20 dark:text-red-300"
            >
              <FiLogOut size={16} />

              <span className="hidden sm:inline">
                Logout
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* =================================================
          MAIN
      ================================================= */}

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {/* =================================================
            STATUS
        ================================================= */}

        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-[#8f3424]/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#211914]">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#38271d]/50 dark:text-[#f3e5d4]/50">
                Campaign
              </span>

              <FiSettings className="text-[#8f3424] dark:text-[#dca34f]" />
            </div>

            <p className="text-lg font-bold">
              {enabled
                ? "Active"
                : "Inactive"}
            </p>

            <p className="mt-1 text-xs text-[#38271d]/55 dark:text-[#f3e5d4]/55">
              {enabled
                ? "Customers can spin the wheel."
                : "Customers cannot spin the wheel."}
            </p>
          </div>

          <div className="rounded-2xl border border-[#8f3424]/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#211914]">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#38271d]/50 dark:text-[#f3e5d4]/50">
                Active Rewards
              </span>

              <FiGift className="text-[#8f3424] dark:text-[#dca34f]" />
            </div>

            <p className="text-lg font-bold">
              {activeRewards.length} /{" "}
              {rewards.length}
            </p>

            <p className="mt-1 text-xs text-[#38271d]/55 dark:text-[#f3e5d4]/55">
              3%, 5%, 7%, 10%
            </p>
          </div>

          <div className="rounded-2xl border border-[#8f3424]/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#211914]">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#38271d]/50 dark:text-[#f3e5d4]/50">
                Used Coupons
              </span>

              <FiCheck className="text-[#8f3424] dark:text-[#dca34f]" />
            </div>

            <p className="text-lg font-bold">
              {totalUsed}
            </p>

            <p className="mt-1 text-xs text-[#38271d]/55 dark:text-[#f3e5d4]/55">
              Total reward claims
            </p>
          </div>

          <div className="rounded-2xl border border-[#8f3424]/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#211914]">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#38271d]/50 dark:text-[#f3e5d4]/50">
                Usage Limit
              </span>

              <FiShield className="text-[#8f3424] dark:text-[#dca34f]" />
            </div>

            <p className="text-lg font-bold">
              {totalLimit}
            </p>

            <p className="mt-1 text-xs text-[#38271d]/55 dark:text-[#f3e5d4]/55">
              Combined maximum uses
            </p>
          </div>
        </div>

        {/* =================================================
            ALERTS
        ================================================= */}

        {message && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-700 dark:text-green-300">
            <FiCheck className="mt-0.5 shrink-0" />

            <span>
              {message}
            </span>
          </div>
        )}

        {error && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-300">
            <FiX className="mt-0.5 shrink-0" />

            <span>
              {error}
            </span>
          </div>
        )}

        {/* =================================================
            CAMPAIGN SETTINGS
        ================================================= */}

        <section className="mb-6 rounded-2xl border border-[#8f3424]/10 bg-white shadow-sm dark:border-white/10 dark:bg-[#211914]">
          <div className="border-b border-[#8f3424]/10 px-5 py-5 dark:border-white/10 sm:px-6">
            <div className="flex items-center gap-3">
              <FiSettings className="text-[#8f3424] dark:text-[#dca34f]" />

              <div>
                <h2 className="font-bold">
                  Campaign Settings
                </h2>

                <p className="mt-1 text-xs text-[#38271d]/55 dark:text-[#f3e5d4]/55">
                  Campaign ka basic behaviour yahan
                  manage karein.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6 lg:grid-cols-3">
            {/* NAME */}

            <div className="sm:col-span-2 lg:col-span-3">
              <label className="mb-2 block text-sm font-semibold">
                Campaign Name
              </label>

              <input
                type="text"
                value={name}
                onChange={(event) =>
                  setName(
                    event.target.value
                  )
                }
                placeholder="Vraj Creation Spin & Win"
                className="w-full rounded-xl border border-[#8f3424]/15 bg-[#fffaf4] px-4 py-3 text-sm outline-none transition focus:border-[#8f3424] dark:border-white/10 dark:bg-[#18120f]"
              />
            </div>

            {/* START */}

            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-semibold">
                <FiClock size={15} />
                Start Date & Time
              </label>

              <input
                type="datetime-local"
                value={startDate}
                onChange={(event) =>
                  setStartDate(
                    event.target.value
                  )
                }
                className="w-full rounded-xl border border-[#8f3424]/15 bg-[#fffaf4] px-4 py-3 text-sm outline-none focus:border-[#8f3424] dark:border-white/10 dark:bg-[#18120f]"
              />
            </div>

            {/* EXPIRY */}

            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-semibold">
                <FiClock size={15} />
                Expiry Date & Time
              </label>

              <input
                type="datetime-local"
                value={expiryDate}
                onChange={(event) =>
                  setExpiryDate(
                    event.target.value
                  )
                }
                className="w-full rounded-xl border border-[#8f3424]/15 bg-[#fffaf4] px-4 py-3 text-sm outline-none focus:border-[#8f3424] dark:border-white/10 dark:bg-[#18120f]"
              />
            </div>

            {/* DURATION */}

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Campaign Duration (Days)
              </label>

              <input
                type="number"
                min="1"
                value={durationDays}
                onChange={(event) =>
                  setDurationDays(
                    Number(
                      event.target.value
                    )
                  )
                }
                className="w-full rounded-xl border border-[#8f3424]/15 bg-[#fffaf4] px-4 py-3 text-sm outline-none focus:border-[#8f3424] dark:border-white/10 dark:bg-[#18120f]"
              />
            </div>

            {/* SESSION */}

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Spin Session Time (Minutes)
              </label>

              <input
                type="number"
                min="1"
                value={sessionMinutes}
                onChange={(event) =>
                  setSessionMinutes(
                    Number(
                      event.target.value
                    )
                  )
                }
                className="w-full rounded-xl border border-[#8f3424]/15 bg-[#fffaf4] px-4 py-3 text-sm outline-none focus:border-[#8f3424] dark:border-white/10 dark:bg-[#18120f]"
              />

              <p className="mt-1.5 text-xs text-[#38271d]/50 dark:text-[#f3e5d4]/50">
                Example: 5 = user ko spin complete
                karne ke liye 5 minutes.
              </p>
            </div>

            {/* ONE SPIN */}

            <div className="flex items-center justify-between rounded-xl border border-[#8f3424]/10 bg-[#fffaf4] p-4 dark:border-white/10 dark:bg-[#18120f]">
              <div className="pr-4">
                <p className="text-sm font-semibold">
                  One Spin Per Mobile
                </p>

                <p className="mt-1 text-xs text-[#38271d]/50 dark:text-[#f3e5d4]/50">
                  Same mobile number dobara spin
                  nahi kar sakta.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setOneSpinPerMobile(
                    (value) => !value
                  )
                }
                className={`relative h-7 w-12 shrink-0 rounded-full transition ${
                  oneSpinPerMobile
                    ? "bg-[#8f3424] dark:bg-[#b66d4d]"
                    : "bg-gray-300 dark:bg-gray-700"
                }`}
                aria-label="Toggle one spin per mobile"
              >
                <span
                  className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${
                    oneSpinPerMobile
                      ? "left-6"
                      : "left-1"
                  }`}
                />
              </button>
            </div>

            {/* STATUS */}

            <div className="flex items-center justify-between rounded-xl border border-[#8f3424]/10 bg-[#fffaf4] p-4 dark:border-white/10 dark:bg-[#18120f]">
              <div className="pr-4">
                <p className="text-sm font-semibold">
                  Campaign Status
                </p>

                <p className="mt-1 text-xs text-[#38271d]/50 dark:text-[#f3e5d4]/50">
                  Save karte waqt campaign activate
                  hoga.
                </p>
              </div>

              <div
                className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                  enabled
                    ? "bg-green-500/10 text-green-700 dark:text-green-300"
                    : "bg-red-500/10 text-red-700 dark:text-red-300"
                }`}
              >
                {enabled
                  ? "ACTIVE"
                  : "OFF"}
              </div>
            </div>
          </div>
        </section>

        {/* =================================================
            REWARDS
        ================================================= */}

        <section className="mb-6 rounded-2xl border border-[#8f3424]/10 bg-white shadow-sm dark:border-white/10 dark:bg-[#211914]">
          <div className="border-b border-[#8f3424]/10 px-5 py-5 dark:border-white/10 sm:px-6">
            <div className="flex items-center gap-3">
              <FiGift className="text-[#8f3424] dark:text-[#dca34f]" />

              <div>
                <h2 className="font-bold">
                  Wheel Rewards
                </h2>

                <p className="mt-1 text-xs text-[#38271d]/55 dark:text-[#f3e5d4]/55">
                  3%, 5%, 7% aur 10% rewards manage
                  karein.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-5 p-5 sm:p-6">
            {rewards.map(
              (reward, index) => (
                <div
                  key={
                    reward.wheelValue
                  }
                  className={`rounded-2xl border p-5 transition ${
                    reward.active
                      ? "border-[#8f3424]/15 bg-[#fffaf4] dark:border-white/10 dark:bg-[#18120f]"
                      : "border-gray-200 bg-gray-50 opacity-70 dark:border-white/5 dark:bg-[#17110e]"
                  }`}
                >
                  {/* REWARD HEADER */}

                  <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#8f3424] text-lg font-black text-white dark:bg-[#b66d4d] dark:text-[#211914]">
                        {
                          reward.wheelValue
                        }
                        %
                      </div>

                      <div>
                        <h3 className="font-bold">
                          {
                            reward.wheelValue
                          }
                          % Reward
                        </h3>

                        <p className="text-xs text-[#38271d]/50 dark:text-[#f3e5d4]/50">
                          Used:{" "}
                          {
                            reward.usedCount ||
                            0
                          }{" "}
                          /{" "}
                          {
                            reward.maxUses ||
                            0
                          }
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        updateReward(
                          index,
                          "active",
                          !reward.active
                        )
                      }
                      className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
                        reward.active
                          ? "bg-green-500/10 text-green-700 hover:bg-green-500/20 dark:text-green-300"
                          : "bg-red-500/10 text-red-700 hover:bg-red-500/20 dark:text-red-300"
                      }`}
                    >
                      <FiPower size={14} />

                      {reward.active
                        ? "Reward ON"
                        : "Reward OFF"}
                    </button>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {/* DISCOUNT */}

                    <div>
                      <label className="mb-2 block text-xs font-bold uppercase tracking-wide opacity-60">
                        Discount %
                      </label>

                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={
                          reward.discount
                        }
                        onChange={(event) =>
                          handleDiscountChange(
                            index,
                            event.target
                              .value
                          )
                        }
                        className="w-full rounded-xl border border-[#8f3424]/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#8f3424] dark:border-white/10 dark:bg-[#211914]"
                      />
                    </div>

                    {/* CODE */}

                    <div>
                      <label className="mb-2 block text-xs font-bold uppercase tracking-wide opacity-60">
                        Coupon Code
                      </label>

                      <input
                        type="text"
                        value={
                          reward.code
                        }
                        onChange={(event) =>
                          updateReward(
                            index,
                            "code",
                            event.target.value.toUpperCase()
                          )
                        }
                        className="w-full rounded-xl border border-[#8f3424]/15 bg-white px-3 py-2.5 text-sm uppercase outline-none focus:border-[#8f3424] dark:border-white/10 dark:bg-[#211914]"
                      />
                    </div>

                    {/* NAME */}

                    <div>
                      <label className="mb-2 block text-xs font-bold uppercase tracking-wide opacity-60">
                        Reward Name
                      </label>

                      <input
                        type="text"
                        value={
                          reward.name
                        }
                        onChange={(event) =>
                          updateReward(
                            index,
                            "name",
                            event.target
                              .value
                          )
                        }
                        className="w-full rounded-xl border border-[#8f3424]/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#8f3424] dark:border-white/10 dark:bg-[#211914]"
                      />
                    </div>

                    {/* DESCRIPTION */}

                    <div className="md:col-span-2 lg:col-span-3">
                      <label className="mb-2 block text-xs font-bold uppercase tracking-wide opacity-60">
                        Description
                      </label>

                      <input
                        type="text"
                        value={
                          reward.description ||
                          ""
                        }
                        onChange={(event) =>
                          updateReward(
                            index,
                            "description",
                            event.target
                              .value
                          )
                        }
                        placeholder="Get 5% off on your order."
                        className="w-full rounded-xl border border-[#8f3424]/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#8f3424] dark:border-white/10 dark:bg-[#211914]"
                      />
                    </div>

                    {/* MIN ORDER */}

                    <div>
                      <label className="mb-2 block text-xs font-bold uppercase tracking-wide opacity-60">
                        Minimum Order ₹
                      </label>

                      <input
                        type="number"
                        min="0"
                        value={
                          reward.minOrderAmount
                        }
                        onChange={(event) =>
                          handleRewardNumberChange(
                            index,
                            "minOrderAmount",
                            event.target
                              .value
                          )
                        }
                        className="w-full rounded-xl border border-[#8f3424]/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#8f3424] dark:border-white/10 dark:bg-[#211914]"
                      />
                    </div>

                    {/* MAX DISCOUNT */}

                    <div>
                      <label className="mb-2 block text-xs font-bold uppercase tracking-wide opacity-60">
                        Maximum Discount ₹
                      </label>

                      <input
                        type="number"
                        min="0"
                        value={
                          reward.maxDiscount
                        }
                        onChange={(event) =>
                          handleRewardNumberChange(
                            index,
                            "maxDiscount",
                            event.target
                              .value
                          )
                        }
                        className="w-full rounded-xl border border-[#8f3424]/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#8f3424] dark:border-white/10 dark:bg-[#211914]"
                      />

                      <p className="mt-1 text-[11px] opacity-50">
                        0 = no maximum limit
                      </p>
                    </div>

                    {/* MAX USES */}

                    <div>
                      <label className="mb-2 block text-xs font-bold uppercase tracking-wide opacity-60">
                        Maximum Uses
                      </label>

                      <input
                        type="number"
                        min="0"
                        value={
                          reward.maxUses
                        }
                        onChange={(event) =>
                          handleRewardNumberChange(
                            index,
                            "maxUses",
                            event.target
                              .value
                          )
                        }
                        className="w-full rounded-xl border border-[#8f3424]/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#8f3424] dark:border-white/10 dark:bg-[#211914]"
                      />

                      <p className="mt-1 text-[11px] opacity-50">
                        0 = unlimited
                      </p>
                    </div>

                    {/* USED COUNT */}

                    <div>
                      <label className="mb-2 block text-xs font-bold uppercase tracking-wide opacity-60">
                        Used Count
                      </label>

                      <div className="flex h-[42px] items-center rounded-xl border border-[#8f3424]/10 bg-gray-100 px-3 text-sm font-bold dark:border-white/5 dark:bg-[#211914]">
                        {
                          reward.usedCount ||
                          0
                        }
                      </div>

                      <p className="mt-1 text-[11px] opacity-50">
                        Automatically managed by
                        backend
                      </p>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        </section>

        {/* =================================================
            ACTIONS
        ================================================= */}

        <section className="sticky bottom-4 z-30 rounded-2xl border border-[#8f3424]/10 bg-white/95 p-4 shadow-xl backdrop-blur dark:border-white/10 dark:bg-[#211914]/95 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-bold">
                {enabled
                  ? "Campaign currently ACTIVE"
                  : "Campaign currently OFF"}
              </p>

              <p className="mt-1 text-xs text-[#38271d]/50 dark:text-[#f3e5d4]/50">
                Changes save karne ke baad public
                Spin & Win wheel par apply honge.
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              {/* TURN OFF */}

              {enabled && (
                <button
                  type="button"
                  onClick={
                    handleDeactivate
                  }
                  disabled={
                    deactivating ||
                    saving
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-5 py-3 text-sm font-bold text-red-700 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50 dark:text-red-300"
                >
                  <FiPower size={16} />

                  {deactivating
                    ? "Turning OFF..."
                    : "Turn OFF"}
                </button>
              )}

              {/* SAVE */}

              <button
                type="button"
                onClick={handleSave}
                disabled={
                  saving ||
                  deactivating
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#8f3424] px-6 py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#713622] disabled:cursor-not-allowed disabled:opacity-50 dark:bg-[#b66d4d] dark:text-[#211914] dark:hover:bg-[#d18a62]"
              >
                {saving ? (
                  <>
                    <FiRefreshCw
                      className="animate-spin"
                      size={16}
                    />

                    Saving...
                  </>
                ) : (
                  <>
                    <FiSave size={16} />

                    Save Campaign
                  </>
                )}
              </button>
            </div>
          </div>
        </section>

        {/* =================================================
            NOTE
        ================================================= */}

        <div className="mt-5 rounded-xl border border-[#d39a38]/20 bg-[#d39a38]/5 p-4 text-xs leading-5 text-[#38271d]/70 dark:text-[#f3e5d4]/70">
          <strong className="text-[#8f3424] dark:text-[#dca34f]">
            Note:
          </strong>{" "}
          Probability setting abhi intentionally
          nahi diya gaya hai, kyunki current backend
          random reward selection use karta hai.
          Isliye 3%, 5%, 7% aur 10% rewards backend
          ke current system ke according manage honge.
        </div>
      </main>
    </div>
  );
}
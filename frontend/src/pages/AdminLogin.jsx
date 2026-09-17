
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiEye,
  FiEyeOff,
  FiLock,
  FiLogIn,
  FiShield,
  FiLoader,
} from "react-icons/fi";

import {
  adminAuthAPI,
  getAdminToken,
  clearAdminSession,
} from "../services/api";

export default function AdminLogin() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [loggingIn, setLoggingIn] = useState(false);

  const [error, setError] = useState("");

  // =====================================================
  // CHECK EXISTING ADMIN SESSION
  // =====================================================
  useEffect(() => {
    const checkSession = async () => {
      const token = getAdminToken();

      if (!token) {
        setCheckingSession(false);
        return;
      }

      try {
        const response = await adminAuthAPI.verify();

        if (response?.success && response?.authenticated) {
          navigate("/admin/spin", { replace: true });
          return;
        }

        clearAdminSession();
      } catch (error) {
        console.error("Admin session check failed:", error);
        clearAdminSession();
      } finally {
        setCheckingSession(false);
      }
    };

    checkSession();
  }, [navigate]);

  // =====================================================
  // LOGIN
  // =====================================================
  const handleLogin = async (event) => {
    event.preventDefault();

    setError("");

    const cleanUsername = username.trim();

    if (!cleanUsername) {
      setError("Username enter karo.");
      return;
    }

    if (!password) {
      setError("Password enter karo.");
      return;
    }

    try {
      setLoggingIn(true);

      const response = await adminAuthAPI.login({
        username: cleanUsername,
        password,
      });

      if (!response?.success || !response?.token) {
        throw new Error(
          response?.message || "Admin login failed."
        );
      }

      navigate("/admin/spin", { replace: true });
    } catch (err) {
      console.error("Admin Login Error:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Invalid admin username or password."
      );
    } finally {
      setLoggingIn(false);
    }
  };

  // =====================================================
  // SESSION CHECK LOADING
  // =====================================================
  if (checkingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7efe3] text-[#38271d] dark:bg-[#15100d] dark:text-[#f3e5d4]">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#8f3424] text-white shadow-lg dark:bg-[#b66d4d] dark:text-[#211914]">
            <FiShield size={25} />
          </div>

          <div className="flex items-center justify-center gap-2 text-sm font-medium">
            <FiLoader className="animate-spin" size={16} />
            Checking admin session...
          </div>
        </div>
      </div>
    );
  }

  // =====================================================
  // LOGIN PAGE
  // =====================================================
  return (
    <div className="min-h-screen bg-[#f7efe3] text-[#38271d] dark:bg-[#15100d] dark:text-[#f3e5d4]">
      <div className="flex min-h-screen items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          {/* LOGO / BRAND */}
          <div className="mb-7 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#8f3424] text-white shadow-xl dark:bg-[#b66d4d] dark:text-[#211914]">
              <FiShield size={30} />
            </div>

            <h1 className="text-2xl font-black sm:text-3xl">
              Vraj Creation
            </h1>

            <p className="mt-1 text-sm text-[#38271d]/55 dark:text-[#f3e5d4]/55">
              Admin Panel
            </p>
          </div>

          {/* LOGIN CARD */}
          <div className="rounded-3xl border border-[#8f3424]/10 bg-white p-6 shadow-xl dark:border-white/10 dark:bg-[#211914] sm:p-8">
            <div className="mb-7">
              <h2 className="text-xl font-bold">
                Admin Login
              </h2>

              <p className="mt-1 text-sm text-[#38271d]/55 dark:text-[#f3e5d4]/55">
                Spin & Win campaign manage karne ke liye login karein.
              </p>
            </div>

            {/* ERROR */}
            {error && (
              <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-700 dark:text-red-300">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              {/* USERNAME */}
              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Username
                </label>

                <div className="relative">
                  <FiShield
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8f3424]/50 dark:text-[#dca34f]/60"
                  />

                  <input
                    type="text"
                    value={username}
                    onChange={(event) =>
                      setUsername(event.target.value)
                    }
                    placeholder="Enter admin username"
                    autoComplete="username"
                    disabled={loggingIn}
                    className="w-full rounded-xl border border-[#8f3424]/15 bg-[#fffaf4] py-3.5 pl-11 pr-4 text-sm outline-none transition focus:border-[#8f3424] focus:ring-2 focus:ring-[#8f3424]/10 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-[#18120f] dark:focus:border-[#b66d4d]"
                  />
                </div>
              </div>

              {/* PASSWORD */}
              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Password
                </label>

                <div className="relative">
                  <FiLock
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8f3424]/50 dark:text-[#dca34f]/60"
                  />

                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) =>
                      setPassword(event.target.value)
                    }
                    placeholder="Enter admin password"
                    autoComplete="current-password"
                    disabled={loggingIn}
                    className="w-full rounded-xl border border-[#8f3424]/15 bg-[#fffaf4] py-3.5 pl-11 pr-12 text-sm outline-none transition focus:border-[#8f3424] focus:ring-2 focus:ring-[#8f3424]/10 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-[#18120f] dark:focus:border-[#b66d4d]"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword((value) => !value)
                    }
                    disabled={loggingIn}
                    className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center justify-center rounded-lg p-2 text-[#38271d]/50 transition hover:bg-[#8f3424]/10 hover:text-[#8f3424] disabled:cursor-not-allowed dark:text-[#f3e5d4]/50 dark:hover:bg-white/5 dark:hover:text-[#dca34f]"
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showPassword ? (
                      <FiEyeOff size={18} />
                    ) : (
                      <FiEye size={18} />
                    )}
                  </button>
                </div>
              </div>

              {/* LOGIN BUTTON */}
              <button
                type="submit"
                disabled={loggingIn}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#8f3424] px-5 py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-[#713622] disabled:cursor-not-allowed disabled:opacity-60 dark:bg-[#b66d4d] dark:text-[#211914] dark:hover:bg-[#d18a62]"
              >
                {loggingIn ? (
                  <>
                    <FiLoader
                      size={17}
                      className="animate-spin"
                    />
                    Logging in...
                  </>
                ) : (
                  <>
                    <FiLogIn size={17} />
                    Login to Admin Panel
                  </>
                )}
              </button>
            </form>

            {/* SECURITY NOTE */}
            <div className="mt-6 rounded-xl border border-[#d39a38]/20 bg-[#d39a38]/5 p-3.5 text-xs leading-5 text-[#38271d]/65 dark:text-[#f3e5d4]/65">
              <div className="flex gap-2">
                <FiLock className="mt-0.5 shrink-0 text-[#8f3424] dark:text-[#dca34f]" />

                <p>
                  Admin access protected hai. Successful login ke baad
                  secure JWT session browser me save hogi.
                </p>
              </div>
            </div>
          </div>

          <p className="mt-5 text-center text-xs text-[#38271d]/40 dark:text-[#f3e5d4]/40">
            © Vraj Creation — Admin Panel
          </p>
        </div>
      </div>
    </div>
  );
}
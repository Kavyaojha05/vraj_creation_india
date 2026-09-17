import { useState } from "react";

const API_URL = "http://localhost:5001/api";

const InstagramCoupon = () => {
  const [name, setName] = useState("");
  const [instagramUsername, setInstagramUsername] = useState("");

  const [coupon, setCoupon] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const handleClaim = async (e) => {
    e.preventDefault();

    setError("");
    setCoupon(null);

    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }

    if (!instagramUsername.trim()) {
      setError("Please enter your Instagram username.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/coupons/claim`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          instagramUsername: instagramUsername
            .trim()
            .replace(/^@/, ""),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to claim coupon."
        );
      }

      setCoupon(data.coupon);
    } catch (error) {
      setError(error.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const copyCoupon = async () => {
    if (!coupon?.code) return;

    try {
      await navigator.clipboard.writeText(coupon.code);
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      setError("Unable to copy coupon code.");
    }
  };

  return (
    <section
      id="instagram-offer"
      className="w-full px-4 py-16 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-5xl">
        <div className="overflow-hidden rounded-3xl border border-[#d39a38]/30 bg-gradient-to-br from-[#2a1712] via-[#3a2118] to-[#160d0a] shadow-2xl">
          
          <div className="grid lg:grid-cols-2">
            
            {/* LEFT */}
            <div className="p-8 sm:p-10 lg:p-14">
              <div className="mb-5 inline-flex items-center rounded-full border border-[#d39a38]/40 bg-[#d39a38]/10 px-4 py-2 text-sm font-medium text-[#e4b45c]">
                ✨ Instagram Exclusive
              </div>

              <h2 className="text-3xl font-bold leading-tight text-white sm:text-4xl">
                Get
                <span className="mx-2 text-[#dca34f]">
                  10% OFF
                </span>
                on your purchase
              </h2>

              <p className="mt-5 max-w-lg text-sm leading-7 text-[#e7d8ce] sm:text-base">
                Follow us on Instagram and claim your exclusive
                Vraj Creation offer. Your coupon is valid for 7 days
                and can be used only once.
              </p>

              <div className="mt-8 space-y-4">
                <div className="flex items-center gap-3 text-sm text-white">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#d39a38]/15 text-[#dca34f]">
                    ✓
                  </span>
                  Exclusive 10% discount
                </div>

                <div className="flex items-center gap-3 text-sm text-white">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#d39a38]/15 text-[#dca34f]">
                    ✓
                  </span>
                  Valid for 7 days
                </div>

                <div className="flex items-center gap-3 text-sm text-white">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#d39a38]/15 text-[#dca34f]">
                    ✓
                  </span>
                  One-time use
                </div>
              </div>
            </div>

            {/* RIGHT */}
            <div className="bg-black/20 p-8 sm:p-10 lg:p-14">
              {!coupon ? (
                <form onSubmit={handleClaim}>
                  <h3 className="text-2xl font-semibold text-white">
                    Claim Your Offer
                  </h3>

                  <p className="mt-2 text-sm text-gray-300">
                    Enter your details to receive your coupon.
                  </p>

                  <div className="mt-7">
                    <label className="mb-2 block text-sm font-medium text-gray-200">
                      Your Name
                    </label>

                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your name"
                      className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-white outline-none placeholder:text-gray-400 focus:border-[#dca34f]"
                    />
                  </div>

                  <div className="mt-5">
                    <label className="mb-2 block text-sm font-medium text-gray-200">
                      Instagram Username
                    </label>

                    <div className="flex overflow-hidden rounded-xl border border-white/10 bg-white/10 focus-within:border-[#dca34f]">
                      <span className="flex items-center px-4 text-[#dca34f]">
                        @
                      </span>

                      <input
                        type="text"
                        value={instagramUsername}
                        onChange={(e) =>
                          setInstagramUsername(e.target.value)
                        }
                        placeholder="yourusername"
                        className="w-full bg-transparent px-1 py-3 text-white outline-none placeholder:text-gray-400"
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="mt-5 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="mt-6 w-full rounded-xl bg-[#d39a38] px-5 py-3.5 font-semibold text-[#21110b] transition hover:bg-[#e2ad50] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading
                      ? "Claiming..."
                      : "Claim My 10% Offer"}
                  </button>

                  <p className="mt-4 text-center text-xs leading-5 text-gray-400">
                    One coupon per Instagram username. Offer valid
                    for 7 days.
                  </p>
                </form>
              ) : (
                <div className="text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-500/15 text-3xl">
                    🎉
                  </div>

                  <h3 className="mt-5 text-2xl font-bold text-white">
                    Congratulations!
                  </h3>

                  <p className="mt-2 text-sm text-gray-300">
                    Your Instagram offer has been claimed.
                  </p>

                  <div className="mt-7 rounded-2xl border border-[#d39a38]/30 bg-[#d39a38]/10 p-6">
                    <p className="text-xs uppercase tracking-widest text-[#dca34f]">
                      Your Coupon Code
                    </p>

                    <p className="mt-3 break-all text-2xl font-bold tracking-wider text-white">
                      {coupon.code}
                    </p>

                    <p className="mt-3 text-lg font-semibold text-[#dca34f]">
                      {coupon.discount}% OFF
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={copyCoupon}
                    className="mt-5 w-full rounded-xl bg-[#d39a38] px-5 py-3.5 font-semibold text-[#21110b] transition hover:bg-[#e2ad50]"
                  >
                    {copied ? "✓ Coupon Copied" : "Copy Coupon Code"}
                  </button>

                  <div className="mt-5 space-y-2 text-sm text-gray-300">
                    <p>
                      Valid until{" "}
                      <span className="font-medium text-white">
                        {new Date(
                          coupon.expiryDate
                        ).toLocaleDateString("en-IN")}
                      </span>
                    </p>

                    <p className="text-xs text-gray-400">
                      This coupon can be used only once.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InstagramCoupon;
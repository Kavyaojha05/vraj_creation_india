import CategoryLayout from "../components/CategoryLayout";
import { useProducts } from "../context/ProductContext";

export default function ResinArtPage() {
  const {
    products,
    loading,
    error,
  } = useProducts();

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <section className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div
            className="
              w-10
              h-10
              border-4
              border-current
              border-t-transparent
              rounded-full
              animate-spin
              mx-auto
              mb-4
            "
          />

          <p className="text-sm opacity-70">
            Loading Resin Art products...
          </p>
        </div>
      </section>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error) {
    return (
      <section className="min-h-[60vh] flex items-center justify-center px-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">
            Unable to load products
          </h2>

          <p className="text-sm opacity-70">
            {error}
          </p>
        </div>
      </section>
    );
  }

  // =====================================================
  // LIVE PRODUCTS
  // =====================================================

  const liveProducts = Array.isArray(products)
    ? products
    : [];

  // =====================================================
  // RESIN ART FILTER
  // =====================================================

  const resinArtProducts = liveProducts.filter(
    (product) => {
      const category = String(
        product?.category || ""
      )
        .trim()
        .toLowerCase();

      const subcategory = String(
        product?.subcategory || ""
      )
        .trim()
        .toLowerCase();

      return (
        category === "resin art" ||
        subcategory === "resin art"
      );
    }
  );

  // =====================================================
  // DEBUG
  // =====================================================

  console.log(
    "RESIN ART - FILTERED PRODUCTS:",
    resinArtProducts
  );

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <CategoryLayout
      title="Resin Art"
      subtitle="Explore artistic resin creations crafted with rich colors, crystal-like details, and beautiful handcrafted finishes."
      products={resinArtProducts}
    />
  );
}
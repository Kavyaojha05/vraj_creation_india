import CategoryLayout from "../components/CategoryLayout";
import { useProducts } from "../context/ProductContext";

export default function EthnicFurnishingPage() {
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
            Loading Ethnic Home Furnishing products...
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
  // ETHNIC HOME FURNISHING FILTER
  // =====================================================

  const ethnicFurnishingProducts = liveProducts.filter(
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
        category === "ethnic home furnishing" ||
        category === "ethnic furnishing" ||
        subcategory === "ethnic home furnishing" ||
        subcategory === "ethnic furnishing"
      );
    }
  );

  // =====================================================
  // DEBUG
  // =====================================================

  console.log(
    "ETHNIC HOME FURNISHING - FILTERED PRODUCTS:",
    ethnicFurnishingProducts
  );

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <CategoryLayout
      title="Ethnic Home Furnishing"
      subtitle="Bring timeless Indian craftsmanship into your home with traditional wooden accents, handcrafted furnishings, and heritage-inspired décor."
      products={ethnicFurnishingProducts}
    />
  );
}
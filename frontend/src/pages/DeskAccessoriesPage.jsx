import CategoryLayout from "../components/CategoryLayout";
import { useProducts } from "../context/ProductContext";

export default function DeskAccessoriesPage() {
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
            Loading Desk Accessories products...
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
  // DESK ACCESSORIES FILTER
  // =====================================================

  const deskAccessoriesProducts = liveProducts.filter(
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
        category === "desk accessories" ||
        category === "desk accessory" ||
        subcategory === "desk accessories" ||
        subcategory === "desk accessory"
      );
    }
  );

  // =====================================================
  // DEBUG
  // =====================================================

  console.log(
    "DESK ACCESSORIES - FILTERED PRODUCTS:",
    deskAccessoriesProducts
  );

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <CategoryLayout
      title="Desk Accessories"
      subtitle="Discover handcrafted desk accessories that combine practical everyday use with the timeless character of Indian artisan craftsmanship."
      products={deskAccessoriesProducts}
    />
  );
}
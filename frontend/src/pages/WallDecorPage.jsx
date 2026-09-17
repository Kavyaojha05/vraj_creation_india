import CategoryLayout from "../components/CategoryLayout";
import { useProducts } from "../context/ProductContext";

export default function WallDecorPage() {
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
      <section
        className="
          min-h-[60vh]
          flex
          items-center
          justify-center
          bg-white
          dark:bg-gray-950
        "
      >
        <div className="text-center">
          <div
            className="
              mx-auto
              h-10
              w-10
              animate-spin
              rounded-full
              border-4
              border-gray-200
              border-t-[#8f3424]
            "
          />

          <p
            className="
              mt-4
              text-sm
              text-gray-600
              dark:text-gray-400
            "
          >
            Loading Wall Décor products...
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
      <section
        className="
          min-h-[60vh]
          flex
          items-center
          justify-center
          px-6
          bg-white
          dark:bg-gray-950
        "
      >
        <div
          className="
            w-full
            max-w-lg
            rounded-2xl
            border
            border-red-200
            dark:border-red-900
            bg-red-50
            dark:bg-red-950/30
            p-6
            text-center
          "
        >
          <h2
            className="
              text-xl
              font-bold
              text-red-700
              dark:text-red-400
            "
          >
            Unable to load products
          </h2>

          <p
            className="
              mt-2
              text-sm
              text-red-600
              dark:text-red-300
            "
          >
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
  // WALL DECOR FILTER
  // =====================================================

  const wallDecorProducts = liveProducts.filter(
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
        category === "wall décor" ||
        category === "wall decor" ||
        subcategory === "wall décor" ||
        subcategory === "wall decor"
      );
    }
  );

  // =====================================================
  // DEBUG
  // =====================================================

  console.log(
    "WALL DECOR - FILTERED PRODUCTS:",
    wallDecorProducts
  );

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <CategoryLayout
      title="Wall Décor"
      subtitle="Discover handcrafted wall accents inspired by Indian heritage, traditional artistry, and timeless craftsmanship."
      products={wallDecorProducts}
    />
  );
}
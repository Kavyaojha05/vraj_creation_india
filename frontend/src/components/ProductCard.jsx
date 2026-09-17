import {
  FiCheck,
  FiPackage,
} from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import AddToCartButton from "./AddToCartButton";

const FALLBACK_IMAGE =
  "https://via.placeholder.com/800x800?text=Vraj+Creation";

const ProductCard = ({ product }) => {
  if (!product) {
    return null;
  }

  // ==========================================================
  // PRODUCT ID
  // ==========================================================

  const productId =
    product.productId ||
    product.sku ||
    product._id ||
    product.id ||
    null;

  // ==========================================================
  // LIVE PRICE
  // ==========================================================

  const rawPrice =
    product.sellingPrice ??
    product.price;

  const price =
    Number(rawPrice);

  const hasValidPrice =
    rawPrice !== null &&
    rawPrice !== undefined &&
    rawPrice !== "" &&
    Number.isFinite(price) &&
    price >= 0;

  // ==========================================================
  // LIVE STOCK
  // ==========================================================

  const rawStock =
    product.stock;

  const stock =
    Number(rawStock);

  const hasValidStock =
    rawStock !== null &&
    rawStock !== undefined &&
    rawStock !== "" &&
    Number.isFinite(stock) &&
    stock >= 0;

  // ==========================================================
  // STATUS
  // ==========================================================

  const isActive =
    String(
      product.status || "active"
    ).toLowerCase() ===
    "active";

  // ==========================================================
  // OUT OF STOCK
  // ==========================================================

  const isOutOfStock =
    !hasValidStock ||
    stock <= 0 ||
    !isActive;

  // ==========================================================
  // PRICE FORMAT
  // ==========================================================

  const formattedPrice =
    hasValidPrice
      ? new Intl.NumberFormat(
          "en-IN",
          {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0,
          }
        ).format(price)
      : "Price unavailable";

  // ==========================================================
  // IMAGE
  // ==========================================================

  const image =
    product.image ||
    FALLBACK_IMAGE;

  // ==========================================================
  // WHATSAPP
  // ==========================================================

  const whatsappNumber =
    "918824968974";

  const whatsappMessage =
    encodeURIComponent(
      `Hello Vraj Creation,

I am interested in this product:

Product: ${
        product.name ||
        "Handcrafted Product"
      }

Product ID: ${
        productId || "N/A"
      }

SKU: ${
        product.sku || "N/A"
      }

Price: ${
        hasValidPrice
          ? formattedPrice
          : "Please confirm price"
      }

Please share more details.`
    );

  const whatsappUrl =
    `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

  // ==========================================================
  // CART PRODUCT
  // ==========================================================

  const cartProduct = {
    ...product,

    _id:
      product._id,

    id:
      product.id ||
      product._id,

    productId:
      product.productId ||
      product.sku,

    sku:
      product.sku ||
      product.productId,

    price:
      hasValidPrice
        ? price
        : null,

    sellingPrice:
      hasValidPrice
        ? price
        : null,

    stock:
      hasValidStock
        ? stock
        : null,
  };

  return (
    <article
      className="
        group
        overflow-hidden
        rounded-2xl
        border
        border-gray-200
        dark:border-gray-800
        bg-white
        dark:bg-gray-900
        shadow-sm
        hover:shadow-xl
        transition-all
        duration-300
      "
    >
      {/* IMAGE */}

      <div
        className="
          relative
          aspect-[4/3]
          overflow-hidden
          bg-gray-100
          dark:bg-gray-800
        "
      >
        <img
          src={image}
          alt={
            product.name ||
            "Vraj Creation Product"
          }
          className="
            w-full
            h-full
            object-cover
            transition-transform
            duration-500
            group-hover:scale-105
          "
          loading="lazy"
          onError={(event) => {
            event.currentTarget.src =
              FALLBACK_IMAGE;
          }}
        />

        {product.category && (
          <span
            className="
              absolute
              top-3
              left-3
              rounded-full
              bg-black/70
              backdrop-blur-sm
              px-3
              py-1
              text-xs
              font-medium
              text-white
            "
          >
            {product.category}
          </span>
        )}
      </div>

      {/* CONTENT */}

      <div className="p-5">

        {/* NAME */}

        <h3
          className="
            text-lg
            font-bold
            text-gray-900
            dark:text-white
            line-clamp-2
          "
        >
          {product.name ||
            "Handcrafted Product"}
        </h3>

        {/* DESCRIPTION */}

        {product.description && (
          <p
            className="
              mt-2
              text-sm
              leading-6
              text-gray-600
              dark:text-gray-400
              line-clamp-2
            "
          >
            {product.description}
          </p>
        )}

        {/* PRICE + STOCK */}

        <div
          className="
            mt-4
            flex
            items-center
            justify-between
            gap-4
          "
        >
          <div>
            <p
              className="
                text-xs
                text-gray-500
                dark:text-gray-400
              "
            >
              Price
            </p>

            <p
              className="
                text-2xl
                font-bold
                text-[#8f3424]
                dark:text-[#dca34f]
              "
            >
              {formattedPrice}
            </p>
          </div>

          <div
            className="
              flex
              items-center
              gap-1.5
              text-sm
            "
          >
            <FiPackage size={15} />

            {isOutOfStock ? (
              <span className="font-medium text-red-500">
                Out of Stock
              </span>
            ) : (
              <span
                className="
                  font-medium
                  text-green-600
                  dark:text-green-400
                "
              >
                {stock} in stock
              </span>
            )}
          </div>
        </div>

        {/* PRODUCT DETAILS */}

        <div
          className="
            mt-4
            rounded-xl
            border
            border-gray-200
            dark:border-gray-800
            bg-gray-50
            dark:bg-gray-950
            p-3
          "
        >
          <div
            className="
              flex
              items-center
              justify-between
              gap-3
              text-sm
            "
          >
            <span
              className="
                text-gray-500
                dark:text-gray-400
              "
            >
              Product ID
            </span>

            <span
              className="
                max-w-[60%]
                truncate
                font-semibold
                text-gray-900
                dark:text-white
              "
            >
              {productId ||
                "N/A"}
            </span>
          </div>

          {product.sku && (
            <div
              className="
                mt-2
                flex
                items-center
                justify-between
                gap-3
                text-sm
              "
            >
              <span
                className="
                  text-gray-500
                  dark:text-gray-400
                "
              >
                SKU
              </span>

              <span
                className="
                  max-w-[60%]
                  truncate
                  text-right
                  text-gray-800
                  dark:text-gray-200
                "
              >
                {product.sku}
              </span>
            </div>
          )}

          {product.size && (
            <div
              className="
                mt-2
                flex
                items-center
                justify-between
                gap-3
                text-sm
              "
            >
              <span
                className="
                  text-gray-500
                  dark:text-gray-400
                "
              >
                Size
              </span>

              <span
                className="
                  text-right
                  text-gray-800
                  dark:text-gray-200
                "
              >
                {product.size}
              </span>
            </div>
          )}
        </div>

        {/* FEATURES */}

        <div className="mt-4 space-y-2">

          <div
            className="
              flex
              items-center
              gap-2
              text-sm
              text-gray-600
              dark:text-gray-400
            "
          >
            <FiCheck
              className="text-green-500"
              size={15}
            />

            Handcrafted Design
          </div>

          <div
            className="
              flex
              items-center
              gap-2
              text-sm
              text-gray-600
              dark:text-gray-400
            "
          >
            <FiCheck
              className="text-green-500"
              size={15}
            />

            Traditional Indian Craft
          </div>

        </div>

        {/* BUTTONS */}

        <div className="mt-5 space-y-2">

          <AddToCartButton
            product={cartProduct}
          />

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="
              w-full
              flex
              items-center
              justify-center
              gap-2
              rounded-xl
              border
              border-green-600
              px-4
              py-3
              text-sm
              font-semibold
              text-green-600
              transition
              hover:bg-green-600
              hover:text-white
            "
          >
            <FaWhatsapp size={17} />

            Enquire on WhatsApp
          </a>

        </div>

      </div>
    </article>
  );
};

export default ProductCard;

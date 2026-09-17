import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import AOS from "aos";

import "aos/dist/aos.css";
import "./index.css";

import App from "./App.jsx";

import { ThemeProvider } from "./context/ThemeContext.jsx";
import { DiscountProvider } from "./context/DiscountContext.jsx";
import { CartProvider } from "./context/CartContext.jsx";
import { ProductProvider } from "./context/ProductContext.jsx";

// =====================================================
// AOS INITIALIZATION
// =====================================================

AOS.init({
  duration: 900,
  once: true,
  offset: 80,
  easing: "ease-out-cubic",
});

// =====================================================
// APP RENDER
// =====================================================

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <DiscountProvider>
          <ProductProvider>
            <CartProvider>
              <App />
            </CartProvider>
          </ProductProvider>
        </DiscountProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>
);

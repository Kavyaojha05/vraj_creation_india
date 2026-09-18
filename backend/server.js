const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("@exortek/express-mongo-sanitize");
const hpp = require("hpp");

require("dotenv").config();

// =====================================================
// DEBUG / ENV STATUS
// =====================================================

console.log(
  "DASHBOARD_BACKEND_URL:",
  process.env.DASHBOARD_BACKEND_URL
);

console.log(
  "INTERNAL_STOCK_SECRET:",
  process.env.INTERNAL_STOCK_SECRET
    ? "LOADED"
    : "MISSING"
);

// =====================================================
// DATABASE
// =====================================================

const connectDB = require("./config/db");

// =====================================================
// EMAIL SERVICE
// =====================================================

const {
  verifyEmailConnection,
} = require("./services/emailService");

// =====================================================
// ROUTES
// =====================================================

const couponRoutes = require("./routes/couponRoutes");
const orderRoutes = require("./routes/orderRoutes");
const spinCampaignRoutes = require("./routes/spinCampaignRoutes");
const adminAuthRoutes = require("./routes/adminAuthRoutes");
const shippingRoutes = require("./routes/shippingRoutes");

// =====================================================
// APP
// =====================================================

const app = express();

// =====================================================
// TRUST PROXY
// =====================================================

app.set("trust proxy", 1);

// =====================================================
// SECURITY HEADERS
// =====================================================

app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);

// =====================================================
// CORS
// =====================================================

const allowedOrigins = [
  "https://vraj-creation-websites.onrender.com",

  process.env.FRONTEND_URL,
  process.env.DASHBOARD_URL,

  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:3000",
].filter(Boolean);

console.log(
  "Allowed CORS Origins:",
  allowedOrigins
);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.log(
        "Blocked CORS origin:",
        origin
      );

      return callback(
        new Error("Not allowed by CORS")
      );
    },

    credentials: true,

    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],

    allowedHeaders: [
      "Content-Type",
      "Authorization",
    ],
  })
);

// =====================================================
// EXPRESS BODY PARSER
// =====================================================

app.use(
  express.json({
    limit: "2mb",
  })
);

app.use(
  express.urlencoded({
    extended: false,
    limit: "100kb",
  })
);

// =====================================================
// MONGODB QUERY SANITIZATION
// =====================================================

app.use(
  mongoSanitize({
    replaceWith: "_",
  })
);

// =====================================================
// HTTP PARAMETER POLLUTION PROTECTION
// =====================================================

app.use(hpp());

// =====================================================
// GENERAL API RATE LIMIT
// =====================================================

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,

  max: 300,

  standardHeaders: true,
  legacyHeaders: false,

  message: {
    success: false,
    message:
      "Too many requests. Please try again later.",
  },
});

app.use("/api", generalLimiter);

// =====================================================
// ADMIN LOGIN RATE LIMIT
// =====================================================

const adminLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,

  max: 10,

  standardHeaders: true,
  legacyHeaders: false,

  message: {
    success: false,
    message:
      "Too many login attempts. Please try again later.",
  },
});

app.use(
  "/api/admin/login",
  adminLoginLimiter
);

// =====================================================
// DATABASE CONNECTION
// =====================================================

connectDB();

// =====================================================
// HOME ROUTE
// =====================================================

app.get("/", (req, res) => {
  res.json({
    success: true,
    message:
      "Vraj Creation Store Backend is running!",
    database: "MongoDB",
  });
});

// =====================================================
// COUPON ROUTES
// =====================================================

app.use(
  "/api/coupons",
  couponRoutes
);

// =====================================================
// ORDER ROUTES
// =====================================================

app.use(
  "/api/orders",
  orderRoutes
);

// =====================================================
// SPIN CAMPAIGN ROUTES
// =====================================================

app.use(
  "/api/campaign/spin",
  spinCampaignRoutes
);

// =====================================================
// ADMIN AUTH ROUTES
// =====================================================

app.use(
  "/api/admin",
  adminAuthRoutes
);

// =====================================================
// SHIPPING ROUTES
// =====================================================

app.use(
  "/api/shipping",
  shippingRoutes
);

// =====================================================
// 404 HANDLER
// =====================================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API endpoint not found",
  });
});

// =====================================================
// GLOBAL ERROR HANDLER
// =====================================================

app.use((err, req, res, next) => {
  console.error(
    "SERVER ERROR:",
    err.message
  );

  // ===================================================
  // CORS ERROR
  // ===================================================

  if (
    err.message ===
    "Not allowed by CORS"
  ) {
    return res.status(403).json({
      success: false,
      message: "CORS origin not allowed",
    });
  }

  // ===================================================
  // JSON PARSING ERROR
  // ===================================================

  if (
    err instanceof SyntaxError &&
    err.status === 400 &&
    err.type === "entity.parse.failed"
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid JSON request",
    });
  }

  // ===================================================
  // GENERIC SERVER ERROR
  // ===================================================

  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
});

// =====================================================
// SERVER
// =====================================================

const PORT =
  process.env.PORT || 5001;

app.listen(PORT, async () => {
  console.log(
    "===================================="
  );

  console.log(
    "Vraj Creation Store Backend"
  );

  console.log(
    `Server running on port ${PORT}`
  );

  console.log(
    `http://localhost:${PORT}`
  );

  console.log(
    "===================================="
  );

  try {
    await verifyEmailConnection();
  } catch (error) {
    console.error(
      "Email service verification failed:",
      error.message
    );
  }
});
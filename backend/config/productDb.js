const mongoose = require("mongoose");

// =====================================================
// PRODUCT DATABASE CONNECTION
// Database: vraj_creation
// Collection: products
// =====================================================

let productConnection = null;

const connectProductDB = async () => {
  try {
    if (!process.env.PRODUCT_MONGO_URI) {
      throw new Error("PRODUCT_MONGO_URI is missing in environment variables");
    }

    productConnection = mongoose.createConnection(
      process.env.PRODUCT_MONGO_URI
    );

    await productConnection.asPromise();

    console.log("====================================");
    console.log("Product MongoDB Connected");
    console.log("Product Database:", productConnection.name);
    console.log("Product Host:", productConnection.host);
    console.log("Product Collection: products");
    console.log("====================================");

    return productConnection;
  } catch (error) {
    console.error(
      "Product MongoDB Connection Error:",
      error.message
    );

    process.exit(1);
  }
};

const getProductDB = () => {
  if (!productConnection) {
    throw new Error("Product MongoDB is not connected");
  }

  return productConnection;
};

module.exports = {
  connectProductDB,
  getProductDB,
};
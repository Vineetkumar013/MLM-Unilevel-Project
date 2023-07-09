const mongoose = require("mongoose"); // Erase if already required

// Declare the Schema of the Mongo model
var userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      // unique: true,
    },
    city: {
      type: String,
    },
    mobile: {
      type: String,
      required: true,
      // unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    userType: {
      type: String,
      default: "Distributor",
      enum: ["Distributor", "subDistributor", "Admin"]
    },
    address: {
      type: String,
    },
    pincode: {
      type: String,
    },
    sales: {
      type: Number,
      default: 0
    }, // Total sales made by the distributor
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
        cart: {
      type: Array,
      default: [],
    },
    active: {
      type: Boolean, default: true
    }, // Flag indicating if the distributor is active
    parentId: {
      type: mongoose.Schema.Types.ObjectId, ref: 'User'
    }, // Reference to the parent distributor
    teamMembers: [{
      type: mongoose.Schema.Types.ObjectId, ref: 'User'
    }]
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);


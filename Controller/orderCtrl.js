const Order = require("../Models/orderModel");
const User = require("../Models/distributorModel");
const Cart = require("../Models/CartModel");
const Product = require("../Models/productModel");
const uniqid = require("uniqid");

const validateMongoDbId = require("../utils/validateMongodbId");

const createOrder = async (req, res) => {
  const { COD, couponApplied } = req.body;
  const { _id } = req.user;
  validateMongoDbId(_id);
  try {
    if (!COD) throw new Error("Create cash order failed");
    const user = await User.findById(_id);
    let userCart = await Cart.findOne({ orderby: user._id });
    let finalAmouont = 0;
    if (couponApplied && userCart.totalAfterDiscount) {
      finalAmouont = userCart.totalAfterDiscount;
    } else {
      finalAmouont = userCart.cartTotal;
    }
    let newOrder = await new Order({
      products: userCart.products,
      paymentIntent: {
        id: uniqid(),
        method: "COD",
        amount: finalAmouont,
        status: "Cash on Delivery",
        created: Date.now(),
        currency: "usd",
      },
      orderby: user._id,
      orderStatus: "Cash on Delivery",
    });
    newOrder.save();
    let update = userCart.products.map((item) => {
      return {
        updateOne: {
          filter: { _id: item.product._id },
          update: { $inc: { quantity: -item.count, sold: +item.count } },
        },
      };
    });
    const updated = await Product.bulkWrite(update, {});
    res.json({
      status: 200,
      message: "Order successfully",
      data: updated,
    });
  } catch (error) {
    res.json({
      status: 500,
      message: error.message,
    });
  }
};

const getOrder = async (req, res) => {
  const { _id } = req.user;
  validateMongoDbId(_id);
  try {
    const userOrders = await Order.findOne({ orderby: _id }).populate(
      "products.product"
    ).exec();
    res.json({
      status: 200,
      message: "Get Order Successfully",
      data: userOrders
    });
  } catch (error) {}
};

module.exports = {
  createOrder,
  getOrder
};

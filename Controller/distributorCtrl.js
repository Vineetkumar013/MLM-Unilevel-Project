const User = require("../Models/distributorModel");
const OTP = require("../Config/OTP-Generate");
const Cart = require("../Models/CartModel");
const Product = require("../Models/productModel");
const bcrypt = require("bcryptjs");
const validateMongoDbId = require("../utils/validateMongodbId");
const Coupon = require("../Models/CouponModel");

const createUser = async (req, res) => {
  const { name, email, mobile, password, address, pincode, city } = req.body;
  const errors = [];
  try {
    const findUser = await User.findOne({
      email: email,
      userType: "Distributor",
    });
    if (mobile) {
      const existingMobile = await User.findOne({
        mobile,
        userType: "Distributor",
      });
      if (existingMobile) {
        errors.push("Mobile already in use");
      }
    }
    // Check if password is strong enough
    if (!password.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})/)) {
      errors.push(
        "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number"
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    if (!findUser) {
      const newUser = await User.create({
        name: name,
        email: email,
        mobile: mobile,
        password: hashedPassword,
        address: address,
        pincode: pincode,
        city: city,
        userType: "Distributor",
      });
      const otp = OTP.generateOTP();

      res.status(201).json({
        message: "Registration susscessfully",
        status: 200,
        data: newUser,
        otp: otp,
      });
    } else {
      throw new Error("Distrubutor Already Exists");
    }
  } catch (error) {
    res.json({
      status: 500,
      message: error.message,
    });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.json({
        status: 400,
        message: "Please Enter Email & Password",
      });
    }
    const user = await User.findOne({
      email: email /*  userType: "Distributor" */,
    }); /* .select("+password"); */

    if (!user) {
      return res.json({ status: 401, message: "Invalid email or password" });
    }

    const isPasswordValid = bcrypt.compareSync(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const otp = OTP.generateOTP();
    const token = OTP.generateJwtToken(user._id);

    res.json({
      status: 200,
      message: "Login successfully",
      token: token,
      data: user,
      otp: otp,
    });
  } catch (error) {
    console.log(error.message);
    return res.json({ status: 500, message: error.message });
  }
};

const getallUser = async (req, res) => {
  try {
    const getUsers = await User.find(); /* .populate("wishlist") */
    res.json(getUsers);
  } catch (error) {
    throw new Error(error);
  }
};

const getaUser = async (req, res) => {
  const { id } = req.params;

  try {
    const getaUser = await User.findById(id);
    res.json({
      status: 200,
      message: "User get successfully",
      data: getaUser,
    });
  } catch (error) {
    res.json({
      status: 500,
      message: error.message,
    });
  }
};

const UpdateUser = async (req, res) => {
  // const { id } = req.params;
  const id = req.user._id;
  const { name, email, mobile, password, address, pincode, city } = req.body;
  try {
    const UpdateUser = await User.findByIdAndUpdate(
      id,
      {
        name,
        email,
        mobile,
        password,
        address,
        pincode,
        city,
      },
      { new: true }
    );
    res.json({
      status: 200,
      message: "Distributor updated successfully",
      data: UpdateUser,
    });
  } catch (error) {
    res.json({ status: 500, message: error.message });
  }
};

const deleteaUser = async (req, res) => {
  const { id } = req.params;
  try {
    const deleteaUser = await User.findByIdAndDelete(id);
    res.json({
      deleteaUser,
    });
  } catch (error) {
    throw new Error(error);
  }
};

const addTeammateDistributor = async (req, res) => {
  const { distributorId, teammateId } = req.body;

  try {
    const distributor = await User.findById(distributorId);

    if (!distributor) {
      return res.status(404).json({ success: false, message: "Distributor not found." });
    }

    if (!distributor.active) {
      return res.status(400).json({ success: false, message: "Only active distributors can add teammates." });
    }

    if (distributor.teamMembers.length >= 10) {
      return res.status(400).json({ success: false, message: "Maximum number of teammates reached." });
    }

    const teammateDistributor = await User.findById(teammateId);

    if (!teammateDistributor) {
      return res.status(404).json({ success: false, message: "Teammate distributor not found." });
    }

    if (teammateDistributor.parentId) {
      return res.status(400).json({ success: false, message: "Teammate distributor already has a parent." });
    }

    if (distributor.chainLevel >= 2) {
      return res.status(400).json({ success: false, message: "Maximum chain level reached." });
    }

    teammateDistributor.parentId = distributor._id;
    teammateDistributor.chainLevel = distributor.chainLevel + 1;

    await teammateDistributor.save();

    distributor.teamMembers.push(teammateId);
    await distributor.save();

    return res.status(200).json({ success: true, message: "Teammate added successfully." });
  } catch (error) {
    console.error("Error adding teammate distributor:", error);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// const UserCart = async (req, res) => {
//   const { cart } = req.body;
//   const { _id } = req.user;
//   try {
//     let products = [];
//     const user = await User.findById(_id);
//     // check if user already have products in cart
//     const alreadyExistCart = await Cart.findOne({ orderby: user._id });
//     if (alreadyExistCart) {
//       alreadyExistCart.remove();
//     }
//     for (let i = 0; i < cart.length; i++) {
//       let object = {};
//       object.product = cart[i]._id;
//       object.count = cart[i].count;
//       object.colour = cart[i].colour;

//       let getPrice = await Product.findById(cart[i]._id).select("price").exec();
//       object.price = getPrice.price;
//       products.push(object);
//       for (let i = 0; i < products.length; i++){
//         cartTptal = cartTotal+products[i].price * products[i].count;
//       }
//       console.log(products.cartTotal);
//       res.json({
//         status: 200,
//         message: "Product cart successfully updated"

//       });
//     }
//   } catch (error) {
//     res.json({
//       status: 500,
//       message: error.message
//     });
//   }
// }

const UserCart = async (req, res) => {
  const { cart } = req.body;
  const { _id } = req.user;
  try {
    const user = await User.findById(_id);
    // check if user already has products in cart
    const alreadyExistCart = await Cart.findOne({ orderby: user._id });
    if (alreadyExistCart) {
      await Cart.deleteOne({ _id: alreadyExistCart._id });
      return res.json("deleted successfully");
    }

    let products = [];
    let cartTotal = 0; // Initialize cartTotal variable

    for (let i = 0; i < cart.length; i++) {
      let object = {};
      object.product = cart[i]._id;
      object.count = cart[i].count;
      object.colour = cart[i].colour;

      let getPrice = await Product.findById(cart[i]._id).select("price").exec();
      object.price = getPrice.price;
      products.push(object);

      cartTotal += object.price * object.count; // Update cartTotal for each product
    }

    const newCart = new Cart({
      products: products,
      cartTotal: cartTotal,
      orderby: user._id,
    });

    await newCart.save();

    res.json({
      status: 200,
      message: "Product cart successfully updated",
    });
  } catch (error) {
    res.json({
      status: 500,
      message: error.message,
    });
  }
};

const getUserCart = async (req, res) => {
  const { _id } = req.user;
  validateMongoDbId(_id);
  try {
    const cart = await Cart.findOne({ orderby: _id }).populate(
      "products.product" /*  "_id title price totalAfterDiscount" */
    );
    res.json({
      status: 200,
      message: "User Cart fetched successfully",
      data: cart,
    });
  } catch (error) {
    res.json({
      status: 500,
      message: error.message,
    });
  }
};

const emptyCart = async (req, res) => {
  const { _id } = req.user;
  validateMongoDbId(_id);
  try {
    const user = await User.findOne({ _id });
    const cart = await Cart.findOneAndRemove({ orderby: user._id });
    res.json({
      status: 200,
      message: "Empty Cart fetched successfully",
      data: cart,
    });
  } catch (error) {
    res.json({
      status: 500,
      message: error.message,
    });
  }
};

const applyCoupon = async (req, res) => {
  const { coupon } = req.body;
  const { _id } = req.user;
  const validCoupon = await Coupon.findOne({ name: coupon });
  console.log(validCoupon);
  if (validCoupon === null) {
    return res.json("Invalid coupon");
  }
  const user = await User.findOne({ _id });
  let { cartTotal } = await Cart.findOne({
    orderby: user._id,
  }).populate("products.product");
  let totalAfterDiscount = (
    cartTotal -
    (cartTotal * validCoupon.discount) / 100
  ).toFixed(2);
  await Cart.findOneAndUpdate(
    { orderby: user._id },
    { totalAfterDiscount },
    { new: true }
  );
  res.json({totalAfterDiscount})
};

module.exports = {
  createUser,
  loginUser,
  getallUser,
  getaUser,
  UpdateUser,
  addTeammateDistributor,
  deleteaUser,
  UserCart,
  getUserCart,
  emptyCart,
  applyCoupon,
};

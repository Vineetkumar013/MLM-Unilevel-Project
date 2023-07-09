const express = require("express");
const {
  createUser,
  loginUser,
  getallUser,
  getaUser,
  deleteaUser,
  UpdateUser,
  UserCart,
  getUserCart,
  emptyCart,
  applyCoupon,
  addTeammateDistributor
} = require("../Controller/distributorCtrl");
const { isAuthenticatedUser } = require("../Middleware/auth");
const router = express.Router();

router.post("/register", createUser);
router.post("/login", loginUser);
router.get("/all-users", getallUser);
router.get("/:id", isAuthenticatedUser, getaUser);
router.put("/update", isAuthenticatedUser, UpdateUser);
router.delete("/:id", isAuthenticatedUser, deleteaUser);
router.post("/cart", isAuthenticatedUser, UserCart);
router.get("/getcart/user", isAuthenticatedUser, getUserCart);
router.get("/empty-cart/user", isAuthenticatedUser, emptyCart);
router.post("/cart/applycoupon", isAuthenticatedUser, applyCoupon);
router.post("/addteammate", addTeammateDistributor);



module.exports = router;

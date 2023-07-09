const express = require("express");
const { isAuthenticatedUser } = require("../Middleware/auth");
const { createOrder, getOrder } = require("../Controller/orderCtrl");
const router = express.Router();

router.post("/cash-order",isAuthenticatedUser, createOrder);
router.get("/get-order",isAuthenticatedUser, getOrder);



module.exports = router;

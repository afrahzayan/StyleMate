const express = require("express");
const router = express.Router();

const { calculateLivePrice } = require("../../controllers/store/priceController");

router.post("/price/calculate", calculateLivePrice);

module.exports = router;
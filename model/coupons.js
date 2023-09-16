const mongoose = require("mongoose");
const couponsSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true,"coupon name required"],
    unique:true,
    uppercase:true
  },
  percentage: {
    type: Number,
    required: true,
  },
  minamount: {
    type: Number,
    required: true,
  },
  maxamount: {
    type: Number,
    required: true,
  },
  status: {
    type: String, 
    default: 'List',
  }
});

module.exports = mongoose.model("coupons", couponsSchema);

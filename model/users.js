const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  mobile:{
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    default:"Active"
  },
  isAdmin: {
    type: Boolean,
    default:false
  },
});

module.exports = mongoose.model("users", userSchema);
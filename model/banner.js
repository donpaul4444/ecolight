const mongoose = require("mongoose");
const bannerSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true,"Title required"],
    unique:true,
  },
  image: {
    type: String,
    required: [true,"image required"],
  },
  status: {
    type: String, 
    default: 'List',
  },
  url: {
    type: String,
    required: [true,"url required"],
    unique:true,
  },
});

module.exports = mongoose.model("banner", bannerSchema);
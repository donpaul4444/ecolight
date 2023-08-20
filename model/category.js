const mongoose = require("mongoose");
const categorySchema = new mongoose.Schema({
  catname: {
    type: String,
    required: [true,"category name required"],
    unique:true,
    lowercase:true
  },
  images: {
    type: String,
    required: [true,"category image required"],
  },
  status: {
    type: String, 
    default: 'List',
  }
});

module.exports = mongoose.model("category", categorySchema);
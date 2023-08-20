const mongoose = require("mongoose");
const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  brand: {
    type: String,
    enum:["Philips","Sinoman","Homesake","Eliante","Crompton"],
    required: true,
  },
  colour: {
    type: String,
    enum:["White","Warm","Red","Green","Blue"],
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  lights: {
    type: String,
    enum:["One","Two","Three","Four","Five"],
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  status: {
    type: String, 
    default: 'List',
  },
  images: [{ type: String, required: true }],

});

module.exports = mongoose.model("products", productSchema);

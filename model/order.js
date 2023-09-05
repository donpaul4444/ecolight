const mongoose = require("mongoose");
const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "users",
  },
  paymentmethod: {
    type: String,
    required:true,
  },
  totalprice: {
    type: Number,
    required:true,
  },
  orderDate: {
    type: Date, 
    default: Date.now, 
  },
  razorpayid:{
    type:Object
  },
  status: {
    type: String,
    required:true,
    enum:["Placed","Shipped","Cancelled","Pending"],
    default:"Pending"
  },
  address: 
    {
      firstname: {
        type: String,
        required: true,
      },
      lastname: {
        type: String,
        required: true,
      },
      address: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      state: {
        type: String,
        required: true,
      },
      pincode: {
        type: Number,
        required: true,
      },
      email: {
        type: String,
        required: true,
      },
      mobile: {
        type: Number,
        required: true,
      },
      
    },
    
    items: [
      {
        productId: {
          type: mongoose.Schema.ObjectId,
          ref: "products",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
      },
    ],
  
 
});

module.exports = mongoose.model("orders", orderSchema);

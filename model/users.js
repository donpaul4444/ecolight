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
  address: [
    {
      firstname: {
        type: String,
        required:true,
      },
      lastname: {
        type:String,
        required:true,
      },
      address: {
        type: String,
        required:true,
      },
      city: {
        type:String,
        required:true,
      },
      state: {
        type: String,
        required:true,
      },
      pincode: {
        type:Number,
        required:true,
      }, 
       email: {
        type: String,
        required:true,
      },
      mobile: {
        type:Number,
        required:true,
      },
    },
  ],
});

module.exports = mongoose.model("users", userSchema);
const mongoose = require("mongoose");
const walletSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "users",
  },
  total:{
    type:Number,
    required:true
  },
  items: [
    {
      title: {
        type: String,
        required: true,
      },
      orderDate: {
        type: Date,
        default: Date.now,
      },
     credit: {
        type: Number,
        default:0,
      },
     debit: {
        type: Number,
        default:0
      },
      orderId: {
        type: String,
        default:""
      }
    }
  ]
});

module.exports = mongoose.model("wallet", walletSchema);

const order = require("../model/order");
const users = require("../model/users");
const Cart = require("../model/cart");
const Razorpay = require("razorpay");
const crypto = require("crypto");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});
module.exports = {
  getOrderComplete: async (req, res, next) => {
    let user = req.session.user;
    let addressId = req.query.selectedAddress;
    let paymentmethod = req.query.selectedPaymentMethod;
    let items = [];
    let totalprice = 0;

    try {
      const userid = await users.findById(user._id);
      const address = userid.address.id(addressId);

      const userCart = await Cart.findOne({ user: user._id }).populate(
        "items.productId"
      );

      if (userCart) {
        userCart.items.forEach((item) => {
          const price = item.productId.price * item.quantity;
          totalprice += price;
        });
      }

      if (userCart) {
        userCart.items.forEach((item) => {
          const temp = {
            productId: item.productId._id,
            quantity: item.quantity,
            price: item.productId.price,
          };
          items.push(temp);
        });
      }

      let flag=0
      userCart.items.forEach((item)=>{
        if(item.quantity>item.productId.quantity){
          flag=1
        }
      })

      if(flag==1){
        return res.redirect("/checkout?stockstatus=true")
      }

      
      const newOrder = {
        user: user._id,
        paymentmethod: paymentmethod,
        totalprice: totalprice,
        address: address,
        items,
      }
      

      if (paymentmethod == "COD") {
        newOrder.status="Placed"
        await order.create(newOrder)
        await Cart.findByIdAndDelete({_id:userCart._id})
        res.redirect("/ordercomplete/page");
      } else if (paymentmethod == "Razorpay") {

        const orderOptions = {
          amount: totalprice * 100,
          currency: "INR",
          receipt: "order_receipt_123",
        };
        let razorpayorder = await razorpay.orders.create(orderOptions);
        newOrder.razorpayid=razorpayorder
        await order.create(newOrder)
        res.render("user/razorpay", {
          razorpayorder,
          key: process.env.RAZORPAY_KEY_ID,
        });
      }
    } catch (error) {
      next(error);
    }
  },

  postRazorpay: async (req, res, next) => {
    try {
      const response = req.body
      let user = req.session.user;
      const userCart = await Cart.findOne({ user: user._id })
      const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);

      hmac.update(
        response.razorpayOrderId + "|" + response.razorpayPaymentId
      );
      const generatedSignature = hmac.digest("hex");

      if (generatedSignature == response.secret) {

       const verification= await order.findOne({"razorpayid.id": response.razorpayOrderId})
       verification.status="Placed"
      await verification.save()
      await Cart.findByIdAndDelete({_id:userCart._id})
        res.status(200).json({ status: true });
      } else {
        res.status(400).json({ status: false });
      }
    } catch (error) {
      next(error);
    }
  },

  getOrders: async (req, res, next) => {
    try {
      let user = req.session.user;
      const orderlist = await order
        .find({ user: user._id })
        .populate("items.productId")
        .limit(5)
        .sort({orderDate:-1})
      res.render("user/orders", { user, orderlist });
    } catch (error) {
      next(error);
    }
  },

  getOrderList: async (req, res, next) => {
    try {
      let user = req.session.user;
      const id = req.query.id;
      const orders = await order
        .findById({ _id: id })
        .populate("items.productId");
      res.render("user/order-detail", { order: orders, user });
    } catch (error) {
      next(error);
    }
  },

  getAdminOrders: async (req, res, next) => {
    try {
      let orders = await order.find({});
      res.render("admin/orders", { orders });
    } catch (error) {
      next(error);
    }
  },
  getAdminOrderDetail: async (req, res, next) => {
    try {
      const id = req.query.id;
      const orders = await order
        .findById({ _id: id })
        .populate("items.productId");
      res.render("admin/order-detail", { order: orders });
    } catch (error) {
      next(error);
    }
  },

  postUpdateOrderStatus: async (req, res, next) => {
    const id = req.query.orderId;
    const status = req.query.status;

    try {
      const orders = await order.findByIdAndUpdate(
        id,
        { status: status },
        { new: true }
      );
      res.status(200).json();
    } catch (error) {
      next(error);
    }
  },

  getOrderCompletePage: async(req,res,next)=>{
    res.render("user/ordercomplete")
  }
};

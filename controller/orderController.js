const order = require("../model/order");
const users = require("../model/users");
const Cart = require("../model/cart");
const coupon = require("../model/coupons");
const product = require("../model/products");
const wallet = require("../model/wallet");
const ITEMS_PER_PAGE = 6;
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
    let couponid = req.query.couponid;
    let items = [];
    let totalprice = 0;
    let grandtotal = 0;
    let couponprice = 0;

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
      grandtotal = totalprice;
      if (couponid) {
        let couponvalue = await coupon.findById({ _id: couponid });
        couponprice = (totalprice / 100) * couponvalue.percentage;
        if (couponprice > couponvalue.maxamount) {
          couponprice = couponvalue.maxamount;
        }
        grandtotal = totalprice - couponprice;
      }

      if (userCart) {
        userCart.items.forEach((item) => {
          const temp = {
            productId: item.productId._id,
            quantity: item.quantity,
            price: item.productId.price,
            discountprice: Math.round(
              couponprice *
                ((item.productId.price * item.quantity) / totalprice)
            ),
            finalprice: Math.round(
              item.productId.price * item.quantity -
                couponprice *
                  ((item.productId.price * item.quantity) / totalprice)
            ),
          };
          items.push(temp);
        });
      }

      let flag = 0;
      userCart.items.forEach((item) => {
        if (item.quantity > item.productId.quantity) {
          flag = 1;
        }
      });

      if (flag == 1) {
        return res.redirect("/checkout?stockstatus=true");
      }

      userCart.items.forEach(async (item) => {
        const products = await product.findById({ _id: item.productId._id });
        products.quantity = item.productId.quantity - item.quantity;
        await products.save();
      });

      const newOrder = {
        user: user._id,
        paymentmethod: paymentmethod,
        totalprice: totalprice,
        grandtotal: grandtotal,
        couponprice: couponprice,
        address: address,
        items,
      };

      if (paymentmethod == "COD") {
        for (const item of newOrder.items) {
          item.status = "Placed";
        }
        await order.create(newOrder);
        await Cart.findByIdAndDelete({ _id: userCart._id });
        res.redirect("/ordercomplete/page");
      } else if (paymentmethod == "wallet") {
        const userwallet = await wallet.findOne({ user });
        if (userwallet && userwallet.total > newOrder.grandtotal) {
          for (const item of newOrder.items) {
            item.status = "Placed";
          }
          await order.create(newOrder);
          await Cart.findByIdAndDelete({ _id: userCart._id });
          const currentorder = await order.findOne({}).sort({ orderDate: -1 });
          const temp = {
            title: `Spend for order ${currentorder._id}`,
            debit: grandtotal,
          };
          userwallet.items.push(temp);
          await userwallet.save();
          res.redirect("/ordercomplete/page");
        } else {
          return res.redirect("/checkout?walletstatus=true");
        }
      } else if (paymentmethod == "Razorpay") {
        const orderOptions = {
          amount: totalprice * 100,
          currency: "INR",
          receipt: "order_receipt_123",
        };
        let razorpayorder = await razorpay.orders.create(orderOptions);
        newOrder.razorpayid = razorpayorder;
        await order.create(newOrder);
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
      const response = req.body;
      let user = req.session.user;
      const userCart = await Cart.findOne({ user: user._id });
      const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);

      hmac.update(response.razorpayOrderId + "|" + response.razorpayPaymentId);
      const generatedSignature = hmac.digest("hex");

      if (generatedSignature == response.secret) {
        const verification = await order.findOne({
          "razorpayid.id": response.razorpayOrderId,
        });
        for (const item of verification.items) {
          item.status = "Placed";
        }
        await verification.save();
        await Cart.findByIdAndDelete({ _id: userCart._id });
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
        .sort({ orderDate: -1 });
      res.render("user/orders", { user, orderlist });
    } catch (error) {
      next(error);
    }
  },

  getOrderList: async (req, res, next) => {
    try {
      let user = req.session.user;
      const orderid = req.query.orderid;
      const itemid = req.query.itemid;
      const orders = await order
        .findById({ _id: orderid })
        .populate("items.productId");
      res.render("user/order-detail", { order: orders, user, itemid });
    } catch (error) {
      next(error);
    }
  },

  getAdminOrders: async (req, res, next) => {
    try {
      const page = req.query.page || 1;
      const orderscount = await order.countDocuments({});
      const totalpages = Math.ceil(orderscount / ITEMS_PER_PAGE);
      let orders = await order
        .find({})
        .populate("items.productId")
        .sort({ orderDate: -1 })
        .skip(ITEMS_PER_PAGE * (page - 1))
        .limit(ITEMS_PER_PAGE);
      res.render("admin/orders", { orders, page, totalpages });
    } catch (error) {
      next(error);
    }
  },
  getAdminOrderDetail: async (req, res, next) => {
    try {
      const orderid = req.query.orderid;
      const itemid = req.query.itemid;
      const orders = await order
        .findById({ _id: orderid })
        .populate("items.productId");
      res.render("admin/order-detail", { order: orders, itemid });
    } catch (error) {
      next(error);
    }
  },

  postUpdateOrderStatus: async (req, res, next) => {
    const orderid = req.query.orderId;
    const itemid = req.query.itemId;
    const status = req.query.status;

    try {
      const updatedOrder = await order.findOneAndUpdate(
        {
          _id: orderid,
          "items._id": itemid,
        },
        {
          $set: {
            "items.$.status": status,
          },
        },
        { new: true }
      );
      res.status(200).json({ status: true });
    } catch (error) {
      next(error);
    }
  },

  getOrderCompletePage: async (req, res, next) => {
    res.render("user/ordercomplete");
  },

  getCancelOrder: async (req, res, next) => {
    const orderid = req.query.orderid;
    const itemid = req.query.itemid;
    try {
      const updatedOrder = await order.findOneAndUpdate(
        {
          _id: orderid,
          "items._id": itemid,
        },
        {
          $set: {
            "items.$.status": "Cancelled",
          },
        },
        { new: true }
      );
      res.status(200).json({ success: true });
    } catch (error) {
      next(error);
    }
  },
};

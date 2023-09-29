const order = require("../model/order");
const users = require("../model/users");
const Cart = require("../model/cart");
const coupon = require("../model/coupons");
const product = require("../model/products");
const wallet = require("../model/wallet");
const easyinvoice = require("easyinvoice");
const PDFDocument = require("pdfkit");
const moment = require("moment");
const fs = require("fs");
const ITEMS_PER_PAGE = 6;
const Razorpay = require("razorpay");
const crypto = require("crypto");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});
module.exports = {
  // The checkout button is routing to this controller and it redirect to order complete page
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
          amount: grandtotal * 100,
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

  // The razorpay respose received in this router and redirect to order complete page
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

  // To access orders list in user side
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

  // To access order detail page in user side
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

  // To access order list in admin side
  getAdminOrders: async (req, res, next) => {
    try {
      const page = req.query.page || 1;
      const orderscount = await order.aggregate([
        { $unwind: "$items" },
        { $match: { "items.status": { $ne: "Pending" } } },
        { $group: { _id: null, sum: { $sum: 1 } } },
      ]);

      const totalpages = Math.ceil(orderscount[0].sum / ITEMS_PER_PAGE);
      const orders = await order.aggregate([
        { $unwind: "$items" },
        { $match: { "items.status": { $ne: "Pending" } } },
        { $sort: { orderDate: -1 } },
        { $skip: ITEMS_PER_PAGE * (page - 1) },
        { $limit: ITEMS_PER_PAGE },
        {
          $lookup: {
            from: "products", // The name of the other collection
            localField: "items.productId",
            foreignField: "_id",
            as: "items.productId",
          },
        },
      ]);
      res.render("admin/orders", { orders, page, totalpages });
    } catch (error) {
      next(error);
    }
  },

  // To access order detail page in admin side
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

  // To change the status of the order
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

  // To access order complete page
  getOrderCompletePage: async (req, res, next) => {
    try {
      res.render("user/ordercomplete");
    } catch (error) {
      next(error);
    }
  },

  // To download invoice
  getInvoice: async (req, res, next) => {
    try {
      const itemid = req.query.itemid;
      const orderid = req.query.orderid;
      const orders = await order.findById(orderid).populate("items.productId");
      const items = orders.items.id(itemid);
      const isoDateString = orders.orderDate;
      const isoDate = new Date(isoDateString);
      const options = { year: "numeric", month: "long", day: "numeric" };
      const formattedDate = isoDate.toLocaleDateString("en-US", options);
      const formattedPrice = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "INR",
      });

      var data = {
        customize: {
          template: fs.readFileSync("public/html/template.html", "base64"),
        },
        images: {
          logo: fs.readFileSync("public/images/ecologo.png", "base64"),
          background:
            "https://public.easyinvoice.cloud/img/watermark-draft.jpg",
        },

        sender: {
          company: "Eco Light",
          address: "291 SOUTH 21TH STREET KADAVANTHARA , KOCHI",
          zip: "680541",
          city: "Ernamkulam",
          country: "India",
        },

        client: {
          company: "Customer Adress",
          address:
            orders.address.firstname +
            "" +
            orders.address.lastname +
            "," +
            orders.address.address,
          zip: orders.address.pincode,
          city: orders.address.city,
          custom1: formattedPrice.format(items.discountprice),
          custom2: formattedPrice.format(items.finalprice),
        },
        information: {
          number: "order" + orders._id,
          date: formattedDate,
        },
        products: [
          {
            quantity: items.quantity,
            description: items.productId.name,
            "tax-rate": 0,
            price: items.price,
            discount: 100,
          },
        ],
        "bottom-notice": "Happy shoping and visit again",
        settings: {
          currency: "INR",
        },

        translate: {},
      };

      easyinvoice.createInvoice(data, (result) => {
        const fileName = "invoice.pdf";
        const base64String = result.pdf;

        res.setHeader(
          "Content-Disposition",
          `attachment; filename=${fileName}`
        );
        res.setHeader("Content-Type", "application/pdf");
        res.send(Buffer.from(base64String, "base64"));
      });
    } catch (error) {
      next(error);
    }
  },

  // To access salesreport page in admin side
  getSalesReport: async (req, res, next) => {
    try {
      let { from, to } = req.query;
      const today = moment().format("YYYY-MM-DD");
      if (!from || !to) {
        from = today;
        to = today;
      }

      if (from > to) [from, to] = [to, from];
      to += "T23:59:59.999Z";

      const orders = await order.aggregate([
        { $unwind: "$items" },
        {$match: {"items.status": "Delivered",orderDate: { $gte: new Date(from), $lte:new Date(to) }}},
      ]);
      from = from.split('T')[0]
			to = to.split('T')[0]
      res.render("admin/sales-report", { orders,from,to });
    } catch (error) {
      next(error);
    }
  },

  // To download sales report
  getSalesReportDownload: async (req, res, next) => {
    try {
      let { from, to } = req.query;
      const today = moment().format("YYYY-MM-DD");
      if (!from || !to) {
        from = today;
        to = today;
      }

      if (from > to) [from, to] = [to, from];
      to += "T23:59:59.999Z";

      const orders = await order.aggregate([
        { $unwind: "$items" },
        {$match: {"items.status": "Delivered",orderDate: { $gte: new Date(from), $lte:new Date(to) }}},
      ]);

      // Create a new PDF document
      const doc = new PDFDocument();

      // Set response headers for PDF download
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        'attachment; filename="sales-report.pdf"'
      );

      // Pipe the PDF output to the response object
      doc.pipe(res);

      // Title
      doc.fontSize(20).text("Sales Report", { align: "center" });
      doc.moveDown();
      const salesData = [];
      let index = 1;
      // Sample sales data from your database (replace with your actual data retrieval logic)

      orders.forEach((order) => {
        const quantity = order.items.quantity;
        const total = order.items.price * order.items.quantity;
        const discount = order.items.discountprice;
        const orderId = order._id;
        const date = order.orderDate.toLocaleDateString();

        salesData.push({
          index: index++,
          date,
          orderId,
          quantity,
          total,
          discount,
        });
      });
      // Define table headers
      const headers = [
        "Index",
        "Date",
        "Order Id",
        "Qnty",
        "Total",
        "Discount",
        "Final Price",
      ];

      // Calculate column widths
      const colWidths = [40, 60, 180, 50, 70, 70, 70];

      // Set initial position for drawing
      let x = 50;
      let y = doc.y;

      // Draw table headers
      headers.forEach((header, index) => {
        doc
          .font("Helvetica-Bold")
          .fontSize(12)
          .text(header, x, y, { width: colWidths[index], align: "left" });
        x += colWidths[index];
      });

      // Draw table rows
      let grandTotal = 0;
      let grandDiscount = 0;

      salesData.forEach((sale) => {
        x = 50;
        y += 20;

        // Calculate final price (total - discount)
        const finalPrice = sale.total - sale.discount;
        grandTotal += sale.total;
        grandDiscount += sale.discount;

        // Create an array of row data with the Indian Rupee symbol and formatted prices
        const rowData = [
          sale.index,
          sale.date,
          sale.orderId,
          sale.quantity,
          `${sale.total.toFixed(2)}`, // Format total price
          `${sale.discount.toFixed(2)}`, // Format discount
          `${finalPrice.toFixed(2)}`, // Format final price
        ];

        // Draw row data
        rowData.forEach((value, index) => {
          doc.font("Helvetica").fontSize(12).text(value.toString(), x, y, {
            width: colWidths[index],
            align: "left",
          });
          x += colWidths[index];
        });
      });

      // Draw grand totals
      y += 20;
      doc.text(`Total: ${grandTotal.toFixed(2)}`, 420, (y += 20));
      y += 20;
      doc.text(`Discount: ${grandDiscount.toFixed(2)}`, 420, y);
      y += 20;
      const grandFinalPrice = grandTotal - grandDiscount;
      doc.text(`Grand Total: ${grandFinalPrice.toFixed(2)}`, 420, y);

      // Finalize the PDF file
      doc.end();
    } catch (error) {
      next(error);
    }
  },
};

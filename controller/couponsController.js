const coupon = require("../model/coupons");
const ITEMS_PER_PAGE = 6;
module.exports = {
  getCoupons: async (req, res, next) => {
    const page = req.query.page || 1;
    const couponscount = await coupon.countDocuments({});
    const totalpages = Math.ceil(couponscount / ITEMS_PER_PAGE);
    let coupons = await coupon.find({}).skip(ITEMS_PER_PAGE * (page - 1))
    .limit(ITEMS_PER_PAGE);
    try {
      res.render("admin/coupons", { coupons, page, totalpages});
    } catch (err) {
      next(err);
    }
  },
  getAddCoupons: (req, res) => {
    res.render("admin/coupons-add");
  },
  postAddCoupons: async (req, res,next) => {
    try {
     const data=req.body
      await coupon.create(data)
      res.status(200).json({ success: true });
    } catch (err) {
      next(err)
    
    }
  },
  listCoupons: async (req, res, next) => {
    const id = req.query.id;
    try {
      const data = await coupon.findById(id);
      if (data.status == "List") {
        data.status = "UnList";
      } else {
        data.status = "List";
      }
      await data.save();
      res.redirect("/admin/coupons")
    } catch (err) {
      next(err)
    }
  },
  getEditCoupons: async (req, res) => {
    let id = req.query.id;
    try {
      const data = await coupon.findById(id);

      res.render("admin/coupons-edit", { data });
    } catch (err) {
      console.log(err);
    }
  },
  postEditCoupons: async (req,res,next) => {
   
    try {
      const data=req.body
      console.log(data);
      const coupons = await coupon.findById(data.id);
      coupons.name = data.name;
      coupons.percentage = data.percentage;
      coupons.minamount=data.minamount
      coupons.maxamount=data.maxamount
    
      await coupons.save();
      res.status(200).json({ success: true });
    } catch (err) {
      next(err)
    }
  },
};

const coupon = require("../model/coupons");
const ITEMS_PER_PAGE = 6;
module.exports = {
  // To access coupon lisiting page in admin side
  getCoupons: async (req, res, next) => {
    try {
    const page = req.query.page || 1;
    const couponscount = await coupon.countDocuments({});
    const totalpages = Math.ceil(couponscount / ITEMS_PER_PAGE);
    let coupons = await coupon.find({}).skip(ITEMS_PER_PAGE * (page - 1))
    .limit(ITEMS_PER_PAGE);
      res.render("admin/coupons", { coupons, page, totalpages});
    } catch (err) {
      next(err);
    }
  },


  // To access coupon add page in admin side
  getAddCoupons: (req, res,next) => {
    try {
      res.render("admin/coupons-add");
    } catch (error) {
      next (error)
    }  
  },


  // To add coupon details to database
  postAddCoupons: async (req, res,next) => {
    try {
     const data=req.body
      await coupon.create(data)
      res.status(200).json({ success: true });
    } catch (err) {
      next(err) 
    }
  },


// To change the status of the coupons
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


  // To access coupon edit page in admin side
  getEditCoupons: async (req, res,next) => {
    let id = req.query.id;
    try {
      const data = await coupon.findById(id);
      res.render("admin/coupons-edit", { data });
    } catch (err) {
    next(err)
    }
  },


  // To apply coupon edited data to database
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

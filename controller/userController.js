const users = require("../model/users");
const banner=require("../model/banner")
const product = require("../model/products");
const cat = require("../model/category");
const Cart = require("../model/cart");
const coupon=require("../model/coupons")
const bcrypt = require("bcrypt");
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require("twilio")(accountSid, authToken);
const sid = process.env.TWILIO_SID;
const ITEMS_PER_PAGE = 6;

module.exports = {
  getHome: async (req, res) => {
    let categories = await cat.find({status:"List"});
    let banners= await banner.find({})
    let newproducts = await product.aggregate([
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "category",
        },
      },
      {
        $match: {
          status: "List",
          "category.status": "List",
        },
      },
      {
        $sort: {
          orderDate: -1,
        },
      },
      {
        $limit: 8,
      },
    ]);
    

    res.render("user/home", {categories,newproducts,banners});
  },
  getLogin: (req, res) => {
    if(req.session.user){
      res.redirect("/");
  }else{
      res.render("user/login",{ err:""})
  }
    
  },
  postLogin: async (req, res) => {
    const data = req.body;

    try {
      const user = await users.findOne({ email: data.email });

      if (user) {
        let status = await bcrypt.compare(data.password, user.password);

        if (status && user.status == "Active") {
          req.session.user = user;
          res.redirect("/");
        } else if(status && user.status == "Blocked") {
          res.render("user/login", { err: "User Blocked by Admin" });
        } else {
          res.render("user/login", { err: "Invalid username or password" });
        }
      }else {
        res.render("user/login", { err: "Invalid username or password" });
      }
    } catch (err) {
      console.log(err);
    }
  },
  getSignup: (req, res) => {
  
    res.render("user/signup", { email: "", mob: "" });
  },
  postSignup: async (req, res) => {
    const data = req.body;

    try {
      const user = await users.findOne({ email: data.email });
      const mob = await users.findOne({ mobile: data.mobile });

      const verificationstatus = await client.verify.v2
        .services(sid)
        .verificationChecks.create({ to: `+91${data.mobile}`, code: data.otp });
      console.log(verificationstatus);

      if (verificationstatus.status !== "approved") {
        return res.render("user/signup", {
          mob: "please check the OTP you entered",
          email: "",
        });
      }
      if (user) {
        res.render("user/signup", { email: "email id already exist", mob: "" });
      } else if (mob) {
        res.render("user/signup", {
          mob: "Mobile number already exist",
          email: "",
        });
      } else {
        data.password = await bcrypt.hash(data.password, 10);
        await users.create(data);
        res.redirect("/login");
      }
    } catch (err) {
      console.log(err);
    }
  },
  postOtp: async (req, res) => {
    const { mob } = req.body;
    try {
      const status = await users.countDocuments({ mobile: mob });
      if (status > 0) {
        return res
          .status(409)
          .json({ success: false, error: "mboile number already exist" });
      }

      client.verify.v2
        .services(sid)
        .verifications.create({ to: `+91${mob}`, channel: "whatsapp" })
        .then((verification) => {
          console.log(verification.sid);
          res.status(200).json({ success: true });
        })
        .catch((err) => {
          res
            .status(500)
            .json({ success: false, error: "something went wrong" });
          console.log(err);
        });
    } catch (error) {
      res.status(500).json({ success: false, error: "something went wrong" });
      console.log(error);
    }
  },
  getCheckUser: async(req, res) => {
    if (req.session.user) {
      res.status(200).json({ success: true });
    } else {
      res.status(200).json({ success: false });
    }
  },
  getLogout: (req, res) => {
    delete req.session.user;
    res.redirect("/login");
  },




  getAdminLogin: (req, res) => {
    if(req.session.admin){
      res.redirect("/admin/dashboard");
  }else{
    res.render("admin/adminlogin",{err:""});
  }
  },
  getAdminDashboard:(req,res)=>{
    res.render("admin/dashboard")
  },
  postAdminLogin: async(req,res)=>{
    const data=req.body
    try {
      const user = await users.findOne({ email: data.email });

      if (user) {
        let status = await bcrypt.compare(data.password, user.password);

        if (status && user.isAdmin == true) {
          req.session.admin = user;
          res.redirect("/admin/dashboard");
        } else if(status && user.isAdmin == false) {
          res.render("admin/adminlogin", { err: "Access Denied" });
        } else {
          res.render("admin/adminlogin", { err: "Invalid password" });
        }
      }else{
        res.render("admin/adminlogin", { err: "Invalid username or password" });
      }
    } catch (err) {
      console.log(err);
    }

  },
  getAdminLogout:(req,res)=>{
    delete req.session.admin
    res.redirect("/admin")
  },


  getCustomers: async (req, res) => {
    const page = req.query.page || 1;
    const userscount = await users.countDocuments({});
    const totalpages = Math.ceil(userscount / ITEMS_PER_PAGE);
    let customers = await users.find({}).skip(ITEMS_PER_PAGE * (page - 1))
    .limit(ITEMS_PER_PAGE);
    try {
      res.render("admin/customers", { customers,page,totalpages});
    } catch (err) {
      console.log(err);
    }
  },
  getEditCustomer: async (req, res) => {
    let id = req.query.id;

    try {
      const data = await users.findById(id);
      if (data.status == "Active") {
        data.status = "Blocked";
      } else {
        data.status = "Active";
      }
      await data.save();
      res.redirect("/admin/customers")
    } catch (err) {
      console.log(err);
    }
  },

  getUserProfile: (req,res)=>{
    let user=req.session.user
    res.render("user/userprofile" ,{user})
  },
  getManageAddress: async (req,res)=>{
    let user=req.session.user
    let userdata= await users.findOne({_id:user._id})
    const addressArray = userdata.address

    res.render("user/address-manage" ,{user, addressArray})
  },
  getAddAddress:(req,res)=>{
    let user=req.session.user
    res.render("user/address-add" ,{user})
  },
  postAddAddress:async(req,res,next)=>{
    const userId = req.session.user._id
    const newAddress = {
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      address: req.body.address,
      city: req.body.city,
      state: req.body.state,
      pincode: req.body.pincode,
      email: req.body.email,
      mobile: req.body.mobile,
    };
    
    try {
      const user = await users.findById(userId);
      user.address.push(newAddress)
      await user.save()
      res.redirect("/address/manage")
    } catch (error) {
      next(error)
    }
  },

 getDeleteAddress: async(req,res,next)=>{
  try {
    const userId = req.session.user._id; 
    const addressId = req.query.id; 

  
    await users.findByIdAndUpdate(userId, {
      $pull: { address: { _id: addressId } }
    });
    res.status(200).json({status:true});

  } catch (error) {
    next(error)
  }
 },



  getCheckout: async (req,res,next)=>{
   const couponid=req.query.couponid
    try {
      let user=req.session.user
      let stockstatus=req.query.stockstatus === 'true' ? true : false
      let walletstatus=req.query.walletstatus === 'true' ? true : false
      let userdata= await users.findOne({_id:user._id})
      let cartDetails = await Cart.findOne({ user: user._id }).populate({path:"items.productId"})
      
      let totalprice = 0;
    

      if (cartDetails) {
        cartDetails.items.forEach((item) => {
          const price = item.productId.price * item.quantity;
          totalprice += price;
        });
      }

      if(couponid){
        let couponvalue= await coupon.findById({_id:couponid})
        let couponprice= (totalprice/100)*couponvalue.percentage
        if(couponprice>couponvalue.maxamount){
          couponprice=couponvalue.maxamount
        }
        totalprice=totalprice-couponprice
      }
      
    
    
      const addressArray = userdata.address

      res.render("user/checkout" ,{addressArray,cartDetails,stockstatus,totalprice,couponid,walletstatus})
    } catch (error) {
      next(error)
    }
  }

};

const cat = require("../model/category");
const product = require("../model/products");
const fs = require('fs');
const path=require("path")
const { NetworkContextImpl } = require("twilio/lib/rest/supersim/v1/network");
const ITEMS_PER_PAGE=6
module.exports = {
  getProducts: async (req, res) => {
    const products = await product.find({});
    res.render("admin/products", { products });
  },
  addProduct: async (req, res) => {
    const category = await cat.find({});
    const products = await product.find({});

    res.render("admin/products-add", { category, products });
  },
  postAddProduct: async (req, res, next) => {
    try {
      const data = JSON.parse(req.body.productData);
      data.images = [];
      req.files.forEach((element) => {
        data.images.push(element.filename);
      });
      if (data.images.length === 0) {
        return res
          .status(400)
          .json({ success: false, message: "please add images" });
      }
      await product.create(data);

      res.status(200).json({ success: true });
    } catch (error) {
      next(error);
    }
  },
  listProduct: async (req, res,next) => {
    const id = req.query.id;
    try {
      const data = await product.findById(id);
      if (data.status == "List") {
        data.status = "UnList";
      } else {
        data.status = "List";
      }
      await data.save();
      res.redirect("/admin/products")
    } catch (err) {
      next(err)
    }
  },
  getEditProduct: async (req, res) => {
    let id = req.query.id;
    try {
      const data = await product.findById(id);
      const category = await cat.find({});
      res.render("admin/products-edit", { data, category });
    } catch (err) {
      console.log(err);
    }
  },
  postEditProduct: async (req, res, next) => {
    try {
      const data = JSON.parse(req.body.productData);
      const prod = await product.findById(data.id);
      prod.name = data.name;
      prod.description = data.description;
      prod.brand = data.brand;
      prod.colour = data.colour;
      prod.price = data.price;
      prod.lights = data.lights;
      prod.category = data.category;
      prod.quantity=data.quantity

      if (req.files) {
        req.files.forEach((element) => {
          prod.images.push(element.filename);
        });
      }

      await prod.save();
      res.status(200).json({ success: true });
    } catch (error) {
      next(error);
    }
  },

  getProductList: async (req, res) => {
    const type = req.params.type;
    const category = await cat.find({status:"List"});
    const products = await product.find({ category: type ,status: "List"});
    res.render("user/productlist", { category, products, type ,categories: category});
  },
  getProductDetail: async (req, res) => {
    const id = req.query.id;
    let categories = await cat.find({status:"List"});
    const item = await product.findById(id);
    res.render("user/productdetail", { item ,categories: categories});
  },
  deleteImage: async (req,res,next)=>{
    const id= req.query.id
    const imageid= req.query.imageid
 
    try {
     const item = await product.findById(id);
      item.images = item.images.filter(img => img !== imageid);
      await item.save();

      const imagePath = path.join(__dirname,'..','public', 'uploads', imageid); 
      fs.unlinkSync(imagePath);
      res.status(200).json({ status: true });
    } catch (err) {
     next(err)
    }

  },
  getProductListNew: async (req, res) => {
    const type = req.params.type;
    const page=req.query.page||1
    
    const category = await cat.find({status:"List"});
    const products = await product.find({ category: type ,status: "List"}).skip(ITEMS_PER_PAGE*(page-1)).limit(ITEMS_PER_PAGE)
    const productscount = await product.countDocuments({ category: type ,status: "List"})
    const totalpages=Math.ceil(productscount/ITEMS_PER_PAGE)
    res.render("user/productlist", { category, products, type ,categories: category,page,totalpages});
  },

  
};

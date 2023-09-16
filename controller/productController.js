const cat = require("../model/category");
const product = require("../model/products");
const fs = require("fs");
const path = require("path");
const ITEMS_PER_PAGE = 6;
module.exports = {
  getProducts: async (req, res) => {
    const page = req.query.page || 1;
    const productscount = await product.countDocuments({});
    const totalpages = Math.ceil(productscount / ITEMS_PER_PAGE);

    const products = await product.find({}).skip(ITEMS_PER_PAGE * (page - 1))
    .limit(ITEMS_PER_PAGE);
    res.render("admin/products", { products ,totalpages, page});
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
  listProduct: async (req, res, next) => {
    const id = req.query.id;
    try {
      const data = await product.findById(id);
      if (data.status == "List") {
        data.status = "UnList";
      } else {
        data.status = "List";
      }
      await data.save();
      res.redirect("/admin/products");
    } catch (err) {
      next(err);
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
      prod.quantity = data.quantity;

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

  getProductDetail: async (req, res) => {
    const id = req.query.id;
    let categories = await cat.find({ status: "List" });
    const item = await product.findById(id);
    res.render("user/productdetail", { item, categories: categories });
  },
  deleteImage: async (req, res, next) => {
    const id = req.query.id;
    const imageid = req.query.imageid;

    try {
      const item = await product.findById(id);
      item.images = item.images.filter((img) => img !== imageid);
      await item.save();

      const imagePath = path.join(
        __dirname,
        "..",
        "public",
        "uploads",
        imageid
      );
      fs.unlinkSync(imagePath);
      res.status(200).json({ status: true });
    } catch (err) {
      next(err);
    }
  },
  getProductListNew: async (req, res, next) => {
    try {
      const page = req.query.page || 1;
      const partialName = req.query.search;
      const category = req.query.category;
      const brand= req.query.brand
      const colour=req.query.colour
      const sort=req.query.sort

      let filter = { status: "List" };

      if (partialName) {
        const nameRejex = new RegExp(`^${partialName}`, "i");
        filter.name = nameRejex;
      }
      if (category)  filter.category = category;
      if(brand) filter.brand=brand
      if(colour)filter.colour=colour


      const sortOptions = {};

if (sort === 'lowhigh') {
    sortOptions.price = 1;
} else if (sort === 'highlow') {
    sortOptions.price = -1; 
}
      const productsfull=await product.find({})
      const products = await product
        .find(filter)
        .sort(sortOptions) 
        .skip(ITEMS_PER_PAGE * (page - 1))
        .limit(ITEMS_PER_PAGE);
      const productscount = await product.countDocuments(filter);
      const totalpages = Math.ceil(productscount / ITEMS_PER_PAGE);
      res.render("user/productlist", {
        products,
        page,
        totalpages,
        productsfull,
      });
    } catch (error) {
      next(error);
    }
  },
  getWishlistAdd: async(req,res,next)=>{
    try {
      const id= req.query.id
      const data=await product.findByIdAndUpdate(id,{wishlist:"list"}, { new: true })
      res.redirect(`/productlist/productdetail?id=${data._id}`)
    } catch (error) {
      next(error)
    }
  
  },
  getWishlistRemove: async(req,res,next)=>{
    try {
      const id= req.query.id
      const data=await product.findByIdAndUpdate(id,{wishlist:"unlist"}, { new: true })
      res.redirect(`/productlist/productdetail?id=${data._id}`)
    } catch (error) {
      next(error)
    }
  },
  getWishlistDelete: async(req,res,next)=>{
    try {
      const id= req.query.id
      await product.findByIdAndUpdate(id,{wishlist:"unlist"}, { new: true })
      res.redirect("/wishlist")
    } catch (error) {
      next(error)
    }
  },
  getWishlist: async(req,res,next)=>{
    let user = req.session.user;
      try {
      const products=await product.find({wishlist:"list"})

      res.render("user/wishlist",{products,user})
    } catch (error) {
      next(error)
    }
  },
};

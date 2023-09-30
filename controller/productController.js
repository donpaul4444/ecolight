const cat = require("../model/category");
const product = require("../model/products");
const users = require("../model/users");
const fs = require("fs");
const path = require("path");
const ITEMS_PER_PAGE = 6;
module.exports = {

  // To access products listing page in admin side
  getProducts: async (req, res, next) => {
    try {
      const page = req.query.page || 1;
    const productscount = await product.countDocuments({});
    const totalpages = Math.ceil(productscount / ITEMS_PER_PAGE);

    const products = await product
      .find({})
      .skip(ITEMS_PER_PAGE * (page - 1))
      .limit(ITEMS_PER_PAGE);
    res.render("admin/products", { products, totalpages, page });
    } catch (error) {
      next(error)
    } 
  },


  // To access product add page in admin side
  addProduct: async (req, res,next) => {
    try {
      const category = await cat.find({});
      const products = await product.find({});
      res.render("admin/products-add", { category, products });
    } catch (error) {
      next(error)
    }  
  },


  // To adding new product to data base
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


  // To change the status of the products
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


  // To access product edit page in admin side
  getEditProduct: async (req, res,next) => {
    let id = req.query.id;
    try {
      const data = await product.findById(id).populate("category");
      const category = await cat.find({});
      res.render("admin/products-edit", { data, category });
    } catch (err) {
      next(err);
    }
  },


  // To edit product details and apply data to database
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


//  To access product detail page  in user side
  getProductDetail: async (req, res,next) => {
    try {
      const id = req.query.id;
      const newuser=req.session.user
      const user= await users.findById(newuser._id)
      let categories = await cat.find({ status: "List" });
      const item = await product.findById(id).populate("category");
      res.render("user/productdetail", { item, categories: categories ,user});
    } catch (error) {
      next(error)
    } 
  },


  // To delete images in product edit page
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


//  To access products listing page in user side 
  getProductListNew: async (req, res, next) => {
    try {
      const page = req.query.page || 1;
      const partialName = req.query.search;
      const category = req.query.category;
      const brand = req.query.brand;
      const colour = req.query.colour;
      const sort = req.query.sort;

      let filter = { status: "List", "category.status": "List"};

      if (partialName) {
        const nameRejex = new RegExp(`.*${partialName}.*`, "i");
        filter.name = nameRejex;
      }
      if (category) {
        filter["category.catname"] = category; 
      }
      if (brand) filter.brand = brand;
      if (colour) filter.colour = colour;

      const sortOptions = {};

      if (sort === "lowhigh") {
        sortOptions.price = 1;
      } else if (sort === `highlow`) {
        sortOptions.price = -1;
      } else {
        sortOptions.name = 1;
      }

      const productsfull = await product.aggregate([
        {
          $lookup: {
            from: "categories",
            localField: "category",
            foreignField: "_id",
            as: "category",
          },
        },
        {$unwind:"$category"},

        {$match: filter},
      ])
      let products = await product.aggregate([
        {
          $lookup: {
            from: "categories",
            localField: "category",
            foreignField: "_id",
            as: "category",
          },
        },

        {$match: filter},
        {$sort: sortOptions},
        {$skip:ITEMS_PER_PAGE * (page - 1)},
        {$limit:ITEMS_PER_PAGE},
      ]);
      const totalpages=0
if(!filter.name){
      const productscount = await product.aggregate([
        {
          $lookup: {
            from: "categories",
            localField: "category",
            foreignField: "_id",
            as: "category",
          },
        },

        {$match: filter},
        {$group:{_id:null,count:{$sum:1}}}
      ])

      const totalpages = Math.ceil(productscount[0].count / ITEMS_PER_PAGE);   } 
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


// Add product to wishlist 
  getWishlistAdd: async (req, res, next) => {
    try {
      const id = req.query.id;
      const user=req.session.user
      const data = await users.findByIdAndUpdate(
        { _id: user._id },
        { $push: { wishlist: id } },
        { new: true } 
      );
      res.redirect(`/productlist/productdetail?id=${id}`);
    } catch (error) {
      next(error);
    }
  },

  // To remove products from wishlist 
  getWishlistRemove: async (req, res, next) => {
    try {
      const id = req.query.id;
      const user=req.session.user
      await users.updateOne(
        { _id: user._id },
        { $pull: { wishlist: id } }
      );
      res.redirect(`/productlist/productdetail?id=${id}`);
    } catch (error) {
      next(error);
    }
  },


  // To remove products from wishlist 
  getWishlistDelete: async (req, res, next) => {
    try {
      const id = req.query.id;
      const user=req.session.user
      await users.updateOne(
        { _id: user._id },
        { $pull: { wishlist: id } }
      );
      res.redirect("/wishlist");
    } catch (error) {
      next(error);
    }
  },


  // To access wishlist page from user side
  getWishlist: async (req, res, next) => {
    let user = req.session.user;
    try {
      data= await users.findOne({_id:user._id}).populate("wishlist")
      res.render("user/wishlist", { data ,user});
    } catch (error) {
      next(error);
    }
  },
};

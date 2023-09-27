const cat = require("../model/category");
const ITEMS_PER_PAGE = 6;
module.exports = {
  // To access category page in admin side
  getCategories: async (req, res,next) => {
    try {
    const page = req.query.page || 1;
    const categorycount = await cat.countDocuments({});
    const totalpages = Math.ceil(categorycount / ITEMS_PER_PAGE);
    let category = await cat.find({}).skip(ITEMS_PER_PAGE * (page - 1))
    .limit(ITEMS_PER_PAGE);
      res.render("admin/categories", { category,page,totalpages });
    } catch (err) {
      next(err)
    }
  },


  // To access category add page
  getAddCategory: (req, res,next) => {
    try {
      res.render("admin/categories-add");
    } catch (error) {
      next(error)
    }
  },


  // To add new category to database
  postAddCategory: async (req, res,next) => {
    try {    
      const data=JSON.parse(req.body.productData);
      data.images = req.file ? req.file.filename : undefined;
      await cat.create(data)
      res.status(200).json({ success: true });
    } catch (err) {
      next(err)
    
    }
  },

  // To change status of the category
  listCategory: async (req, res, next) => {
    const id = req.query.id;
    try {
      const data = await cat.findById(id);
      if (data.status == "List") {
        data.status = "UnList";
      } else {
        data.status = "List";
      }
      await data.save();
      res.redirect("/admin/category")
    } catch (err) {
      next(err)
    }
  },


  // To access category edit page
  getEditCategory: async (req, res,next) => {
    let id = req.query.id;
    try {
      const data = await cat.findById(id);
      res.render("admin/categories-edit", { data });
    } catch (err) {
       next(err)
    }
  },

// Edited category details o database
  postEditCategory: async (req,res,next) => {
    try {
      const data=JSON.parse(req.body.productData);
      const category = await cat.findById(data.id);
      category.catname = data.catname;
      category.range = data.range;
      if (req.file) {
        category.images = req.file.filename;
      }
      await category.save();
      res.status(200).json({ success: true });
    } catch (err) {
      next(err)
    }
  },
};

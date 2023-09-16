const cat = require("../model/category");
const ITEMS_PER_PAGE = 6;
module.exports = {
  getCategories: async (req, res) => {
    const page = req.query.page || 1;
    const categorycount = await cat.countDocuments({});
    const totalpages = Math.ceil(categorycount / ITEMS_PER_PAGE);
    let category = await cat.find({}).skip(ITEMS_PER_PAGE * (page - 1))
    .limit(ITEMS_PER_PAGE);
    try {
      res.render("admin/categories", { category,page,totalpages });
    } catch (err) {
      console.log(err);
    }
  },
  getAddCategory: (req, res) => {
    res.render("admin/categories-add");
  },

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
  getEditCategory: async (req, res) => {
    let id = req.query.id;
    try {
      const data = await cat.findById(id);

      res.render("admin/categories-edit", { data });
    } catch (err) {
      console.log(err);
    }
  },

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

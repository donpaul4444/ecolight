const banner=require("../model/banner")
const ITEMS_PER_PAGE = 6;
module.exports={
    getBanner:async(req,res,next)=>{
        const page = req.query.page || 1;
        const bannercount = await banner.countDocuments({});
        const totalpages = Math.ceil(bannercount / ITEMS_PER_PAGE);
        let banners = await banner.find({}).skip(ITEMS_PER_PAGE * (page - 1))
        .limit(ITEMS_PER_PAGE);
        try {
          res.render("admin/banner", { banners,page,totalpages });
        } catch (err) {
          next(err)
        }
      },
      getAddBanner: (req, res) => {
        res.render("admin/banner-add");
      },
      postAddBanner: async (req, res,next) => {
        try {        
          const data=JSON.parse(req.body.productData);
          data.image = req.file ? req.file.filename : undefined;
    
          await banner.create(data)
          res.status(200).json({ success: true });
        } catch (err) {
          next(err)
        
        }
      },

      listBanner: async (req, res, next) => {
        const id = req.query.id;
        try {
          const data = await banner.findById(id);
          if (data.status == "List") {
            data.status = "UnList";
          } else {
            data.status = "List";
          }
          await data.save();
          res.redirect("/admin/banner")
        } catch (err) {
          next(err)
        }
      },
      getEditBanner: async (req, res) => {
        let id = req.query.id;
        try {
          const data = await banner.findById(id);
    
          res.render("admin/banner-edit", { data });
        } catch (err) {
          console.log(err);
        }
      },
      postEditBanner: async (req,res,next) => {
        try {
          const data=JSON.parse(req.body.productData);
          const banners = await banner.findById(data.id);
          banners.title = data.title;
          banners.url = data.url;
          if (req.file) {
            banners.image = req.file.filename;
          }
          await banners.save();
          res.status(200).json({ success: true });
        } catch (err) {
          next(err)
        }
      },
    

}
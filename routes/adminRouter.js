const express= require("express")
let router=express.Router()
const upload= require("../config/multer")
const categoryController= require("../controller/categoryController")
const productController=require("../controller/productController")
const userController=require("../controller/userController")
const session=require("../middleware/auth")
const passing=require("../middleware/cache")
const products = require("../model/products")

router.get("/admin/category",session.authadmin,categoryController.getCategories)
router.get("/admin/category/add",session.authadmin,categoryController.getAddCategory)
router.post("/admin/catpost",upload.single('image'),session.authadmin,categoryController.postAddCategory)
router.get("/admin/cat/list",session.authadmin,categoryController.listCategory)
router.get("/admin/category/editcat",session.authadmin,categoryController.getEditCategory)
router.post("/admin/cat/edit",session.authadmin,upload.single('image'),categoryController.postEditCategory)

router.get("/admin",passing.cache,userController.getAdminLogin)
router.post("/admin/login",userController.postAdminLogin)
router.get("/admin/logout",userController.getAdminLogout)
router.get("/admin/dashboard",session.authadmin,userController.getAdminDashboard)

router.get("/admin/customers",session.authadmin,userController.getCustomers)
router.get("/admin/customer/edit",session.authadmin,userController.getEditCustomer)

router.get("/admin/products",productController.getProducts)
router.get("/admin/addproduct",productController.addProduct)
router.post("/admin/addproduct",upload.array('image',5),productController.postAddProduct)
router.get("/admin/product/list",productController.listProduct)
router.get("/admin/product/edit",productController.getEditProduct)
router.post("/admin/product/edit",upload.array('image',5),productController.postEditProduct)
router.delete("/admin/product/deleteimage",productController.deleteImage)


module.exports=router
const express= require("express")
let router=express.Router()
const upload= require("../config/multer")
const categoryController= require("../controller/categoryController")
const productController=require("../controller/productController")
const userController=require("../controller/userController")
const orderController=require("../controller/orderController")
const session=require("../middleware/auth")
const passing=require("../middleware/cache")


router.get("/admin/category",passing.cache,session.authadmin,categoryController.getCategories)
router.get("/admin/category/add",passing.cache,session.authadmin,categoryController.getAddCategory)
router.post("/admin/catpost",upload.single('image'),passing.cache,session.authadmin,categoryController.postAddCategory)
router.get("/admin/cat/list",passing.cache,session.authadmin,categoryController.listCategory)
router.get("/admin/category/editcat",passing.cache,session.authadmin,categoryController.getEditCategory)
router.post("/admin/cat/edit",passing.cache,session.authadmin,upload.single('image'),categoryController.postEditCategory)

router.get("/admin",passing.cache,userController.getAdminLogin)
router.post("/admin/login",passing.cache,userController.postAdminLogin)
router.get("/admin/logout",passing.cache,session.authadmin,userController.getAdminLogout)
router.get("/admin/dashboard",passing.cache,session.authadmin,userController.getAdminDashboard)

router.get("/admin/customers",passing.cache,session.authadmin,userController.getCustomers)
router.get("/admin/customer/edit",passing.cache,session.authadmin,userController.getEditCustomer)

router.get("/admin/products",passing.cache,session.authadmin,productController.getProducts)
router.get("/admin/addproduct",passing.cache,session.authadmin,productController.addProduct)
router.post("/admin/addproduct",passing.cache,upload.array('image',5),session.authadmin,productController.postAddProduct)
router.get("/admin/product/list",passing.cache,session.authadmin,productController.listProduct)
router.get("/admin/product/edit",passing.cache,session.authadmin,productController.getEditProduct)
router.post("/admin/product/edit",passing.cache,upload.array('image',5),session.authadmin,productController.postEditProduct)
router.delete("/admin/product/deleteimage",passing.cache,session.authadmin,productController.deleteImage)

router.get("/admin/orders",passing.cache,session.authadmin,orderController.getAdminOrders)
router.get("/admin/orders/orderdetail",passing.cache,session.authadmin,orderController.getAdminOrderDetail)
router.get("/admin/updateOrderStatus",passing.cache,session.authadmin,orderController.postUpdateOrderStatus)



module.exports=router
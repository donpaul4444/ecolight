const express= require("express")
let router=express.Router()
const userController=require("../controller/userController")
const productController=require("../controller/productController")
const cartController=require("../controller/cartController")
const orderController=require("../controller/orderController")
const session= require("../middleware/auth")
const passing=require("../middleware/cache")

router.get("/",passing.cache,userController.getHome)
router.get("/login",passing.cache,userController.getLogin)
router.post("/login",passing.cache,userController.postLogin)
router.get("/logout",passing.cache,userController.getLogout)
router.get("/signup",passing.cache,userController.getSignup)
router.post("/signup",passing.cache,userController.postSignup)
router.post("/sendOTP",passing.cache,userController.postOtp)
router.get("/checkuser",passing.cache,userController.getCheckUser)


router.get("/userprofile",passing.cache,session.authuser,userController.getUserProfile)
router.get("/address/manage",passing.cache,session.authuser,userController.getManageAddress)
router.get("/address/add",passing.cache,session.authuser,userController.getAddAddress)
router.post("/address/add",passing.cache,session.authuser,userController.postAddAddress)
router.get("/address/delete",passing.cache,session.authuser,userController.getDeleteAddress)
router.get("/checkout",passing.cache,session.authuser,userController.getCheckout)

router.get("/ordercomplete",passing.cache,session.authuser,orderController.getOrderComplete)
router.get("/user/orders",passing.cache,session.authuser,orderController.getOrders)
router.get("/user/orderlist",passing.cache,session.authuser,orderController.getOrderList)


router.get("/product/:type",passing.cache,productController. getProductListNew)
router.get("/productlist/productdetail",session.authuser,passing.cache,productController.getProductDetail)

router.get("/cart",passing.cache,session.authuser,cartController.getCart)
router.get("/addcart",passing.cache,session.authuser,cartController.getAddCart)
router.get("/cartdelete",passing.cache,session.authuser,cartController.deleteCart)
router.get("/cart/changequantity",passing.cache,session.authuser,cartController.getQuantityChange)

router.get("/orders",passing.cache,session.authuser,userController.getUserProfile)






module.exports=router
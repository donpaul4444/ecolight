const express= require("express")
let router=express.Router()
const userController=require("../controller/userController")
const productController=require("../controller/productController")
const cartController=require("../controller/cartController")
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

router.get("/product/:type",session.authuser,passing.cache,productController.getProductList)
router.get("/productlist/productdetail",session.authuser,passing.cache,productController.getProductDetail)

router.get("/cart",passing.cache,session.authuser,cartController.getCart)
router.get("/addcart",passing.cache,session.authuser,cartController.getAddCart)
router.get("/cartdelete",passing.cache,session.authuser,cartController.deleteCart)
router.get("/cart/changequantity",passing.cache,session.authuser,cartController.getQuantityChange)




module.exports=router
const express= require("express")
let router=express.Router()
const userController=require("../controller/userController")
const productController=require("../controller/productController")
const cartController=require("../controller/cartController")
const orderController=require("../controller/orderController")
const walletController=require("../controller/walletController")
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
router.get("/orders",passing.cache,session.authuser,userController.getUserProfile)

router.get("/ordercomplete",passing.cache,session.authuser,orderController.getOrderComplete)
router.get("/user/orders",passing.cache,session.authuser,orderController.getOrders)
router.get("/user/orderlist",passing.cache,session.authuser,orderController.getOrderList)
router.post("/razorpay",passing.cache,session.authuser,orderController.postRazorpay)
router.get("/ordercomplete/page",passing.cache,session.authuser,orderController.getOrderCompletePage)
router.get("/invoice",passing.cache,session.authuser,orderController.getInvoice)


router.get("/product",passing.cache,productController. getProductListNew)
router.get("/productlist/productdetail",session.authuser,passing.cache,productController.getProductDetail)
router.get("/wishlist",passing.cache,productController. getWishlist)
router.get("/wishlist/add",passing.cache,productController. getWishlistAdd)
router.get("/wishlist/remove",passing.cache,productController. getWishlistRemove)
router.get("/wishlist/delete",passing.cache,productController. getWishlistDelete)


router.get("/cart",passing.cache,session.authuser,cartController.getCart)
router.get("/addcart",passing.cache,session.authuser,cartController.getAddCart)
router.get("/cartdelete",passing.cache,session.authuser,cartController.deleteCart)
router.get("/cart/changequantity",passing.cache,session.authuser,cartController.getQuantityChange)

router.get("/wallet",passing.cache,session.authuser,walletController.getWallet)
router.get("/addwallet",passing.cache,session.authuser,walletController.getAddWallet)
router.get("/cancelorder",passing.cache,session.authuser,walletController.getCancelOrder)








module.exports=router
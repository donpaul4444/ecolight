const Cart = require("../model/cart");
const cat = require("../model/category");
const Product = require("../model/products");
const coupon= require("../model/coupons")

module.exports = {
  // To access cart page in user side
  getCart: async (req, res, next) => {
    let id = req.session.user._id;
    let stockstatus = req.query.stockstatus === "true" ? true : false;
    try {
      let categories = await cat.find({ status: "List" });
      let cartDetails = await Cart.findOne({ user: id }).populate("items.productId")
      let coupons= await coupon.find({status:"List"})
        res.render("user/cart", { cartDetails, categories,coupons,stockstatus });
    } catch (error) {
      next(error);
    }
  },


// To adding new items to cart
  getAddCart: async (req, res, next) => {
    try {
      const userId = req.session.user._id;
      const { productId, quantity } = req.query;

      const cartItem = {
        productId: productId,
        quantity: parseInt(quantity),
      }; 
      let userCart = await Cart.findOne({ user: userId });
      if (!userCart) {
        userCart = new Cart({
          user: userId,
          items: [cartItem],
        });
      } else {
 
        const existingCartItem = userCart.items.find(
          (item) => item.productId.toString() === productId
        );
        if (existingCartItem) {
          existingCartItem.quantity += parseInt(quantity);
        } else {
          userCart.items.push(cartItem);
        }
      }
      await userCart.save();
      res.redirect("/cart");
    } catch (error) {
      next(error);
    }
  },


  // To delete the corresponding cart item
  deleteCart: async (req, res,next) => {
    let id = req.session.user._id;
    let itemId = req.query.itemId;
    try {
        await Cart.findOneAndUpdate({user:id},{$pull:{items:{_id:itemId}}})
      res.redirect("/cart")
    } catch (error) {
      next(error)
    }
  },
  

  // To change the quantity of items in the cart
  getQuantityChange: async(req,res,next)=>{
    let id = req.session.user._id;
    let itemId = req.query.id;
    let quantity=req.query.quantity
    try {
        await Cart.findOneAndUpdate( { user: id, "items._id": itemId }, { $set: {"items.$.quantity": quantity } } );
        res.status(200).json({ success: true});    
    } catch (error) {
      next(error)
    }
  },
  
};

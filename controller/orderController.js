const order = require("../model/order");
const users = require("../model/users");
const Cart = require("../model/cart");
module.exports = {
  getOrderComplete: async (req, res, next) => {
    console.log(req.query);
    let user = req.session.user;
    let addressId = req.query.selectedAddress;
    let paymentmethod = req.query.selectedPaymentMethod;
    let items=[]
    let totalprice = 0;
   
    
    try {
        const userid= await users.findById(user._id)
         const address = userid.address.id(addressId)
       
          const userCart = await Cart.findOne({ user: user._id }).populate(
            "items.productId"
          );
          
          if (userCart) {
            userCart.items.forEach((item) => {
              const price = item.productId.price * item.quantity;
              totalprice += price;
            });
          }
      
          if (userCart) {
            userCart.items.forEach((item) => {
              const newAddress = {
                productId: item.productId._id,
                quantity: item.quantity,
                price: item.productId.price,
          
              };
            items.push(newAddress)
            });
          }
      
      const newOrder = new order({
        user: user._id,
        paymentmethod: paymentmethod,
        totalprice: totalprice,
        address: address,
        items
      });

      const savedOrder = await newOrder.save();

      res.render("user/ordercomplete");
    } catch (error) {
      next(error);
    }
  },

  getOrders: async(req,res,next)=>{
    try {
      let user=req.session.user
      const orderlist= await order.find({user:user._id}).populate(
        "items.productId")
        res.render("user/orders",{user,orderlist})
    } catch (error) {
        next(error)
    }
  },

  getOrderList: async(req,res,next)=>{
    try {
    let user=req.session.user
    const id= req.query.id
    const orders= await order.findById({_id:id}).populate(
      "items.productId")
    res.render("user/orderlist",{order:orders,user})
      
    } catch (error) {
      next(error)
    }
  },

  getAdminOrders: async(req,res,next)=>{
    try {
      let orders=await order.find({})
      res.render("admin/orders",{orders})

    } catch (error) {
      next(error)
    }
  }
};

const wallet= require("../model/wallet")
const order = require("../model/order");
module.exports={
    getWallet:async(req,res,next)=>{
        const user=req.session.user
        const userwallet= await wallet.findOne({user})
       let totalcredit=0
       let totaldebit=0
        userwallet.items.forEach((item)=>{
          totalcredit += item.credit
          totaldebit += item.debit
        })
        const total=totalcredit-totaldebit
        userwallet.total=total

        await userwallet.save()
        try {
            res.render("user/wallet",{user,userwallet})
        } catch (error) {
            next (error)
        }
    },
    getAddWallet:async(req,res,next)=>{
        try {
        const user= req.session.user
        const orderid=req.query.orderid
        const itemid= req.query.itemid
        const items=[]
        const orderItem= await order.findOne({_id:orderid})
        const finalprice = orderItem.items.find((item) => item._id.toString() === itemid).finalprice;
        await order.findOneAndUpdate(
            {
              _id: orderid,
              "items._id": itemid 
            },
            {
              $set: {
                "items.$.status": "Returned" 
              }
            },
            { new: true }
          );

       const userwallet= await wallet.findOne({user})
       if(userwallet){
        const temp={
            title: `Refund for Order id:${orderid}`  ,
            credit: finalprice,
            orderId: orderid  ,
        }
        userwallet.items.push(temp)
        await userwallet.save()
      }else{
        const temp={
          title: `Refund for Order id:${orderid}`  ,
          credit: finalprice,
          orderId: orderid  ,
      }
      items.push(temp)
      const wallets={
        user,
        items
      }
      await wallet.create(wallets)
      }
      let totalcredit=0
      let totaldebit=0
       userwallet.items.forEach((item)=>{
         totalcredit += item.credit
         totaldebit += item.debit
       })
       const total=totalcredit-totaldebit
       userwallet.total=total
       await userwallet.save()
        res.redirect(`/user/orderlist?orderid=${orderid}&itemid=${itemid}`)
        } catch (error) {
            next(error)
        }
    }
    
}
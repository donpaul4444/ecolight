require('dotenv').config();
const express= require('express')
const mongoose= require('mongoose')
const app=express()
const path=require("path")
const logger = require("morgan");
const cookieParser=require("cookie-parser")
const session = require('express-session')
const db=require("./config/db")
const errorHandler=require("./middleware/errorhandler")


const userRouter=require("./routes/userRouter")
const adminRouter=require("./routes/adminRouter")
db.connect()

app.use(
  session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
  })
);
app.set("views",path.join(__dirname,"views"))
app.set("view engine","ejs")
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use("/", userRouter);
app.use("/", adminRouter);
// app.use(function (req, res, next) {
//     next(createError(404));
//   });

app.use(errorHandler)
  

app.listen(3000,()=>{
    console.log("server connected");

})

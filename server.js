const express = require("express");
const cookieParser = require("cookie-parser");
const session = require("express-session")
const app = express()

app.use(session({secret:"!@(HBC+!"}));


app.get("/test",(req,res)=>{
    res.send("test working")
})


// app.use(cookieParser("hardcore"))



// app.get('/signcookie',(req,res)=>{
//     res.cookie("made ","IND",{signed:true})
//     res.send("done boss")
// });

// app.get("/verify",(req,res)=>{
//     let {made = " "} = req.signedCookies;
//     res.send(made)
// })

// app.get("/setcookie",(req,res)=>{
//     res.cookie("name","harsh");
//     res.send("done setting")
// })

// app.get("/getcookie",(req,res)=>{
//     let {name = 'Not'} = req.cookies;

//     res.send(`Hello ${name}`);
// })


app.get("/",(req,res)=>{

    res.send("ROOT")

})

app.listen(3000,()=>{
    console.log("server started")
})


const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session")
const passport = require("passport")
const localStrat = require("passport-local")
const User = require("./models/user.js")

const {isLogin} = require("./routs/middleware.js")


const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}




app.use(session({
  secret:"!#hardcoded",
  resave:false,
  saveUninitialized:true,
  cookie:{
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  }
}))



app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrat(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
  res.locals.currentUser = req.user;
  next();
})




app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname,"/public")));
app.engine('ejs',ejsMate)

app.get("/", (req, res) => {
  res.send("Hi, I am root");
});

//Index Route
app.get("/listings", async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
});

//New Route
app.get("/listings/new", isLogin ,(req, res) => {

  res.render("listings/new.ejs");
});

//Show Route
app.get("/listings/:id",isLogin, async (req, res) => {
  let { id } = req.params;
  let currentUser = res.locals.currentUser;
  const listing = await Listing.findById(id);
  res.render("listings/show.ejs", { listing , currentUser });
});

//Create Route
app.post("/listings", async (req, res) => {
  const newListing = new Listing(req.body.listing);
  console.log(req.user)
  newListing.owner = req.user._id;
  await newListing.save();
  res.redirect("/listings");
});

//Edit Route
app.get("/listings/:id/edit", isLogin,async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  res.render("listings/edit.ejs", { listing });
});

//Update Route
app.put("/listings/:id", isLogin,async (req, res) => {
  let { id } = req.params;
  await Listing.findByIdAndUpdate(id, { ...req.body.listing });
  res.redirect(`/listings/${id}`);
});

//Delete Route
app.delete("/listings/:id",isLogin ,async (req, res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  console.log(deletedListing);
  res.redirect("/listings");
});


//Sign UP

app.get("/signup",(req,res)=>{
  res.render("user/signup.ejs")
})
app.post("/signup",async (req,res)=>{
  let {email , username , password} = req.body;
  const newUser = new User({email,username})
  const regUser = await User.register(newUser,password);
  req.login(regUser,(err)=>{
    if(err){
      next(err);
    }
    res.redirect('/listings')
  })
})


//log in
app.get("/login",(req,res)=>{
  res.render('user/login.ejs')
})

app.post("/login",
  passport.authenticate('local',{failureRedirect:'/login',failureFlash:true}),
  (req,res)=>{

    res.redirect('/listings')

})

//logout

app.get("/logout",(req,res,next)=>{
  req.logout((err)=>{
    if(err){
      next(err);
    }
    res.redirect('/login')
  })
})



app.listen(8080, () => {
  console.log("server is listening to port 8080");
});

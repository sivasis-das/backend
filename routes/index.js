var express = require("express");
var router = express.Router();
const userModel = require("./users");
const localStrategy = require("passport-local");
const passport = require("passport");

passport.use(new localStrategy(userModel.authenticate()));

/* GET home page. */
router.get("/", function (req, res) {
  res.render("index");
});

// how flash package works, its like an global variable which can be used to get data in any routes. usefull in knowing whether the user is signed in or not.
router.get("/failed", (req, res) => {
  req.flash("name", "jimy");
  res.send("done");
});

router.get("/checkflash", (req, res) => {
  const value = req.flash("name");
  console.log(value);
  res.send("check backend terminal");
});

router.get("/create", async (req, res) => {
  let userdata = await userModel.create({
    username: "jimydas@12",
    nickname: "jimydas",
    description: "i am of lord krisha and am a software developer",
    categories: ["food", "games", "bikes"],
  });
  res.send(userdata);
});

router.get("/find", async (req, res) => {
  // case-insensitive search -----------
  let regex = new RegExp("^Jimy$", "i");
  let user = await userModel.find({ nickname: regex });
  res.send(user);
});

router.get("/find", async (req, res) => {
  let user = await userModel.find({ categories: { $all: ["fashion"] } });
  res.send(user);
});

router.get("/find", async (req, res) => {
  let date1 = new Date("2023-10-02");
  let date2 = new Date("2023-10-03");
  let user = await userModel.find({
    datecreated: { $gte: date1, $lte: date2 },
  });
  res.send(user);
});

router.get("/profile",isLoggedIn,(req, res)=>{
  res.render("profile")
})

// for registering user-------------------
router.post("/register", (req, res) => {
  let userdata = new userModel({
    username: req.body.username,
    secret: req.body.secret,
  });

  userModel
    .register(userdata, req.body.password)
    .then(function (registereduser) {
      passport.authenticate("local")(req, res, () => {
        res.redirect("/profile");
      });
    });
});

// for log in------------------------------
router.post("/login", passport.authenticate("local", {
  successRedirect: "/profile",
  failureRedirect: "/" 
}), (req,res)=>{})


// for logout------------------------------
router.get("/logout", (req,res, next)=>{
  req.logout(err=>{
    if (err) {
      return next(err);
    }
    res.redirect("/");
  })
})

// isLoggedIn Middleware - ---------------------
// use it fro protected routes  
// ex---  router.get("/profile", isLoggedIn, (req,res)=>{
// res.send("/profile")
// })
function isLoggedIn(req, res, next){
  if(req.isAuthenticated()){
    return next();
  }
  res.redirect("/")
}

module.exports = router;

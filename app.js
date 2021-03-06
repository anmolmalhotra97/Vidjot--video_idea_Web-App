const express = require("express");
const path = require("path");
const exphbs = require("express-handlebars");
const methodOverride = require("method-override");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const flash = require("connect-flash");
const session = require("express-session");
const passport = require("passport");
const app = express();

//load routes
const ideas = require("./routes/ideas");
const users = require("./routes/users");

//Passport config
require("./config/passport")(passport);

///Map global promise - get rid of the warning
mongoose.Promise = global.Promise;
//DB config
const db = require("./config/database");

//connect to mongoose
mongoose
  .connect(
    db.mongoURI,
    { useNewUrlParser: true }
  )
  .then(() => console.log("MongoDB connected ...."))
  .catch(err => console.log(err));

// Handlebars Middleware
app.engine(
  "handlebars",
  exphbs({
    defaultLayout: "main"
  })
);
app.set("view engine", "handlebars");

// Body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//static folder
app.use(express.static(path.join(__dirname, "public")));

// Method override middleware
app.use(methodOverride("_method"));

app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true
  })
);

//Passport middleware
app.use(passport.initialize());
app.use(passport.session());

app.use(flash());
//global variables
app.use(function(req, res, next) {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  res.locals.user = req.user || null;
  next();
});

// Index Route
app.get("/", (req, res) => {
  console.log("GET --> " + req.url);
  const title = "Welcome";
  res.render("index", {
    title: title
  });
});

// About Route
app.get("/about", (req, res) => {
  console.log("GET --> " + req.url);

  res.render("about");
});

//Use routes
app.use("/ideas", ideas);
app.use("/users", users);

//setting port according to HEROKU
const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});

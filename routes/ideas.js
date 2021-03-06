const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const { ensureAuthenticated } = require("../helpers/auth");
// Load Idea Model
require("../models/Idea");
const Idea = mongoose.model("ideas");

// Idea Index Page
router.get("/", ensureAuthenticated, (req, res) => {
  console.log("GET --> " + req.url);

  Idea.find({ user: req.user.id })
    .sort({ date: "desc" })
    .then(ideas => {
      res.render("ideas/index", {
        ideas: ideas
      });
    });
});

// Add Idea Form
router.get("/add", ensureAuthenticated, (req, res) => {
  console.log("GET --> " + req.url);

  res.render("ideas/add");
});

// Edit Idea Form
router.get("/edit/:id", ensureAuthenticated, (req, res) => {
  console.log("GET --> " + req.url);

  Idea.findOne({
    _id: req.params.id
  }).then(idea => {
    if (idea.user != req.user.id) {
      req.flash("error_msg", "Not Authorized");
      res.redirect("/ideas");
    } else {
      res.render("ideas/edit", {
        idea: idea
      });
    }
  });
});

// Process Form
router.post("/", ensureAuthenticated, (req, res) => {
  console.log("POST --> " + req.url);

  let errors = [];

  if (!req.body.title) {
    errors.push({ text: "Please add a title" });
  }
  if (!req.body.details) {
    errors.push({ text: "Please add some details" });
  }

  if (errors.length > 0) {
    res.render("ideas/add", {
      errors: errors,
      title: req.body.title,
      details: req.body.details
    });
  } else {
    const newUser = {
      title: req.body.title,
      details: req.body.details,
      user: req.user.id
    };
    new Idea(newUser).save().then(idea => {
      req.flash("success_msg", "Your idea has been successfully Added");
      res.redirect("/ideas");
    });
  }
});

// Edit Form process
router.put("/:id", ensureAuthenticated, (req, res) => {
  console.log("PUT --> " + req.url);

  Idea.findOne({
    _id: req.params.id
  }).then(idea => {
    // new values
    idea.title = req.body.title;
    idea.details = req.body.details;
    user: req.user.id;

    idea.save().then(idea => {
      req.flash("success_msg", "Your idea has been successfully Edited");
      res.redirect("/ideas");
    });
  });
});

//Delete idea
router.delete("/:id", ensureAuthenticated, (req, res) => {
  console.log("DELETE --> " + req.url);

  Idea.deleteOne({
    _id: req.params.id
  }).then(() => {
    req.flash("success_msg", "Your idea has been successfully Deleted");
    res.redirect("/ideas");
  });
});

module.exports = router;

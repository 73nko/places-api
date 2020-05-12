const express = require("express");
const router = express.Router();
const RateLimit = require("express-rate-limit");
const mongoose = require("mongoose");
const stringCapitalizeName = require("string-capitalize-name");

const Place = require("../models/places");

// Attempt to limit spam post requests for inserting data
const minutes = 5;
const postLimiter = new RateLimit({
  windowMs: minutes * 60 * 1000, // milliseconds
  max: 100, // Limit each IP to 100 requests per windowMs
  delayMs: 0, // Disable delaying - full speed until the max limit is reached
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      msg: `You made too many requests. Please try again after ${minutes} minutes.`,
    });
  },
});

const errorHandle = (err, res) => {
  if (err.errors) {
    if (err.errors.name) {
      res.status(400).json({ success: false, msg: err.errors.name.message });
      return;
    }
    if (err.errors.location) {
      res
        .status(400)
        .json({ success: false, msg: err.errors.location.message });
      return;
    }
    // Show failed if all else fails for some reasons
    res
      .status(500)
      .json({ success: false, msg: `Something went wrong. ${err}` });
  }
};

// READ (ONE)
router.get("/:id", (req, res) => {
  Place.findById(req.params.id)
    .then((result) => {
      res.json(result);
    })
    .catch((err) => {
      res.status(404).json({ success: false, msg: `No such user.` });
    });
});

// READ (ALL)
router.get("/", (req, res) => {
  Place.find({})
    .then((result) => {
      res.json(result);
    })
    .catch((err) => {
      res
        .status(500)
        .json({ success: false, msg: `Something went wrong. ${err}` });
    });
});

// CREATE
router.post("/", postLimiter, (req, res) => {
  let newPlace = new Place({
    name: sanitizeName(req.body.name),
    location: req.body.location,
  });

  newPlace
    .save()
    .then((result) => {
      res.json({
        success: true,
        msg: `Successfully added!`,
        result: {
          _id: result._id,
          name: result.name,
          location: result.location,
        },
      });
    })
    .catch((err) => errorHandle(err, res));
});

// UPDATE
router.put("/:id", (req, res) => {
  let updatedPlace = {
    name: sanitizeName(req.body.name),
    location: req.body.location,
  };

  Place.findOneAndUpdate({ _id: req.params.id }, updatedPlace, {
    runValidators: true,
    context: "query",
  })
    .then((oldResult) => {
      Place.findOne({ _id: req.params.id })
        .then((newResult) => {
          res.json({
            success: true,
            msg: `Successfully updated!`,
            result: {
              _id: newResult._id,
              name: newResult.name,
              location: result.location,
            },
          });
        })
        .catch((err) => {
          res
            .status(500)
            .json({ success: false, msg: `Something went wrong. ${err}` });
          return;
        });
    })
    .catch((err) => errorHandle(err, res));
});
// DELETE
router.delete("/:id", (req, res) => {
  Place.findByIdAndRemove(req.params.id)
    .then((result) => {
      res.json({
        success: true,
        msg: `It has been deleted.`,
        result: {
          _id: newResult._id,
          name: newResult.name,
          location: result.location,
        },
      });
    })
    .catch((err) => {
      res.status(404).json({ success: false, msg: "Nothing to delete." });
    });
});

module.exports = router;

// Minor sanitizing to be invoked before reaching the database
sanitizeName = (name) => {
  return stringCapitalizeName(name);
};

const mongoose = require("mongoose");
const unique = require("mongoose-unique-validator");
const validate = require("mongoose-validator");

const nameValidator = [
  validate({
    validator: "isLength",
    arguments: [0, 40],
    message: "Name must not exceed {ARGS[1]} characters.",
  }),
];

const pointSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["Point"],
    required: true,
  },
  coordinates: {
    type: [Number],
    required: true,
  },
});

const PlaceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required."],
    validate: nameValidator,
  },
  location: {
    type: pointSchema,
    required: true,
  },
});

// Use the unique validator plugin
PlaceSchema.plugin(unique, { message: "That {PATH} is already taken." });

const Place = (module.exports = mongoose.model("place", PlaceSchema));

const mongoose = require("mongoose");

// Point Schema
const PointSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["Point"],
    required: true,
  },
  coordinates: {
    type: [Number], // [longitude, latitude]
    required: true,
  },
});

// Polygon Schema
const PolygonSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["Polygon"],
    required: true,
  },
  coordinates: {
    type: [[[Number]]], // Array of arrays of arrays of numbers for the polygon coordinates
    required: true,
  },
});

PointSchema.add({
  angle: {
    type: Number,
    min: 0,
    max: 359,
    validate: {
      validator: Number.isInteger,
      message: "{VALUE} is not an integer value",
    },
  },
});

module.exports = { PointSchema, PolygonSchema };

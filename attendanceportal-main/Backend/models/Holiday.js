const mongoose = require("mongoose");

const holidaySchema = new mongoose.Schema({
  name: String,
  date: String, // format: YYYY-MM-DD
  type: { type: String, enum: ["public", "company"] },
});

module.exports = mongoose.model("Holiday", holidaySchema);

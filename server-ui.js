// frontend server-ui.js
require("dotenv").config();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const express = require("express");
const app = express();
const fs = require("fs").promises;
const path = require("path");
const heroUIDBpath = path.join(__dirname, "data", "ui-heroes.json");
const heroDBpath = path.join(__dirname, "data", "superHeroes.json");
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");
const PORT = 4000;

// ----- DATA ROUTES ---- //
// ---- GET ----//
app.get("/", (req, res) => {
  res.redirect("/heroes");
});
app.get("/heroes", authenticateToken, async (req, res) => {
  try {
    const data = await fs.readFile(heroUIDBpath, "utf-8");
    const heroes = JSON.parse(data);
    res.render("heroList", { heroes }); // Note: no .ejs extension needed
  } catch (error) {
    console.error("Error in /heroes route:", error);
    // If file doesn't exist, create it with empty array
    if (error.code === "ENOENT") {
      await fs.writeFile(heroUIDBpath, "[]", "utf-8");
      res.render("heroList", { heroes: [] });
    } else {
      res.status(500).send(`Error: ${error.message}`);
    }
  }
});
app.get("/heroes/form", async (req, res) => {
  try {
    res.render("heroForm.ejs");
  } catch (error) {
    console.error("error reading console", error);
    res.status(500).json({ success: false, error: error.message });
  }
});
app.post("/heroes", (req, res) => {});
app.listen(PORT, () => {
  console.log(`App is serving UI listening on ${PORT}`);
});

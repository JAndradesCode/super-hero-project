// server.js
require("dotenv").config();
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const express = require("express");
const app = express();
const fs = require("fs").promises;
const path = require("path");
const heroUIDBpath = path.join(__dirname, "data", "ui-heroes.json");
const heroDBpath = path.join(__dirname, "data", "db-heroes.json");
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");
const PORT = 4000;

app.get("/", (req, res) => {
  const heroFields = require("./config/heroInputs.config.js");
  res.render("heroForm", { input: heroFields });
});

// ----- read/write file functions ------- //
async function readHeroes() {
  try {
    const data = await fs.readFile(heroDBpath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    return []; // return empty array
  }
}
async function writeHeroes(heroes) {
  try {
    await fs.writeFile(heroDBpath, JSON.stringify(heroes, null, 2));
  } catch (error) {
    console.error("problem writing to file", error);
  }
}
async function initializeDatabase() {
  try {
    await fs.access(heroDBpath);
  } catch (error) {
    await writeHeroes([]);
  }
}
initializeDatabase();
// ----- TOKEN FUNCTIONS ----- //
function authenticateToken(req, res, next) {
  const token = req.cookies.token;
  if (!token) {
    return res.redirect("/admin/login");
  }
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      res.clearCookie("token");
      return res.redirect("/admin/login");
    }
    req.user = user;
    next();
  });
}
// --- TOKEN routes ---- //
// ----- admin routes ----- //
app.get("/admin/login", (req, res) => {
  res.render("adminLogin");
});
app.post("/admin/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    // create JTW
    const token = jwt.sign(
      {
        username: username,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "24h",
      }
    );
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });
    res.redirect("/");
  } catch (error) {
    console.error("error");
  }
});
// ----- DATA ROUTES ---- //
// ---- GET ----//
app.get("/heroes", authenticateToken, async (req, res) => {
  try {
    const heroes = await readHeroes();
    console.log(heroes);
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
  // try {
  //   res.render("heroForm.ejs");
  // } catch (error) {
  //   console.warn("error reading console", error);
  //   res.status(500).json({ success: false, error: error.message });
  // }
  res.redirect("/");
});
app.post("/heroes", async (req, res) => {
  try {
    const heroes = await readHeroes();
    const newHero = {
      id: Date.now().toString(),
      superName: req.body.superName,
    };
    heroes.push(newHero);
    await writeHeroes(heroes);
    res.status(201).json({
      success: true,
      message: "Hero created successfully!",
      redirectTo: "/heroes",
    });
  } catch (error) {
    console.warn("warning");
  }
});
app.listen(PORT, () => {
  console.log(`App is serving UI listening on ${PORT}`);
});

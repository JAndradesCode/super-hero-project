const express = require("express");
const app = express();
const fs = require("fs").promises;
const path = require("path");
const heroUIDBpath = path.join(__dirname, "data", "ui-heroes.json");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");
const PORT = 4000;
// read, write functions
// --- routes ----
// ---- GET ----
app.get("/", async (req, res) => {
  try {
    const data = await fs.readFile(heroUIDBpath, "utf-8");
    const heroes = await JSON.parse(data);
    res.render("heroList.ejs", { heroes });
  } catch (error) {
    console.error("error reading console", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`App is serving UI listening on ${PORT}`);
});
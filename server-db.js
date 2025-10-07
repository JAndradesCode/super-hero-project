require('dotenv').config();
const express = require('express');
const fs = require('fs');
const path = require('path');
const heroDBpath = path.join(__dirname, 'data', 'superHeroes.json');
const app = express();
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static('public'));
app.set('view engine', 'ejs');
const PORT = 3000;
// read, write functions
async function readHeroes() {
	try {
		const data = await fs.readFile(heroDBpath, 'utf-8');
		return JSON.parse(data);
	}
	catch (error) {
		return []; // return empty array
	}
}
async function writeHeroes(heroes) {
	try {
await fs.writeFile(heroDBpath, JSON.stringify(heroes, null, 2));
	}
	catch (error) {
		console.error('problem writing to file', error);
	}
}
async function initializeDatabase() {
	try {
		await fs.access(heroDBpath);
	}
	catch (error) {
		await writeHeroes([]);
	}
}
initializeDatabase();
// --- routes ----
// ---- post ----
app.post('/heroes', (req, res) => {
});
app.listen(PORT, ()=>{
	console.log(`App is listening on PORT`);
});
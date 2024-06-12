const axios = require("axios");
const fs = require("fs");
const path = require("path");
const cheerio = require("cheerio");
require("dotenv").config();

const { API_KEY } = process.env;

const stripHTML = (text) => {
	const $ = cheerio.load(text);
	const newText = $.text();
	return newText.replace(/[\t\n]/g, "");
};

const getApiInfo = async () => {
	const noInfo = "No information available";
	const apiData = [];
	let URL = `https://api.rawg.io/api/games?key=${API_KEY}`;
	for (let i = 0; i < 8; i++) {
		const { results, next } = (await axios.get(URL)).data;
		results.map(async (vg) => {
			const descURL = `https://api.rawg.io/api/games/${vg.id}?key=${API_KEY}`;
			const descInfo = (await axios.get(descURL)).data;
			apiData.push({
				id: vg.id,
				img: vg.background_image,
				name: vg.name,
				description: stripHTML(descInfo.description_raw || noInfo),
				requirements: {
					minimum: stripHTML(
						vg.platforms.find((platform) => platform.requirements_en)
							?.requirements_en.minimum || noInfo
					),
					recommended: stripHTML(
						vg.platforms.find((platform) => platform.requirements_en)
							?.requirements_en.recommended || noInfo
					),
				},
				released: vg.released,
				ratings: vg.ratings.map((rating) => ({
					title: rating.title,
					percent: rating.percent,
				})),
				platforms: vg.platforms.map((platform) => ({
					id: platform.platform.id,
					name: platform.platform.name,
				})),
				genres: vg.genres.map((genre) => genre.name),
			});
		});

		URL = next;
	}
	const filePath = path.join(__dirname, "data.json");
	fs.writeFileSync(filePath, JSON.stringify(apiData, null, 2));
	console.log("data.json ha sido creado con éxito.");
};

getApiInfo();

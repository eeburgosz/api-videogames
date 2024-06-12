const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, "..", "data.json");

app.get("/data", (req, res) => {
	try {
		const data = fs.readFileSync(DATA_FILE, "utf8");
		res.json(JSON.parse(data));
	} catch (error) {
		res.status(500).json({ message: "Error reading data", error });
	}
});

app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});

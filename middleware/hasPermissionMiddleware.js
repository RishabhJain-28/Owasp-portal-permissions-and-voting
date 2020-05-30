const jwt = require("jsonwebtoken");
const config = require("config");
const { User } = require("../models/userModel");

module.exports = async function (req, res, next, pos, description) {
	if (!req.user) return res.status(400).send("no user");
	let permission = false;
	if (global.permissions[req.user._id]) permission = global.permissions[req.user._id].find(p => p === req.originalUrl);

	// !permissions.find(r => r === req.originalUrl
	if (req.user.position !== pos && !permission) {
		const token = jwt.sign({ startedBy: req.user._id, route: req.originalUrl, description }, config.get("jwtPrivateKey"));
		return res.status(403).send({ message: `you dont have the req permissions for ${description}`, voteToken: token });
	}
	next();
};

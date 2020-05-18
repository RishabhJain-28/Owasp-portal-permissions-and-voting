const express = require("express");
const router = express.Router();
const _ = require("lodash");
const bcrypt = require("bcrypt");

const { User, validateUser } = require("../models/userModel");

router.get("/", async (req, res) => {
	const users = await User.find();
	res.send(users);
});

router.post("/", async (req, res) => {
	const { error } = validateUser(req.body);
	if (error) return res.status(400).send(error.details[0].message);

	let user = await User.findOne({ email: req.body.email });
	if (user) return res.status(400).send("User with the given email already exists");

	user = new User(_.pick(req.body, ["name", "year", "position", "email", "password"]));

	const salt = await bcrypt.genSalt(10);
	user.password = await bcrypt.hash(user.password, salt);

	await user.save();
	const token = user.genAuthToken();
	res
		.header("access-control-expose-headers", "x-auth-token")
		.header("x-auth-token", token)
		.send(_.pick(user, ["name", "email", "position", "_id"]));
});
module.exports = router;

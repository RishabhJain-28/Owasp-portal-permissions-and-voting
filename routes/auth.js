const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const Joi = require("joi");

const { User } = require("../models/userModel");

router.post("/", async (req, res) => {
	const { error } = validateReq(req.body);
	if (error) return res.status(400).send(error.details[0].message);

	let user = await User.findOne({ email: req.body.email });
	if (!user) return res.status(400).send("Invalid Email or Password");

	const validPassword = await bcrypt.compare(req.body.password, user.password);
	if (!validPassword) return res.status(400).send("Invalid Email or Password");

	const token = user.genAuthToken();
	res.send(token);
});

function validateReq(req) {
	schema = {
		email: Joi.string().email().required().max(255),
		password: Joi.string().required().max(255),
	};
	return Joi.validate(req, schema);
}

module.exports = router;

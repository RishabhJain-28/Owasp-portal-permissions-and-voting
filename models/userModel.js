const mongoose = require("mongoose");
const Joi = require("joi");
const jwt = require("jsonwebtoken");
const config = require("config");
const userSchema = new mongoose.Schema({
	name: { type: String, required: true, minlength: 3, maxlength: 20 },
	year: {
		type: Number,
		required: true,
		min: 1,
		max: 4,
	},
	position: {
		type: String,
		enum: ["member", "core", "exbo"],
		required: true,
	},
	email: {
		type: String,
		maxlength: 255,
		required: true,
		unique: true,
	},
	password: {
		type: String,
		required: true,
		minlength: 8,
		maxlength: 255,
	},
});

userSchema.methods.genAuthToken = function () {
	return jwt.sign({ _id: this._id, email: this.email, name: this.name, position: this.position }, config.get("jwtPrivateKey"));
};

const User = new mongoose.model("user", userSchema);

function validateUser(user) {
	schema = {
		name: Joi.string().required().min(3).max(20),
		year: Joi.number().required().min(1).max(4),
		position: Joi.string().valid("member", "core", "exbo").required(),
		email: Joi.string().email().required().max(255),
		password: Joi.string().required().min(8).max(255),
	};
	return Joi.validate(user, schema);
}

module.exports.User = User;
module.exports.validateUser = validateUser;

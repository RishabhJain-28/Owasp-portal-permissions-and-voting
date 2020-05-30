const mongoose = require("mongoose");

const voteSchema = new mongoose.Schema({
	startedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, maxlength: 255 },
	inSupport: { type: Number, min: 0, default: 0 },
	total: { type: Number, min: 0, default: 0 },
	description: { type: String, minlength: 0, maxlength: 255, required: true },
	route: { type: String, minlength: 0, maxlength: 255, required: true },
	votedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }],
	status: { type: String, required: true },
});

const Vote = new mongoose.model("vote", voteSchema);

module.exports.Vote = Vote;

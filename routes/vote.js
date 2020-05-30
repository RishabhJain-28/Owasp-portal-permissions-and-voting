const express = require("express");
const router = express.Router();
const Pusher = require("pusher");
const jwt = require("jsonwebtoken");
const config = require("config");
const _ = require("lodash");
const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);

const { Vote } = require("../models/voteModel");
const auth = require("../middleware/authMiddleware");

var pusher = new Pusher({
	appId: "1002913",
	key: "6f9bb0058c88f82eb9b5",
	secret: config.get("pusherSecret"),
	cluster: "ap2",
	useTLS: true,
});
router.get("/", async (req, res) => {
	let votes = await Vote.find();
	votes = votes.filter(v => v.status === "ongoing");
	res.send(votes);
});

router.get("/start", async (req, res) => {
	const token = req.header("x-vote-token");
	if (!token) return res.status(401).send("No vote token provided");

	try {
		const voteData = jwt.verify(token, config.get("jwtPrivateKey"));

		let vote = await Vote.findOne({ route: voteData.route, status: "ongoing" });
		if (vote) return res.status(400).send("A vote is already going on this");

		vote = new Vote(_.pick(voteData, ["startedBy", "description", "route"]));
		vote.status = "ongoing";
		await vote.save();

		// global.votes[vote._id] =  {
		// 	startedBy: vote.startedBy,
		// 	route: vote.route,
		// };;
		setTimeout(endVote, 60 * 1000, vote._id);

		pusher.trigger("voting-ch", "voteStart", vote);

		res.send(vote);
	} catch (ex) {
		res.status(400).send("Invalid vote Token");
	}
});

router.put("/submit", auth, async (req, res) => {
	const { error } = validateSubmitReq(req.body);
	if (error) return res.status(400).send(error.details[0].message);

	const vote = await Vote.findOne({ _id: req.body._id });
	if (!vote) return res.status(400).send("No vote with given Id found");
	if (vote.status === "ended") return res.status(400).send("Vote already ended");

	if (vote.votedBy.find(v => v == req.user._id)) return res.status(400).send("given user already voted");

	vote.votedBy.push(req.user._id);
	vote.inSupport += req.body.vote === "yes" ? 1 : 0;
	vote.total++;

	await vote.save();

	res.send(vote);
});

function validateSubmitReq(req) {
	const schema = {
		_id: Joi.objectId().required(),
		vote: Joi.string().required().valid("yes", "no"),
	};
	return Joi.validate(req, schema);
}

async function endVote(voteId) {
	// console.log(vote);
	const vote = await Vote.findOne({ _id: voteId });
	console.log("ending vote");
	pusher.trigger("voting-ch", "voteEnd", vote);
	vote.status = "ended";
	await vote.save();
	// global.votes[vote._id] =
	// const user = await User.findOne({ _id: vote.startedBy });

	console.log(vote.inSupport);
	console.log(vote.total);

	if (!vote.total || (vote.inSupport * 100) / vote.total <= 50) return;

	console.log("permission added");
	if (!global.permissions[vote.startedBy]) global.permissions[vote.startedBy] = [];

	global.permissions[vote.startedBy].push(vote.route);
	// user.permissions.push(vote.route);
	console.log(global.permissions);
	// global.user = user;
	setTimeout(removePermission, 60 * 1000, vote);
	// await user.save();
	//couple these

	//call a pusher trigger
}

async function removePermission(vote) {
	// user = global.user;
	console.log("removing permission", vote.route);

	console.log("vote.startBy", vote.startedBy);
	console.log(global.permissions[vote.startedBy]);
	// delete global.permissions[vote.startedBy];

	const index = global.permissions[vote.startedBy].indexOf(vote.route);
	global.permissions[vote.startedBy].splice(index, 1);
	console.log("removing...", global.permissions);
	// await user.save();
}

module.exports = router;

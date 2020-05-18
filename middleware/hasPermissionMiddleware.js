module.exports = function (req, res, next, pos) {
	// console.log("");
	if (req.user.position !== pos) return res.status(403).send("you dont have the req permissions");
	next();
};

//just a temp point for testing permissions

const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const hasPermission = require("../middleware/hasPermissionMiddleware");

router.get("/1", [auth, (req, res, next) => hasPermission(req, res, next, "core")], (req, res) => {
	res.send("Reached 1");
});
router.get("/2", [auth, (req, res, next) => hasPermission(req, res, next, "exbo")], (req, res) => {
	res.send("Reached 2 ");
});

module.exports = router;

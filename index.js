const express = require("express");
const app = express();
const mongoose = require("mongoose");
const config = require("config");
const path = require("path");

const users = require("./routes/users");
const auth = require("./routes/auth");
const voting = require("./routes/vote");
const publicPages = require("./routes/publicPages");
const protected = require("./routes/protected");

process.on("uncaughtException", ex => {
	console.log("Uncaught Exception....");
	console.log(ex.message, ex);
	process.exit(1);
});
process.on("Unhandled Rejection", ex => {
	console.log("Unhandled Rejection....");
	console.log(ex.message, ex);
	process.exit(1);
});
if (!config.get("jwtPrivateKey")) {
	throw new Error("FATAL ERROR:jwtPrivateKey not found");
}

mongoose
	.connect(config.get("dbConnectionString"), { useCreateIndex: true, useNewUrlParser: true, useUnifiedTopology: true })
	.then(() => {
		console.log("Connected to DB...");
	})
	.catch(ex => {
		console.log("Could not connect to database...", ex);
	});

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", publicPages);
app.use("/users", users);
app.use("/auth", auth);
app.use("/protected", protected);
// app.use("/voting", voting);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`listening on port:${PORT}`));

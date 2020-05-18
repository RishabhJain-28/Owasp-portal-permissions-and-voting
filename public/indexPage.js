const callvoteBtn = document.getElementById("call-vote");
const form = document.getElementById("vote");
callvoteBtn.addEventListener("click", () => {
	console.log("a");
});

const pusher = new Pusher("6f9bb0058c88f82eb9b5", {
	cluster: "ap2",
});

const channel = pusher.subscribe("voting-ch");

channel.bind("vote", data => {
	alert(JSON.stringify(data));
});

channel.bind("voteStarted", data => {
	alert(JSON.stringify(data));
});

form.addEventListener("submit", async e => {
	e.preventDefault();
	const vote = document.querySelector("input[name=vote]:checked").value;
	// console.log(vote);

	try {
		const result = await fetch("http://localhost:1000/voting", {
			method: "POST",
			body: JSON.stringify({ vote }),
			headers: {
				"Content-Type": "Application/json",
			},
		});
		if (!result.ok) throw new Error(result.statusText);
		const data = await result.json();
		console.log(data);
	} catch (ex) {
		console.log(ex);
	}
});

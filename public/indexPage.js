const callvoteBtn = document.getElementById("call-vote");
const btnProtected_1 = document.getElementById("protectec1");
const btnProtected_2 = document.getElementById("protectec2");
const callVote = document.getElementById("callVote");
const btnYes = document.getElementById("yesBtn");
const btnNo = document.getElementById("noBtn");
const votes = document.getElementById("votes");
const forms = {};
getInitialVotes();
async function getInitialVotes() {
	const result = await fetch("http://localhost:1000/voting/");
	if (!result.ok) {
		return console.log("error");
	}
	const votes = await result.json();
	votes.forEach(v => {
		addVoteOption(v);
	});
}

const pusher = new Pusher("6f9bb0058c88f82eb9b5", {
	cluster: "ap2",
});

const channel = pusher.subscribe("voting-ch");

// channel.bind("vote", data => {
// 	console.log("voteUpdated");
// 	alert(JSON.stringify(data));
// });

channel.bind("voteEnd", data => {
	console.log("voteEnded");
	alert(JSON.stringify(data));
});

channel.bind("voteStart", data => {
	addVoteOption(data);
	console.log(data);
	alert(JSON.stringify(data));
});

function addVoteOption(data) {
	const div = document.createElement("div");
	div.innerHTML = `
	<div id="voting" >
				<h1>Voting starts for ${data.description}</h1>
				<!-- <button class="waves-effect waves-light btn" id="call-vote">Call vote</button> -->

				<form class="${data.route[-1]}" id="${data.route}">
					<p>
						<label>
							<input class="${data.route[-1]}" name="vote${data.route[-1]}" type="radio" value="yes" />
							<span>YES</span>
						</label>
						<br />
						<label>
							<input class="${data.route[-1]}" name="vote${data.route[-1]}" type="radio" value="no" />
							<span>NO</span>
						</label>
					</p>
					<input  type="submit" class="btn ${data.route[-1]}" />
				</form>
			</div>
	`;
	votes.appendChild(div);
	forms[data.route] = document.querySelector("." + data.route[-1]);

	forms[data.route].addEventListener("submit", async e => {
		e.preventDefault();
		const vote = document.querySelector(`input.${data.route[-1]}[name=vote${data.route[-1]}]:checked`).value;
		try {
			const result = await fetch("http://localhost:1000/voting/submit", {
				method: "PUT",
				body: JSON.stringify({ _id: data._id, vote }),
				headers: {
					"x-auth-token":
						"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1ZWMyMmRkYmRhNDc5NzI0MTQ0OTk3YmQiLCJlbWFpbCI6ImFiY0BnbWFpbC5jb20iLCJuYW1lIjoiQUJDMTIzIiwicG9zaXRpb24iOiJjb3JlIiwiaWF0IjoxNTkwNTc4NTk2fQ.oqXcUfnwHdCUY5bXJOJ1BaPrW7CcXoJBJc2hVoAtP-4",
					"Content-Type": "Application/json",
				},
			});
			if (!result.ok) throw new Error(await result.text());
			const d = await result.json();
			console.log(d);
		} catch (ex) {
			console.log(ex);
		}
	});
}

function letVote(voteToken) {
	btnYes.removeEventListener("click", () => console.log("s"));
	btnNo.removeEventListener("click", () => console.log("s"));

	callVote.style = "display:block;";

	btnYes.addEventListener("click", async () => {
		const result = await fetch("http://localhost:1000/voting/start", {
			headers: {
				"x-vote-token": voteToken,
			},
		});
		if (!result.ok) {
			console.log("error starting vote", result.statusText, await result.text());
			return;
		}
		callVote.style = "display:none;";
	});
	btnNo.addEventListener("click", () => {
		callVote.style = "display:none;";
	});
}

btnProtected_1.addEventListener("click", async () => {
	const result = await fetch("http://localhost:1000/protected/1", {
		method: "GET",
		headers: {
			"x-auth-token":
				"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1ZWMyMmUzYzI4ZTk5ZDFmNTQzYjk0NWYiLCJlbWFpbCI6InF3ZUBnbWFpbC5jb20iLCJuYW1lIjoiUVdFMTIzIiwicG9zaXRpb24iOiJtZW1iZXIiLCJpYXQiOjE1ODk4MDgxNzR9.YexfzMuGOwL6slPI_gDqEgNc_cI25v_bkKD3hV7Ri7k",
		},
	});
	if (!result.ok) {
		const { voteToken } = await result.json();
		return letVote(voteToken);
	}
});

btnProtected_2.addEventListener("click", async () => {
	const result = await fetch("http://localhost:1000/protected/2", {
		method: "GET",
		headers: {
			"x-auth-token":
				"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1ZWMyMmUzYzI4ZTk5ZDFmNTQzYjk0NWYiLCJlbWFpbCI6InF3ZUBnbWFpbC5jb20iLCJuYW1lIjoiUVdFMTIzIiwicG9zaXRpb24iOiJtZW1iZXIiLCJpYXQiOjE1ODk4MDgxNzR9.YexfzMuGOwL6slPI_gDqEgNc_cI25v_bkKD3hV7Ri7k",
		},
	});

	if (!result.ok) {
		const { voteToken } = await result.json();
		return letVote(voteToken);
	}
});

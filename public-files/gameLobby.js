// Game Lobby
//  <div class="player-link player-3">link here</div>
//  <div class="player-link player-4">link here</div>

var linkContainer = document.getElementsByClassName("link-container")[0];
var numberOfPlayers = 4;

for (var i = 3; i <= numberOfPlayers; i++) {
  let newPlayerDiv = document.createElement("div");
  newPlayerDiv.classList.add("player-link", `player-${i}`);
  let newDivContents = `<a href="gamePlay">Player ${i}</a>`;
  newPlayerDiv.innerHTML = newDivContents;
  linkContainer.append(newPlayerDiv);
}

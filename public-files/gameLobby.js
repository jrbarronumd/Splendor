// Game Lobby
// TODO: Redo structure of this page to use unordered list, like saved games.
// Current design is also hard to read on a wide screen. Add margin on left, maybe dependent on screen width.
const socket = io();
var numberOfPlayers, gameData;
let myQueryString = new URLSearchParams(window.location.search);
var gameId = myQueryString.get("game_id");

// As soon as connection is made, join user to the game's socket room, which will initiate game data push
socket.on("connect", () => {
  socket.emit("game-lobby", gameId);
});

// When connection is confirmed by server, log socket ID to console
socket.on("connected", (result) => {
  console.log(result);
});

// Server pushed gameData after connection.
socket.on("game-data", (respData) => {
  gameData = respData;
  numberOfPlayers = JSON.parse(gameData.players);
  loadPageInfo();
});

function loadPageInfo() {
  var linkContainer = document.getElementsByClassName("link-container")[0];
  var playerNames = [gameData.player_1, gameData.player_2, gameData.player_3, gameData.player_4];
  var header = document.getElementsByClassName("sub-title")[0];
  header.innerText = `[game ID: ${gameId}]`;
  // First delete the extra player divs
  for (var i = 4; i > numberOfPlayers; i--) {
    linkContainer.children[i - 1].remove();
  }
  for (var x = 0; x <= numberOfPlayers - 1; x++) {
    let name = JSON.parse(playerNames[x]).name;
    linkContainer.children[x].children[0].innerText = name;
    linkContainer.children[x].children[0].href = `game?game_id=${gameId}&p=p${x + 1}`;
    linkContainer.getElementsByClassName("copy-button")[x].addEventListener("click", copyButtonClickHandler);
  }
  function copyButtonClickHandler(event) {
    // Remove previous copy notice if present
    const oldNotice = document.getElementById("copied-notice");
    if (oldNotice) {
      oldNotice.remove();
    }
    // Copy the href and convert to a string before copying
    const copiedPlayerContainer = event.target.parentElement;
    let linkToCopy = copiedPlayerContainer.getElementsByTagName("a")[0].href;
    linkToCopy = `${linkToCopy}`;
    //linkToCopy.select();
    //linkToCopy.setSelectionRange(0, 99999); // For mobile devices
    navigator.clipboard.writeText(linkToCopy);
    const copyNotice = document.createElement("span"); // Display a notice that a link was copied
    copyNotice.id = "copied-notice";
    copyNotice.innerText = "playable link copied to clipboard";
    copiedPlayerContainer.append(copyNotice);
  }
}

// Game Lobby
var numberOfPlayers, gameData;
let myQueryString = new URLSearchParams(window.location.search);
var gameId = myQueryString.get("game_id");

getGameInfo();
function getGameInfo() {
  var xhr = new XMLHttpRequest();
  xhr.responseType = "json";
  xhr.open("GET", `/api/db/getGame?game_id=${gameId}`);
  xhr.send();
  xhr.onload = () => {
    if (xhr.readyState === 4) {
      gameData = xhr.response;
      numberOfPlayers = JSON.parse(gameData.players);
      loadPageInfo();
    }
  };
}

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

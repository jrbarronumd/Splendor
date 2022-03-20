// Time to mess with people

let myQueryString = new URLSearchParams(window.location.search);
let mischiefLevel = parseInt(myQueryString.get("m")) || 0;
let specialTreatment = myQueryString.get("s") || "";
var timerId;
var closeCount = 0;
let rickRollCount = 1;
var randomWait = -1;
const videoContainer = document.getElementById("video-container");
const videoTextElement = document.getElementById("video-text");
const videoCloseElement = document.getElementById("video-close");

export function rickRoll(timeout = 10000, videoText = "The game is over... But now you can enjoy this!", override = 0) {
  if (override == 1) mischiefLevel = 1; // This is to let in-game RickRolls not take forever
  if (mischiefLevel == 0) return;
  const videoSource = "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1";
  const videoElement = document.createElement("iframe");
  videoElement.src = videoSource;
  videoElement.id = "video";
  videoElement.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
  videoElement.frameborder = "0";
  videoContainer.appendChild(videoElement);
  videoContainer.style.display = "block";
  videoTextElement.innerText = videoText;
  videoCloseElement.addEventListener("click", closeVideo);
  setTimeout(() => {
    videoCloseElement.style.display = "block";
  }, timeout);
  // Next timer will end the max level of torture (mischief level 2+) by actually enabling the close button
  timerId = setTimeout(() => {
    mischiefLevel = 1;
    videoTextElement.innerText = "Ok, you can close it now...";
  }, 90000);
}

function closeVideo() {
  clearTimeout(timerId);
  closeCount += 1;
  const videoElement = document.getElementById("video");
  var displayText = `Nice Try ${specialTreatment}...`;
  if (closeCount === 2) {
    displayText = `Nope...`;
  } else if (closeCount === 3) {
    displayText = `Guess you're going to have to watch the whole thing...`;
  } else if (closeCount >= 3) {
    displayText = `You must really love this song...`;
  }
  videoElement.remove();
  videoContainer.style.display = "none";
  videoCloseElement.style.display = "none";
  if (mischiefLevel >= 2) {
    //   This will start the video over again, as well as the timer disabling this endless loop
    rickRoll(5000, displayText);
  }
}

export function randomRickRoll(name) {
  if (randomWait === -1) {
    // Very first occurrence
    randomWait = 5;
    rickRoll(3000, `Not this time, ${name}!!!!`, 1);
    return true;
  }
  // Make sure there are at least 5 clicks between RickRolls
  if (randomWait === 0) {
    // Random number generated (bigger number pool each time the video is played).  If equal to 3, move to next step
    let chance = Math.floor(Math.random() * 5 * rickRollCount);
    if (chance === 3) {
      console.log("Random number grants you a RickRoll!");
      rickRoll(3000, `No, No, No...  Gotcha, ${name}!!!!`, 1);
      rickRollCount += 1;
      randomWait = 5;
      return true;
    }
  }
  if (randomWait > 0) {
    randomWait -= 1;
  }
  return false;
}

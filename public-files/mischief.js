// Time to mess with people

let myQueryString = new URLSearchParams(window.location.search);
let mischiefLevel = myQueryString.get("m") || "0";
let specialTreatment = myQueryString.get("s") || "";
var timerId;
var closeCount = 0;
const videoContainer = document.getElementById("video-container");
const videoTextElement = document.getElementById("video-text");
const videoCloseElement = document.getElementById("video-close");

export function rickRoll(timeout = 10000, videoText = "The game is over... But now you can enjoy this!") {
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

//  ======== HOTKEYS ========
document.addEventListener("keyup", function(event) {
  console.log(event.keyCode);
  if (event.keyCode === 27) {  //27=ESC
    window.location.href='./index.html';
  }
  else if (event.keyCode === 49) {  //49="1"
    window.location.href='./1_intermittent.html';
  }
  else if (event.keyCode === 50) {  //50="2"
    window.location.href='./2_continuous.html';
  }
  else if (event.keyCode === 51) {  //51="3"
    window.location.href='./3_proactive.html';
  }
});


var audio = new Audio();

document.getElementById("mute").onclick = function() {
  if (audio.muted == true) {
    window.audio.muted = false;
    document.getElementById("mute-icon").src = "images/unmute.png";
  }
  else {
    window.audio.muted = true;
    document.getElementById("mute-icon").src = "images/mute.png";
  }
}
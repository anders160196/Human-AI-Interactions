var div = document.getElementById("populateMe");
var page1 = document.getElementById("page1");
var page2 = document.getElementById("page2");
var page3 = document.getElementById("page3");
var currentPlaylist = null;
var currentIndex = null;

//import metadata from '/metadata.json' assert {type: 'json'};
var metadata;
async function loadData() {
  metadata = await import('./metadata.json', {assert: {type: 'json'}}).then(module => module.default);
}
loadData();


const myUrl = new URL(window.location.toLocaleString());
const urlParams = myUrl.searchParams;
const mode = urlParams.get('mode');
console.log(mode);

if (sessionStorage.getItem("genres") === null || mode == 'reset') {
  page1.style.display='block';
}
else {
  showPlaylists();
}


function selectFavoriteGenres() {
  var checkboxSelections = document.querySelectorAll('input[type="checkbox"]:checked');

  if (checkboxSelections.length == 0) {
    alert("Please select your age and favorite music genres.");
    return;
  }

  var genres = [];
  for (var element of checkboxSelections) {
    genres.push(element.id);
  }
  
  console.log(genres);
  sessionStorage.setItem("genres", genres);
  showPlaylists();
}


function showPlaylists() {
  page1.style.display='none';
  page2.style.display='block';
  page3.style.display='none';

  genres = sessionStorage.getItem("genres");

  buttons = document.querySelectorAll('button[class="button-square"]');
  
  for (var button of buttons) {
    if (genres.includes(button.value)) {
      button.style.display='inline-block';
      button.onclick = showSongs;
    }
  }
}


var playlist = '';
function showSongs(event) {
  page1.style.display='none';
  page2.style.display='none';
  page3.style.display='block';

  playlist = event.currentTarget.innerHTML;
  console.log(playlist);
  
  document.getElementById("playlistTitle").innerHTML = playlist;

  for (let [index, song] of metadata[playlist].entries()) {
    console.log(song);
    console.log(index);
    let row = document.createElement("div");
    let icon = document.createElement("img");
    let title = document.createElement("p");
    let artist = document.createElement("p");
    
    row.className = "row";
    row.tabIndex = -1;

    icon.className = "icon";  
    title.className = "title";
    artist.className = "artist";

    title.innerHTML = song['title'];
    artist.innerHTML = song['artist'];

    row.appendChild(icon);
    row.appendChild(title);
    row.appendChild(artist);

    row.onmouseover = function() {
      if (row.className == "row-selected") {
        icon.src = "images/pause.png"
      }
      else {
        icon.src = "images/play.png"
      }
    };
    
    row.onmouseout = function() {
      if (row.className == "row-selected") {
        icon.src = "images/playing.png"
      }
      else {
        icon.src = ""
      }
    };
    
    //var previousSelection = "";
    row.onclick = function() {
      if (row.className == "row-selected") {
        row.className = "row";
        icon.src = "images/play.png";
        audio.pause();
      }
      else {
        console.log('music/playlists/' + playlist + '/' + song['title'] + '.wav');
        audio.src = 'music/playlists/' + playlist + '/' + song['title'] + '.wav';
        audio.play();

        for (const child of div.children) {
          child.className = "row";
          child.children[0].src = "";
        }
        currentIndex = index;
        row.className = "row-selected";
        row.children[0].src = "images/playing.png";
        console.log(currentIndex);
      }
    };
    
    div.appendChild(row);
  }
}


function backToPlaylists() {
  audio.pause();
  div.innerHTML = '';
  page1.style.display='none';
  page2.style.display='block';
  page3.style.display='none';
}

audio.addEventListener("ended", function(){
  audio.currentTime = 0;
  console.log("ended");

  currentIndex += 1;
  div.children[currentIndex].click();
  
});
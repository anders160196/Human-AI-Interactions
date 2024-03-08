let video = document.querySelector("#video");
let canvas = document.querySelector("#canvas");
let image_data_url = "";
let previousEmotion = "";
var detectionRunning = true;
var statusMessage = "";

//Uncomment for debugging and testing
//document.getElementById("result-label").style.visibility = "visible";

async function streaming() {
  let stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
  video.srcObject = stream;
};
streaming();

navigator.permissions.query({ name: "camera" }).then(res => {
  console.log(res.state);
  if (res.state != "granted") {
    document.getElementById("message").innerHTML = "Permission denied"
  }
  else {
    detectEmotion();
  }
});

async function detectEmotion() {
  console.log("start");
  canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
  image_data_url = canvas.toDataURL('image/jpeg');
  //console.log(image_data_url);

  // Promity Facial Emotion
  // https://rapidapi.com/promityai-promityai-default/api/promity-facial-emotion
  function dataURLtoFile(dataurl, filename) {
    var arr = dataurl.split(','),
      mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[1]), 
      n = bstr.length, 
      u8arr = new Uint8Array(n);
      
    while(n--){
      u8arr[n] = bstr.charCodeAt(n);
    }
    
    return new File([u8arr], filename, {type:mime});
  }
  
  var file = dataURLtoFile(image_data_url,'image.jpeg');
  //console.log(file);
  
  const data = new FormData();
  data.append("image_file", file);
  
  const response = await fetch('https://promity-facial-emotion.p.rapidapi.com/emotions/process_file', {
    method: 'POST',
    headers: {
      'X-RapidAPI-Key': '9cf514d4f5msh0e9cf0fb633e92ep15cc10jsneef8eace8f3f',
  		'X-RapidAPI-Host': 'promity-facial-emotion.p.rapidapi.com'
    },
    body: data
  })
  const json = await response.json();
  console.log(json.detections);

  if (json.detections.length == 0) {
    document.getElementById("result-label").innerHTML = 'no face detected';
    statusMessage = 'No faces detected';
  }
  else {
    var detection = json.detections[0].emotions;
    var emotions = {
      'joy': detection.happy,
      'sorrow': detection.sad,
      'anger': detection.angry,
      'surprise': detection.surprise
    };

    var all_boxes = document.querySelectorAll('div.box')
    for (var box of all_boxes) {
      box.style.backgroundColor = "#b8deff";
    }

    var total = emotions['joy'] + emotions['sorrow'] + emotions['anger'] + emotions['surprise']
    
    for (const [key, value] of Object.entries(emotions)) {
      var highlight_boxes = document.querySelectorAll(`div.${key}:nth-child(-n + ${Math.round(5 * value/total)})`)
      for (var box of highlight_boxes) {
        box.style.backgroundColor = "#2699FB";
        console.log(box);
      }
    }
    
    var emotion;
    for (const [key, value] of Object.entries(emotions)) {
      console.log(`${key}: ${value}`);
      if (value > total*0.5) {
        emotion = key;
        console.log(emotion);
      }
    }

    document.getElementById("result-label").innerHTML =
      `Joy: ${emotions['joy']}<br>
      Sorrow: ${emotions['sorrow']}<br>
      Anger: ${emotions['anger']}<br>
      Surprise: ${emotions['surprise']}<br>`;

    var songs = {
      'joy': 'Pharrell Williams - Happy',
      'sorrow': 'Billie Eilish - lovely (with Khalid)',
      'anger': 'Nirvana - Smells Like Teen Spirit',
      'surprise': 'Ylvis - The Fox (What Does the Fox Say)'
    };

    if (emotion !== undefined) {
      statusMessage = 'Emotion detected: ' + emotion.toUpperCase();
      if (emotion != previousEmotion) {
        audio.src = 'music/emotions/' + songs[emotion] + '.mp3';
        audio.play();
      }
      previousEmotion = emotion;
    }
    else {
      statusMessage = 'No emotion detected'
    }
  }

  
  if (detectionRunning) {
    document.getElementById("message").innerHTML = statusMessage;
    await delay(500);
    detectEmotion();
  }
}

function delay(milliseconds) {
  return new Promise(resolve => {
    setTimeout(resolve, milliseconds);
  });
}

function toggleDetection() {
  if (detectionRunning) {
    detectionRunning = false;
    document.getElementById("message").innerHTML = 'Paused';
    video.style.display = "none";
    canvas.style.display = "block";
  }
  else {
    detectionRunning = true;
    document.getElementById("message").innerHTML = 'Detecting...';
    video.style.display = "block";
    canvas.style.display = "none";
    detectEmotion();
  }
}
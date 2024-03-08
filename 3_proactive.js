let video = document.querySelector("#video");
let canvas = document.querySelector("#canvas");
let image_data_url = "";
let previousEmotion = "";
var detectionRunning = true;
var statusMessage = "";

var KEY = "YOUR_API_KEY"; //https://cloud.google.com/vision/docs/detecting-faces

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

  
  // GOOGLE VISION API 
  package = {
    "requests": [
      {
        "image": {
          "content": image_data_url.split(';base64,')[1]
        },
        "features": [
          {
            "maxResults": 1,
            "type": "FACE_DETECTION"
          }
        ]
      }
    ]
  }

  const response = await fetch(
    'https://vision.googleapis.com/v1/images:annotate?key=' + KEY, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8'
    },
    body: JSON.stringify(package)
  })
  const json = await response.json();
  //console.log(json);
  
  if (json.responses[0].faceAnnotations === undefined) {
    document.getElementById("result-label").innerHTML = 'no face detected';
    statusMessage = 'No face detected';
  }
  else {
    var detection = json.responses[0].faceAnnotations[0];
    var emotions = {
      'joy': detection.joyLikelihood,
      'sorrow': detection.sorrowLikelihood,
      'anger': detection.angerLikelihood,
      'surprise': detection.surpriseLikelihood
    };

    var ratings = {
      'VERY_UNLIKELY': 1,
      'UNLIKELY': 2,
      'POSSIBLE': 3,
      'LIKELY': 4,
      'VERY_LIKELY': 5
    };

    var all_boxes = document.querySelectorAll('div.box')
    for (var box of all_boxes) {
      box.style.backgroundColor = "#b8deff";
    }
    
    for (const [key, value] of Object.entries(emotions)) {
      var highlight_boxes = document.querySelectorAll(`div.${key}:nth-child(-n + ${ratings[value]})`)
      for (var box of highlight_boxes) {
        box.style.backgroundColor = "#2699FB";
        console.log(box);
      }
    }
    
    var emotion;
    for (const score of ['POSSIBLE', 'LIKELY', 'VERY_LIKELY']) {
      for (const [key, value] of Object.entries(emotions)) {
        console.log(`${key}: ${value}`);
        if (value == score) {
          emotion = key;
        }
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
var myPlot = document.getElementById('myDiv');

//For generating a new array, go to: https://replit.com/@Zymf/PLOT-JSON#continuous.js
import genres from '/array.json' assert {type: 'json'};

//  ======== PLOTLY ========

var layout = {
  xaxis: {
    autorange: false,
    range: [-2, 3],
    showgrid: false,
    zeroline: false,
    visible: false
  },
  yaxis: {
    autorange: false,
    range: [-0.5, 1.75],
    showgrid: false,
    zeroline: false,
    visible: false
  },
  margin: {
    l: 20,
    r: 20,
    b: 20,
    t: 20
  },
  legend: {
    x: 1
  },
  modebar: {bgcolor: '#f5fcff'},
  plot_bgcolor:'#f5fcff',
  paper_bgcolor:'rgba(0,0,0,0)',
  dragmode: "pan"
};

var config = {
  responsive: true,
  displaylogo: false,
  displayModeBar: false,
  modeBarButtonsToRemove: ['toImage', 'select2d', 'lasso2d', 'resetScale2d'],
  modeBarButtonsToAdd: [
    { name: 'Show all points',
      icon: Plotly.Icons.pencil,
      click: function(gd) {alert('Not yet programmed!')}
    }]
}

var plotData = [];
function traceAll() {
  for (const [key, value] of Object.entries(genres)) {
    var trace = {
      x: value['x'],
      y: value['y'],
      mode: 'markers+text',
      type: 'scatter',
      name: key,
      text: value['title'],
      hoverinfo: 'name',
      //visible: 'legendonly',
      textposition: 'top center',
      textfont: {
        family:  'Raleway, sans-serif'
      },
      marker: {
        size: value['markersize'],
        line: {
          width: value['linewidth'],
          color: value['linecolor']
        }
      }
    };
    plotData.push(trace);
  }
}

traceAll();
Plotly.newPlot('myDiv', plotData, layout, config);


//  ======== EVENTS ========
var audio = new Audio();
var dragLayer = document.getElementsByClassName('nsewdrag')[0]

var song = '';
var trace = '';
var pn = null;
var tn = null;
var markersize = [];
var linewidth = [];
var linecolor = [];

myPlot.on('plotly_hover', function(data){
  dragLayer.style.cursor = 'pointer'

  if (pn != null) {
    markersize[pn] = 40;
    linewidth[pn] = 2;
    linecolor[pn] = 'white';
  }
  
  for(var i=0; i < data.points.length; i++){
    song = data.points[i].text;
    trace = data.points[i].data.name;
    pn = data.points[i].pointNumber;
    tn = data.points[i].curveNumber;
    markersize = data.points[i].data.marker.size;
    linewidth = data.points[i].data.marker.line.width;
    linecolor = data.points[i].data.marker.line.color;
  }

  markersize[pn] = 55;
  linewidth[pn] = 4;
  linecolor[pn] = 'black';
  
  var update = {'marker':{size: markersize, line: {width: linewidth, color: linecolor}}};
  Plotly.restyle('myDiv', update, [tn]);
  
  console.log('song: ' + song);
  console.log('trace: ' + trace);
  audio.src = 'music/genres/' + trace + '/' + song + '.wav';
  audio.play();
});

myPlot.on('plotly_unhover', function(){
  dragLayer.style.cursor = ''
});

audio.addEventListener("ended", function(){
  audio.currentTime = 0;
  console.log("PLAYING NEXT SONG");

  markersize[pn] = 40;
  linewidth[pn] = 2;
  linecolor[pn] = 'white';
  pn++
  markersize[pn] = 55;
  linewidth[pn] = 4;
  linecolor[pn] = 'black';
  
  if (genres[trace]['title'][pn] == null) {
    pn = 0
  }
  song = genres[trace]['title'][pn];

  console.log('song: ' + song);
  console.log('trace: ' + trace);
  audio.src = 'music/genres/' + trace + '/' + song + '.wav';
  audio.play();
  
  var update = {'marker':{size: markersize, line: {width: linewidth, color: linecolor}}};
  Plotly.restyle('myDiv', update, [tn]);


  xrange = [genres[trace]['x'][pn]-2.5, genres[trace]['x'][pn]+2.5];
  yrange = [genres[trace]['y'][pn]-1, genres[trace]['y'][pn]+1];
  Plotly.animate('myDiv', {
    layout: {
      xaxis: {range: xrange},
      yaxis: {range: yrange}
    }
  }, {
    transition: {
      duration: 500,
      easing: 'cubic-in-out'
    }
  })
  
});


var xrange = [-2, 3];
var yrange = [-0.5, 1.50];
var xmin = -15;
var xmax = 15;
var ymin = -2;
var ymax = 1.5;

myPlot.on('plotly_relayout',(e)=>{
  console.log(e);

  if (e['xaxis.range[1]'] === undefined || e['xaxis.range[0]'] === undefined || e['yaxis.range[1]'] === undefined || e['yaxis.range[0]'] === undefined) {
    return
  }
  
  if (e['xaxis.range[1]'] < xmin || e['xaxis.range[0]'] > xmax || e['yaxis.range[1]'] < ymin || e['yaxis.range[0]'] > ymax) {
    console.log('Out of range!');
    Plotly.animate('myDiv', {
      layout: {
        xaxis: {range: xrange},
        yaxis: {range: yrange}
      }
    }, {
      transition: {
        duration: 500,
        easing: 'cubic-in-out'
      }
    })
  }
  else {
    console.log('In range!');
    xrange = [e['xaxis.range[0]'], e['xaxis.range[1]']];
    yrange = [e['yaxis.range[0]'], e['yaxis.range[1]']];
  }
})

const overlay = document.getElementById("overlay");
const box = document.querySelectorAll(".bg")[0].getBoundingClientRect();

Object.assign(overlay.style,{
  height: box.height + 'px',
  width: box.width + 'px',
  top: box.top + 'px',
  left: box.left + 'px'
});
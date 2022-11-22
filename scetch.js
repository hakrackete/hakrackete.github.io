let mainCanvas;
let circlearray = [];
let display_size = 800;
let width = display_size;
let height = display_size;
let outer_radius = display_size/2;
let middle = [width/2, height/2];
let max_iterations = 10000;
let further_iterations =  10000;

let min_radius = 4;
let max_radius = 15;

let x = 0;
let y = 0;
let pixelval = 0;
let biggest_possible_radius;

let distance_to_origin;

let color;
let background_color;

let displayCanvas = document.getElementById("displayCanvas");
mirrorCanvasToImage(); // initialize the Image
displayCanvas.width = width;
displayCanvas.height = height;
let ctx = displayCanvas.getContext("2d", { willReadFrequently: true })

let buffer
let bufferCanvas = document.getElementById("bufferCanvas");
bufferCanvas.width = width;
bufferCanvas.height = height;
let bufferctx = bufferCanvas.getContext("2d", { willReadFrequently: true });

let Matrix = []
for (let i = 0; i < (Math.floor(width/(max_radius)) + 2); i++){
Matrix[i] = []
  for (let j = 0; j < (Math.floor(height/(max_radius)) + 2); j++){
    Matrix[i][j] = new Set();
    }
}
function newDrawloop(){
  
  background_color = document.getElementById("background_colorpicker").value;
  density = document.getElementById("density").value;
  radiusscaling = document.getElementById("radiusscaling").value/100;

  ctx.fillStyle = background_color;
  ctx.fillRect(0, 0, displayCanvas.width, displayCanvas.height);
  
  // limits the number of drawn circles
  for (let i=0; i<(density * circlearray.length/1000); i++){
    let thing = circlearray[i];
    thing.drawCircle(ctx,radiusscaling);
  }
  mirrorCanvasToImage();
  
}


  
function moreCircles(){ // appends onto existing circlearray and Matrix
  calculateCircles(further_iterations);
  assignColors();
  
}

function redrawCircles(){ // creates a new circlearray and Matrix
  let start = Date.now();
  min_radiustemp = document.getElementById("min_r").value;
  max_radiustemp = document.getElementById("max_r").value;
  min_radius = Math.min(min_radiustemp,max_radiustemp);
  max_radius = Math.max(min_radiustemp,max_radiustemp);

  Matrix = []
  circlearray = []
  for (let i = 0; i < (Math.floor(width/(max_radius)) + 2); i++){
    Matrix[i] = []
    for (let j = 0; j < (Math.floor(height/(max_radius)) + 2); j++){
      Matrix[i][j] = new Set();
    }
  }
  calculateCircles(max_iterations);
  assignColors();
  document.getElementById("additionalCircles").disabled = false;
  let end = Date.now();
  console.log(`blank Execution time: ${end - start} ms`);

}

function calculateCircles(iterations){
  const circleWorker = new Worker('worker.js');
  doCrop = document.getElementById("doCrop").checked;
  circleWorker.postMessage([circlearray,Matrix, iterations,doCrop ,min_radius,max_radius,width,height, outer_radius, middle])
  circleWorker.onmessage = (e) => {
    circlearray = e.data[0];
    for (let i = 0; i < circlearray.length;i++ ){
      //console.log(typeof circlearray[i]);
      circlearray[i] = new myCircle(circlearray[i].x,circlearray[i].y,circlearray[i].radius);
    }
    
    Matrix = e.data[1];
    for (let i = 0; i < Matrix.length; i++){
      for (let j = 0; j < Matrix[i].length; j++){
        for(let k =0; k < Matrix[i][j].length; k++){
          Matrix[i][j] = new myCircle(Matrix[i][j].x,Matrix[i][j].y,Matrix[i][j].radius);
        }
      }
    }
    
    assignColors();
  }
}

function myloadImage() {
  var input, file, fr, img;
  if (typeof window.FileReader !== 'function') {
      mywrite("The file API isn't supported on this browser yet.");
      return;
  }

  input = document.getElementById('imgfile');
  if (!input) {
      mywrite("Um, couldn't find the imgfile element.");
  }
  else if (!input.files) {
      mywrite("This browser doesn't seem to support the `files` property of file inputs.");
  }
  else if (!input.files[0]) {
      mywrite("Please select a file before clicking 'Load'");
  }
  else {
      file = input.files[0];
      fr = new FileReader();
      fr.onload = mycreateImage;
      fr.readAsDataURL(file);
  }

  function mycreateImage() {
      img = new Image();
      img.onload = myimageLoaded; // onload has to be called before img.src because only this order will trigger the onload event
      img.src = fr.result;
  }

  function myimageLoaded() {
      var canvas = document.getElementById("referenceCanvas")
      canvas.width = img.width;
      canvas.height = img.height;
      var ctx = canvas.getContext('2d', { willReadFrequently: true });
      ctx.drawImage(img,0,0);
      assignColors();
  }

  function mywrite(msg) {
      var p = document.createElement('p');
      p.innerHTML = msg;
      document.body.appendChild(p);
  }
  document.getElementById("generator").disabled = false;
}

function customImage(){
  let canvas = document.getElementById("referenceCanvas");
  canvas.width = width;
  canvas.height = height;
  let ctx = canvas.getContext('2d', { willReadFrequently: true });
  let number = document.getElementById("numberselector").value;
  ctx.textAlign= "center";
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "white"
  
  ctx.font = "300px Arial";
  ctx.fillText(number, width/2,500);
  assignColors();
  
}


function assignColors(){
  // assigns every existing circle a corresponding color
  let canvas = document.getElementById("referenceCanvas");
  let ctx = canvas.getContext("2d",{ willReadFrequently: true });
  let pixel;
 
  // scaling calculations
  let scalingx = (canvas.width/width);
  let scalingy = (canvas.height/height);

  // getting the colors from the input
  let firstcolor = hexToRgb(document.getElementById("first_colorslider").value);
  let secondcolor = hexToRgb(document.getElementById("second_colorslider").value);

  
  
  let newX, newY;
  for (selectedCircle of circlearray){
    newX = Math.floor(selectedCircle.x * scalingx);
    newY = Math.floor(selectedCircle.y * scalingy);
    pixel = ctx.getImageData(newX,newY,1,1).data;

    // wheter the original color or the selected colors should be picked
    if(document.getElementById("use_blackwhite").checked){
      if(pixel[0] + pixel[1] + pixel[2] <= 30){ // check if the Image at the given position ist dark or not
        selectedCircle.isBlack = true;
        selectedCircle.color = firstcolor.slice(); // always create a copy of the array by slice, 
        selectedCircle.changedColor = firstcolor.slice();
      }
      else{
        selectedCircle.isBlack = false;
        selectedCircle.color = secondcolor.slice();
        selectedCircle.changedColor = secondcolor.slice();
      }
    }
    else{
      selectedCircle.color = ([pixel[0],pixel[1],pixel[2],255]);
      selectedCircle.changedColor = selectedCircle.color.slice();
    }
  }
  apply_shifts();
}

function updateHiddenCanvas(){
  let start1 = Date.now();
  if(document.getElementById("radioUpload").checked){
    myloadImage();
  }
  else{
    customImage();
  }
  let end1 = Date.now();
  console.log(`updatehiddencanvas Execution time: ${end1 - start1} ms`);
}

function downloadCanvas(){
  let canvas = document.getElementById("displayCanvas"); 
  var link = document.createElement('a');
  link.download = 'daskannmanändern.png';
  link.href = canvas.toDataURL(); 
  link.click();
}

function apply_shifts(){

  colorshift_intervall = document.getElementById("shiftslider").value;
  brightness_range = document.getElementById("lightschwiftslider").value / 100;
  gradient_range = document.getElementById("gradientshiftslider").value / 100;
  let fcolor = hexToRgb(document.getElementById("first_colorslider").value);
  let scolor = hexToRgb(document.getElementById("second_colorslider").value);
  
  
  for (selectedCircle of circlearray){
    selectedCircle.changedColor = selectedCircle.color.slice(); // resetting already made changes
    if(document.getElementById("use_blackwhite").checked){
      gradientshift(selectedCircle,gradient_range,fcolor,scolor);
    }
    colorschwift(selectedCircle,colorshift_intervall);
    lightshift(selectedCircle,brightness_range);
  }
  newDrawloop();
}

function myShuffle(array) {
  array.sort(() => Math.random() - 0.5);
}

// helper function for handling color inputs
function hexToRgb(h){return['0x'+h[1]+h[2]|0,'0x'+h[3]+h[4]|0,'0x'+h[5]+h[6]|0]}

function mirrorCanvasToImage(){
  document.getElementById('target').src = displayCanvas.toDataURL();
}

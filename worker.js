// TODO: firefox radiobuttons 
// nicht jedes object neu generieren, wenn es bereits geladen wurde

importScripts('aCircle.js');


onmessage = (e) => { //verwendung von Offscreen Canvas, da hier DOM Elemente nicht funktioneiern im WorkerContext
  let start = Date.now();
  // let backgroundcolor = (0,0,0);
  // bufferctx.fillStyle = backgroundcolor;
  // bufferctx.fillRect(0,0,bufferCanvas.width,bufferCanvas.height);

  // bufferctx.fillStyle = (30,49,255);
  // for(circleObject of circlearray){ //draws already existing circles on the Buffer
  //   bufferctx.beginPath();
  //   bufferctx.arc(circleObject.x, circleObject.y, circleObject.radius, 0, 2 * Math.PI , false)
  //   bufferctx.fill();
  // }

  circlearray = e.data[0];
  Matrix = e.data[1];
  iterations = e.data[2];
  doCrop = e.data[3];
  min_radius = e.data[4];
  max_radius = e.data[5];
  width = e.data[6];
  height = e.data[7];
  outer_radius = e.data[8];
  middle = e.data[9];

  let x = 0;
  let y = 0;
  let biggest_possible_radius;
  let distance_to_origin;

  
    

  for(let progress = 0; progress < iterations; progress++){
    
    x = Math.floor(Math.random() * width) + 1;
    y = Math.floor(Math.random() * height) + 1;
    
    
    // pixelval = bufferctx.getImageData(x,y,1,1).data;

    
    // if((pixelval[0] == backgroundcolor[0] && pixelval[1] == backgroundcolor[1] && pixelval[2] == backgroundcolor[2])){
      
    //   continue;
    // }

    distance_to_origin = Math.sqrt((middle[0]-x)**2 + (middle[1]-y)**2);
    if(doCrop){
      biggest_possible_radius = outer_radius - distance_to_origin;
    }
    else{
      biggest_possible_radius = max_radius;
    }
    
    if (!(biggest_possible_radius >= min_radius)){

      continue;
    }

    let nearcells = new Set();
    xCell = Math.floor(x/max_radius)
    yCell = Math.floor(y/max_radius)

    for (let h = -1; h <= 1; h++){
      for (let k = -1; k <= 1; k++){
        let chosen_set = Matrix[Math.max(0,(xCell + h))][Math.max(0,(yCell + k))];
        nearcells = new Set([...nearcells,...chosen_set]);
      }
    }
    

    for (singleCircle of nearcells){
      current_radius = Math.sqrt((x - singleCircle.x)**2 + (y - singleCircle.y)**2) - singleCircle.radius;
      if (current_radius < biggest_possible_radius){
        biggest_possible_radius = current_radius;
        if (biggest_possible_radius < min_radius){
          break;
        }
      }
    }

    if (biggest_possible_radius >= min_radius){
      biggest_possible_radius = Math.min(biggest_possible_radius, max_radius);

      let circleObject = new myCircle(x,y,biggest_possible_radius);
     
    
      for (let h = -1; h <= 1; h++){
        for (let k = -1; k <= 1; k++){
          
          Matrix[Math.max(0,Math.floor((x + h * biggest_possible_radius) / max_radius))][Math.max(0,Math.floor((y + k * biggest_possible_radius) / max_radius))].add(circleObject);
          
        }
      }
      circlearray.push(circleObject);
      // bufferctx.beginPath();
      // bufferctx.arc(circleObject.x, circleObject.y, circleObject.radius, 0, 2 * Math.PI , false)
      // bufferctx.fill();
    }
  }
  let end = Date.now();
  console.log(`Execution time for worker: ${end - start} ms`);
  postMessage([circlearray,Matrix]);
}
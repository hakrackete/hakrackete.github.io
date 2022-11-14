class myCircle {
    constructor(x, y, radius) {
      this.x = x;
      this.y = y;
      this.radius = radius;
      this.color = [120,120,120,255];
      this.gradmod = 2*(Math.random()-0.5);
      this.colormod = [2*(Math.random()-0.5),2*(Math.random()-0.5),2*(Math.random()-0.5)];
      this.brightmod = 2*(Math.random()-0.5);
      this.changedColor = [120,120,120];
      this.isBlack = false;
      

  
    }
    drawCircle(ctx,scalingfactor) {
      ctx.beginPath();
      ctx.fillStyle = "rgb("+ this.changedColor +")";
      ctx.arc(this.x, this.y, this.radius * scalingfactor, 0, 2 * Math.PI , false);
      ctx.fill();
    }
  }
  
function gradientshift(circleobject,modifier,firstcolor, secondcolor){
let difference;
let myColor = circleobject.changedColor;
if(circleobject.isBlack){
    for(let i = 0; i<3; i++){
    difference = firstcolor[i] - secondcolor[i];
    myColor[i] = firstcolor[i] - (difference * circleobject.gradmod * modifier);
    }
}
else{
    for(let i = 0; i<3; i++){
    difference = secondcolor[i] - firstcolor[i];
    myColor[i] = secondcolor[i] - (difference * circleobject.gradmod * modifier);
    }
}

}
  
function colorschwift(circleobject, intervall){
let myColor = circleobject.changedColor;
    for(let i = 0; i<3; i++){
        shifted_color = myColor[i] + circleobject.colormod[i] * intervall;
        myColor[i] = Math.max(Math.min(255, shifted_color), 0);
    }
    //return myColor;
}


function lightshift(circleobject,modifier){
let color = circleobject.changedColor;
for(let i = 0; i<3; i++){
    shifted_color = color[i] + color[i] * circleobject.brightmod * modifier;
    color[i] = Math.max(Math.min(255, shifted_color), 0);

}
}

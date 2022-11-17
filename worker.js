onmessage = (e) => { //verwendung von Offscreen Canvas, da hier DOM Elemente nicht funktioneiern im WorkerContext
    for(let i = 0; i<3 ;i++){
        postMessage(i)
    }
  }
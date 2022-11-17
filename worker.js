onmessage = (e) => {
    console.log('Message received from main script');
    workerResult = 3
    console.log('Posting message back to main script');
    postMessage(workerResult);
    workerResult +=1;
    console.log('Posting message2 back to main script');
    postMessage(workerResult);
  }
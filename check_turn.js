function checkTURNServer(turnConfig, timeout){
  return new Promise(function(resolve, reject){
    setTimeout(function(){
        if(promiseResolved) return;
        resolve(false);
        promiseResolved = true;
    }, timeout || 5000);
    var promiseResolved = false
      , myPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection   //compatibility for firefox and chrome
      , pc = new myPeerConnection({iceServers:[turnConfig]})
      , noop = function(){};
    pc.createDataChannel("");    //create a bogus data channel
    pc.createOffer(function(sdp){
      if(sdp.sdp.indexOf('typ relay') > -1){ // sometimes sdp contains the ice candidates...
        promiseResolved = true;
        resolve(true);
      }
      pc.setLocalDescription(sdp, noop, noop);
    }, noop);    // create offer and set local description
    pc.onicecandidate = function(ice){  //listen for candidate events
      if(promiseResolved || !ice || !ice.candidate || !ice.candidate.candidate || !(ice.candidate.candidate.indexOf('typ relay')>-1))  return;
      promiseResolved = true;
      resolve(true);
    };
  });
}

function timer() {
  return new Date().getTime()
}

config = {
  'urls': 'turn:numb.viagenie.ca',
  'credential': 'xxx',
  'username': '474000158@qq.com'
}

function check() {
  t1 = timer()
  checkTURNServer(config)
  .then(function(bool){
    t2 = timer()
    console.log((t2 - t1) / 1000)
    console.log('is my TURN server active? ', bool? 'yes':'no');
  })
  .catch(console.error.bind(console));
}

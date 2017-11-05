
var start = $('#btn-video-start')
var stop = $('#btn-video-stop')
var join = $('#btn-video-join')
var room = $('#room-name')

// create our webrtc connection
var webrtc = new SimpleWebRTC({
    // the id/element dom element that will hold "our" video
    localVideoEl: 'local-video',
    // the id/element dom element that will hold remote videos
    remoteVideosEl: '',
    // immediately ask for camera access
    autoRequestMedia: true,
    debug: false,
    detectSpeakingEvents: true
});

function setBtn() {
  start.prop('disabled', true)
  join.prop('disabled', true)
  stop.prop('disabled', false)
};

function checkRoom() {
    val = room.val()
    if (val == undefined || val.length < 1) {
        var msg = '请输入教室编号'
        showTip(msg, 'danger')
        return false;
    }
    return val
}

function showTip(msg, type) {
  var tip = $('#tip')
  tip.stop(true).prop('class', 'alert alert-' + type).text(msg).fadeIn(500).delay(2000).fadeOut(500);
}

start.click(function(e) {
    e.preventDefault();
    if (!checkRoom()) return;
    webrtc.createRoom(val, function (err, name) {
        console.log(' create room cb', arguments);
        if (!err) {
            var msg = '教室创建成功, 同学可以输入 "' + name + '" 来加入教室'
            showTip(msg, 'success')
            setBtn()
        } else {
            console.log(err);
        }
    });
})
stop.click(function(e) {
    e.preventDefault();
    webrtc.leaveRoom()
    var msg = '断开成功'
    showTip(msg, 'success')
    start.prop('disabled', false)
    join.prop('disabled', false)
    stop.prop('disabled', true)
})
// when it's ready, join if we got a room from the URL
webrtc.on('readyToCall', function () {
  join.prop('disabled', false)
  join.click(function(e) {
      e.preventDefault();
      val = checkRoom()
      if (!val) return;
      webrtc.joinRoom(val, function(err, room) {
          if (!err) {
              if (Object.keys(room.clients).length > 0) {
                  var msg = '加入教室成功！'
                  showTip(msg, 'success')
                  setBtn()
              } else {
                  var msg = '您输入的教室编号不存在，请修改后再次加入'
                  showTip(msg, 'danger')
              }
          } else {
              console.log(err)
          }
      });
  })
});

function showVolume(el, volume) {
    if (!el) return;
    if (volume < -45) { // vary between -45 and -20
        el.style.height = '0px';
    } else if (volume > -20) {
        el.style.height = '100%';
    } else {
        el.style.height = '' + Math.floor((volume + 100) * 100 / 25 - 220) + '%';
    }
}
webrtc.on('channelMessage', function (peer, label, data) {
    if (data.type == 'volume') {
        showVolume(document.getElementById('volume_' + peer.id), data.volume);
    }
});
webrtc.on('videoAdded', function (video, peer) {
    console.log('fuck video added', peer);
    var remotes = document.getElementById('remotes');
    if (remotes) {
        var d = document.createElement('div');
        d.className = 'videoContainer';
        d.id = 'container_' + webrtc.getDomId(peer);
        d.appendChild(video);
        var vol = document.createElement('div');
        vol.id = 'volume_' + peer.id;
        vol.className = 'volume_bar';
        video.onclick = function () {
            video.style.width = video.videoWidth + 'px';
            video.style.height = video.videoHeight + 'px';
        };
        d.appendChild(vol);
        remotes.appendChild(d);
    }
});
webrtc.on('videoRemoved', function (video, peer) {
    console.log('video removed ', peer);
    console.log('video remove ', video);
    var remotes = document.getElementById('remotes');
    var el = document.getElementById('container_' + webrtc.getDomId(peer));
    if (remotes && el) {
        remotes.removeChild(el);
    }
});
webrtc.on('volumeChange', function (volume, treshold) {
    //console.log('own volume', volume);
    showVolume(document.getElementById('localVolume'), volume);
});


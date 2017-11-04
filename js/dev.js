
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
        alert('请输入教室编号');
        return false;
    }
    return val
}

start.click(function(e) {
    e.preventDefault();
    if (!checkRoom()) return;
    webrtc.createRoom(val, function (err, name) {
        console.log(' create room cb', arguments);
        if (!err) {
            alert('教室创建成功, 同学可以输入 "' + name + '" 来加入教室')
            setBtn()
        } else {
            console.log(err);
        }
    });
})
stop.click(function(e) {
    e.preventDefault();
    webrtc.leaveRoom()
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
                  alert('加入教室成功！')
                  setBtn()
              } else {
                  alert('您输入的教室编号不存在，请修改后再次加入')
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


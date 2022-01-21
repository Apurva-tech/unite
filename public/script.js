// socket.io client initialization
const socket = io("/");
// Js method to get ID
const videoGrid = document.getElementById("video-grid");
// To establish new WebRTC connection using PeerJS
const myPeer = new Peer();
let myVideoStream;
const myVideo = document.createElement("video");
myVideo.muted = true;
let peers = {},
  currentPeer = [];

// Persist the data of last few rooms visited on DB
addRoomsToUser();

const toggleButton = document.querySelector(".dark-light");

toggleButton.addEventListener("click", () => {
  document.body.classList.toggle("light-mode");
});

function linkify(inputText) {
  let replacedText, replacePattern1, replacePattern2, replacePattern3;

  //URLs starting with http://, https://, or ftp://
  replacePattern1 =
    /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=_|!:,.;]*[-A-Z0-9+&@#\/%=_|])/gim;
  replacedText = inputText.replace(
    replacePattern1,
    '<a href="$1" target="_blank">$1</a>'
  );

  //URLs starting with "www." (without // before it, or it'd re-link the ones done above).
  replacePattern2 = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
  replacedText = replacedText.replace(
    replacePattern2,
    '$1<a href="http://$2" target="_blank">$2</a>'
  );

  //Change email addresses to mailto:: links.
  replacePattern3 = /(([a-zA-Z0-9\-\_\.])+@[a-zA-Z\_]+?(\.[a-zA-Z]{2,6})+)/gim;
  replacedText = replacedText.replace(
    replacePattern3,
    '<a href="mailto:$1">$1</a>'
  );

  return replacedText;
}
// Browser API to get user video & audio
navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true,
  })
  .then((stream) => {
    myVideoStream = stream;
    // Add video stream to video element
    addVideoStream(myVideo, stream);
    // Event of myPeer object
    myPeer.on("call", (call) => {
      call.answer(stream);
      currentPeer.push(call.peerConnection);
      const video = document.createElement("video");
      call.on("stream", (userVideoStream) => {
        addVideoStream(video, userVideoStream);
      });
      call.on("close", () => {
        video.remove();
      });
    });

    socket.on("user-connected", (userId) => {
      connectToNewUser(userId, stream);
    });
    // Input text value
    let text = $("input");
    // When press enter send message
    $("html").keydown(function (e) {
      if (e.which == 13 && text.val().length !== 0) {
        const user = getUser();
        console.log(user);
        // let authId = user.uuid;
        // Emit event on the connected socket connection
        socket.emit("message", { message: text.val(), user });
        text.val("");
      }
    });
    // Callback function for user and message to reflect on the interface
    socket.on("createMessage", ({ message, user }) => {
      console.log(message);
      $("ul").append(
        `<li class="message" style="font-size: 15px" ><b><img width="40px" style="border-radius: 50%; padding: 5px;" src="${
          user.photoURL
        }">${user.displayName}</b><br/>${linkify(message.message.content)}</li>`
      );
      scrollToBottom();
    });
  });

  // Remove peers once the connection is deleted
socket.on("user-disconnected", (userId) => {
  if (peers[userId]) {
    peers[userId].close();
    let i = currentPeer.indexOf(peers[userId].peerConnection);
    currentPeer.slice(i, i + 1);
    delete peers[userId];
  }
});

// Fetch and display previous messages from the DB onto the application
myPeer.on("open", async (id) => {
  socket.emit("join-room", ROOM_ID, id);
  let resp = await fetch(`${window.location.origin}/message/get`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ room: ROOM_ID }),
  });
  resp = await resp.json();
  resp.messages.forEach((message) => {
    $("ul").append(
      `<li class="message" style="font-size: 15px" ><b><img width="40px" style="border-radius: 50%; padding: 5px;" src="${
        message.user.photoURL
      }">${message.user.displayName}</b><br/>${linkify(message.content)}</li>`
    );
  });
  scrollToBottom();
});

function connectToNewUser(userId, stream) {
  const call = myPeer.call(userId, stream);
  const video = document.createElement("video");
  call.on("stream", (userVideoStream) => {
    addVideoStream(video, userVideoStream);
  });
  call.on("close", () => {
    video.remove();
  });

  peers[userId] = call;
  currentPeer.push(call.peerConnection);
}

function addVideoStream(video, stream) {
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();
  });
  video.ondblclick = (event) => {
    video.webkitEnterFullScreen();
    video.play();
  };
  video.onpause = () => video.play();
  videoGrid.append(video);
}

const scrollToBottom = () => {
  var d = $(".main__chat_window");
  d.scrollTop(d.prop("scrollHeight"));
};

const muteUnmute = () => {
  const enabled = myVideoStream.getAudioTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false;
    setUnmuteButton();
  } else {
    setMuteButton();
    myVideoStream.getAudioTracks()[0].enabled = true;
  }
};

const playStop = () => {
  let enabled = myVideoStream.getVideoTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false;
    setPlayVideo();
  } else {
    setStopVideo();
    myVideoStream.getVideoTracks()[0].enabled = true;
  }
};

const setMuteButton = () => {
  const html = `
    <i class="fas fa-microphone"></i>
    <span>Mute</span>
  `;
  document.querySelector(".main__mute_button").innerHTML = html;
};

const setUnmuteButton = () => {
  const html = `
    <i class="unmute fas fa-microphone-slash"></i>
    <span>Unmute</span>
  `;
  document.querySelector(".main__mute_button").innerHTML = html;
};

const setStopVideo = () => {
  const html = `
    <i class="fas fa-video"></i>
    <span>Stop Video</span>
  `;
  document.querySelector(".main__video_button").innerHTML = html;
};

const setPlayVideo = () => {
  const html = `
  <i class="stop fas fa-video-slash"></i>
    <span>Play Video</span>
  `;
  document.querySelector(".main__video_button").innerHTML = html;
};

//screenShare
const screenshare = () => {
  navigator.mediaDevices
    .getDisplayMedia({
      video: {
        cursor: "always",
      },
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
      },
    })
    .then((stream) => {
      let videoTrack = stream.getVideoTracks()[0];
      videoTrack.onended = function () {
        stopScreenShare();
      };
      for (let x = 0; x < currentPeer.length; x++) {
        let sender = currentPeer[x].getSenders().find(function (s) {
          return s.track.kind == videoTrack.kind;
        });

        sender.replaceTrack(videoTrack);
      }
    });
};

function stopScreenShare() {
  let videoTrack = myVideoStream.getVideoTracks()[0];
  for (let x = 0; x < currentPeer.length; x++) {
    let sender = currentPeer[x].getSenders().find(function (s) {
      return s.track.kind == videoTrack.kind;
    });
    sender.replaceTrack(videoTrack);
  }
}

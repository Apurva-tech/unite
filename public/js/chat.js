const socket = io(`${window.location.origin}/`);
const roomUsers = [];

addRoomsToUser();
// To toggle between dark and light theme
const toggleButton = document.querySelector(".dark-light");

toggleButton.addEventListener("click", () => {
  document.body.classList.toggle("light-mode");
});

const scrollToBottom = () => {
  var d = $(".main__chat_window");
  d.scrollTop(d.prop("scrollHeight"));
};
// To convert URL in the text to links 
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
// Join Room and Render messages with user name and photo from Firebase
firebase.auth().onAuthStateChanged(async function (user) {
  if (user) {
    console.log(user);
    socket.emit("join-room", ROOM_ID, user.uid);
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
      scrollToBottom();
    });
  }
});

socket.on("user-connected", (userId) => {
  roomUsers.push(userId);
});
// On enter press, to send message
let text = $("input");
$("html").keydown(function (e) {
  if (e.which == 13 && text.val().length !== 0) {
    const user = getUser();
    console.log(user);
    // let authId = user.uuid;
    socket.emit("message", { message: text.val(), user });
    text.val("");
  }
});
$("#send-text").on("click", function () {
  if (text.val().length !== 0) {
    // const user = getUser();
    // let authId = user.uuid;
    socket.emit("message", { message: text.val(), user: globaluser });
    text.val("");
  }
});
socket.on("createMessage", ({ message, user }) => {
  console.log(message);
  $("ul").append(
    `<li class="message" style="font-size: 15px" ><b><img width="40px" style="border-radius: 50%; padding: 5px;" src="${
      user.photoURL
    }">${user.displayName}</b><br/>${linkify(message.message.content)}</li>`
  );
  scrollToBottom();
});

$(function () {
  $(".status-button:not(.open)").on("click", function (e) {
    $(".overlay-app").addClass("is-active");
  });
  $(".pop-up .close").click(function () {
    $(".overlay-app").removeClass("is-active");
  });
});

$(".status-button:not(.open)").click(function () {
  $(".pop-up").addClass("visible");
});

$(".pop-up .close").click(function () {
  $(".pop-up").removeClass("visible");
});

$(function () {
  $(".status-button1:not(.open1)").on("click", function (e) {
    $(".overlay-app").addClass("is-active");
  });
  $(".pop-up1 .close1").click(function () {
    $(".overlay-app").removeClass("is-active");
  });
});

$(".status-button1:not(.open1)").click(function () {
  $(".pop-up1").addClass("visible");
});

$(".pop-up1 .close1").click(function () {
  $(".pop-up1").removeClass("visible");
});
// Pop up for join room
$(function () {
  $(".status-button2:not(.open2)").on("click", function (e) {
    $(".overlay-app").addClass("is-active");
  });
  $(".pop-up2 .close2").click(function () {
    $(".overlay-app").removeClass("is-active");
  });
});

$(".status-button2:not(.open2)").click(function () {
  $(".pop-up2").addClass("visible");
});

$(".pop-up2 .close2").click(function () {
  $(".pop-up2").removeClass("visible");
});
const toggleButton = document.querySelector(".dark-light");

toggleButton.addEventListener("click", () => {
  document.body.classList.toggle("light-mode");
});

const createRoom = async () => {
  const roomId = document.querySelector("#room-id");
  const enterRoom = document.querySelector("#enter-room");
  const copyRoomId = document.querySelector("#copy-room-id");
  const roomName = document.querySelector("#room-name").value;
  const data = await fetch(`${window.location.origin}/room`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: globaluser.email,
      name: roomName,
    }),
  });
  const response = await data.json();

  roomId.style.display = "block";
  if (response.success === true) {
    enterRoom.style.display = "inline-block";
    copyRoomId.style.display = "inline-block";
    roomId.innerHTML += response.room.roomID;
    roomId.onclick = () => {
      console.log("copying: " + response.room.roomID);
      roomId.style.background = "rgba(255,255, 255, 0.5)";
      copyToClipboard(response.room.roomID);
      setTimeout(() => {
        roomId.style.background = "inherit";
      }, 1500);
    };
    enterRoom.addEventListener("click", () => {
      window.location.href = `/chat/${response.room.roomID}`;
    });
  } else {
    roomId.style.color = "red";
    roomId.innerHTML = response.message;
  }
};

const roomRender = (ele, room) => {
  ele.innerHTML += `
      <a target="_blank" href="${location.origin}/chat/${room.roomID}">
        <svg viewBox="0 0 512 512" fill="currentColor">
          <path d="M352 0H64C28.704 0 0 28.704 0 64v320a16.02 16.02 0 009.216 14.496A16.232 16.232 0 0016 400c3.68 0 7.328-1.248 10.24-3.712L117.792 320H352c35.296 0 64-28.704 64-64V64c0-35.296-28.704-64-64-64z"></path>
          <path d="M464 128h-16v128c0 52.928-43.072 96-96 96H129.376L128 353.152V400c0 26.464 21.536 48 48 48h234.368l75.616 60.512A16.158 16.158 0 00496 512c2.336 0 4.704-.544 6.944-1.6A15.968 15.968 0 00512 496V176c0-26.464-21.536-48-48-48z"></path>
        </svg>
        ${room.name || room.roomID.substring(0, 18) + "..."}
      </a>
      `;
};

firebase.auth().onAuthStateChanged(async function (user) {
  if (user) {
    document.querySelector("#username").innerHTML =
      user?.displayName || "username"; //
    document.querySelector("#useremail").innerHTML = user?.email || "email"; //
    document.getElementById("profile-img").src = user?.photoURL;

    // <--------------------- Get user & user's rooms ------------------------>
    // After the user is authenticated, get their rooms and populate the dropdown
    // This is done on an authStateCHanged event which is fired when the user is
    // signed in or when the user signs out

    let ownedRooms, dbUser;
    const userRooms = document.getElementById("user-rooms");
    const lastRooms = document.getElementById("last-rooms");

    try {
      ownedRooms = await fetch(`${location.origin}/room/user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: user.email,
        }),
      });
      ownedRooms = await ownedRooms.json();
      console.log(ownedRooms);
      if (!ownedRooms?.success) {
        userRooms.innerHTML = `
        <a target="_blank" href="#">
          You have not created any rooms
        </a>
        `;
      } else if (ownedRooms.rooms.length > 0) {
        userRooms.innerHTML = "";
        ownedRooms?.rooms?.forEach((room) => roomRender(userRooms, room));
      }
    } catch (err) {
      console.error(err);
    }
    try {
      dbUser = await fetch(`${location.origin}/user/get`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: user.email,
        }),
      });
      dbUser = await dbUser.json();
      console.log(dbUser);
      if (dbUser.user.rooms.length === 0) {
        lastRooms.innerHTML = `
        <a target="_blank" href="#">
          You have not visited any rooms
        </a>
        `;
      } else {
        lastRooms.innerHTML = "";
        dbUser.user?.rooms?.forEach((room) => roomRender(lastRooms, room));
      }
    } catch (err) {
      console.error(err);
    }
  } else {
    document.querySelector("#username").innerHTML = "Not Signed in"; //
    document.querySelector("#useremail").innerHTML = ""; //
  }
});

// < -------------------- Event Scheduling -------------------- >
async function SendSchedule() {
  let obj = {};

  let emails;
  emails = validateMultipleEmails($("#emails").val());
  emails.push({ email: globaluser.email });
  let eventStart = $("#startday").val();
  let eventEnd = $("#endday").val();
  const meet_summary = $("#summary").val();

  obj["emails"] = emails;
  obj["eventStart"] = eventStart;
  obj["eventEnd"] = eventEnd;
  obj["summary"] = meet_summary;
  obj["organiser"] = globaluser.email;
  console.log(obj);

  let res = await fetch(`${window.location.origin}/invite`, {
    method: "POST",
    body: JSON.stringify(obj),
    headers: {
      "content-type": "application/json",
    },
  });
  let data = await res.json();
  // parse the response as JSON
  console.log("Response data: " + data["success"]);
  if (data["success"]) {
    document.getElementById("status").innerHTML = "Meeting has been scheduled";
  } else {
    document.getElementById("status").innerHTML = data["data"];
  }
  console.log(data);
}
function validateMultipleEmails(emailInput) {
  // Get value on emails input as a string
  let emails = emailInput;
  // Split string by comma into an array
  emails = emails.split(",");
  let valid = true;
  let regex =
    /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  let invalidEmails = [],
    validEmails = [];
  for (let i = 0; i < emails.length; i++) {
    // Trim whitespaces from email address
    emails[i] = emails[i].trim();
    // Check email against our regex to determine if email is valid
    if (emails[i] == "" || !regex.test(emails[i])) {
      invalidEmails.push(emails[i]);
    } else {
      validEmails.push({ email: emails[i] });
    }
  }
  // Output invalid emails
  $(".form-group .text-danger").remove();
  if (invalidEmails != 0) {
    $(".form-group").append(
      '<p class="text-danger">Invalid emails: ' +
        invalidEmails.join(", ") +
        "</p>"
    );
  }
  if (validEmails.length === emails.length) {
    return validEmails;
  } else return null;
}

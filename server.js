require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);

const {
  createRoom,
  getRoomByUser,
  getRoom,
  chatRoomMW,
  roomMW,
} = require("./controllers/Room/index");
const { sendInvite, mailFeedback } = require("./controllers/Misc");
const { createUser, addRooms, getUser } = require("./controllers/User");
const { createMessage, getMessages } = require("./controllers/Message");

app.use(express.json());

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

// <---------- VIEWS ---------->
app.get("/", (req, res) => {
  res.redirect(`/home`);
});
app.get("/timeline", (req, res) => {
  res.render("timeline");
});

app.get("/landing", (req, res) => {
  res.render("landing");
});

app.get("/home", (req, res) => {
  res.render("home");
});

app.get("/aibot", (req, res) => {
  res.render("aibot");
});
// <---------- ROUTES ---------->
app.post("/invite", sendInvite);

app.post("/feedback", mailFeedback);

app.post("/room", createRoom);

app.post("/room/get", getRoom);

app.post("/room/user", getRoomByUser);

app.post("/room/add", addRooms);

app.post("/message/get", getMessages);

app.post("/createuser", createUser);

app.post("/user/get", getUser);

// <---------- MW-VIEWS ---------->
app.get("/chat/:room", chatRoomMW);

app.get("/:room", roomMW);

// <---------- SOCKET ---------->
io.on("connection", (socket) => {
  socket.on("join-room", (roomId, userId) => {
    console.log(roomId, userId);
    socket.join(roomId);
    socket.to(roomId).broadcast.emit("user-connected", userId);
    // messages
    socket.on("message", async ({ message, user }) => {
      //send message to the same room
      console.log(user);
      let messageResp = await createMessage(user, message, roomId);
      io.to(roomId).emit("createMessage", { message: messageResp, user });
    });

    socket.on("disconnect", () => {
      socket.to(roomId).broadcast.emit("user-disconnected", userId);
    });
  });
});

// <--------- MONGOOSE + SERVER START --------->
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
    poolSize: 10, //increase poolSize from default 5
  })
  .then(() => {
    console.log("Connected MONGODB");

    server.listen(process.env.PORT || 3030, () => {
      console.log(
        `listening on port: ${process.env.PORT || 3030}, http://localhost:${
          process.env.PORT || 3030
        }`
      );
    });
  })
  .catch((err) => {
    console.error(err);
  });

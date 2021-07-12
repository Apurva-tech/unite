const { model, Schema } = require("mongoose");

// in the user schema, we store:
// the details necessary for the messaging
// rooms, to keep track of previously visited room

const userSchema = new Schema({
  uid: {
    type: String,
  },
  displayName: {
    type: String,
  },
  email: {
    type: String,
  },
  photoURL: {
    type: String,
  },
  rooms: [
    {
      type: Schema.Types.ObjectId,
      ref: "Room",
    },
  ],
});

module.exports = model("User", userSchema);

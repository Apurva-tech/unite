const { model, Schema } = require("mongoose");

// Message has a 1 to N relationship with User
// Message also has a 1 to N relationship with Room
// So we store the refs alongiwth the message content
const messageSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    content: {
      type: String,
    },
    room: {
      type: Schema.Types.ObjectId,
      ref: "Room",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = model("Message", messageSchema);

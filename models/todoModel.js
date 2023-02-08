import mongoose from "mongoose";
const todoSchema = mongoose.Schema(
  {
    title: {
      type: String,
      unique: true,
      require: [true, "Please provide a title"],
    },
    description: {
      type: String,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const Todo = mongoose.model("Todo", todoSchema);

export default Todo;

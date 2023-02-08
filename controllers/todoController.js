import { request } from "express";
import Todo from "../models/todoModel.js";
import {
  createTodoBodyValidation,
  updateTodoBodyValidation,
} from "../utils/validationSchema.js";

// @route POST api/todos/create
// @desc Create a new Task
// @access only authenticated users can access
const createTodo = async (req, res) => {
  try {
    const { error } = createTodoBodyValidation(req.body);
    if (error) {
      return res
        .status(400)
        .json({ error: true, message: error.details[0].message });
    }
    req.body = { ...req.body, user: req.user._id };
    const todo = await Todo.create(req.body);
    res
      .status(201)
      .json({ success: true, todo, message: "Todo created successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ error: true, message: "Internal Server Error" });
  }
};
// @route Get api/todo
// @desc  get all tasks
// @access only authenticated users can access

const getAllTodos = async (req, res) => {
  try {
    const todos = await Todo.find({ user: req.user._id });
    res.status(200).json({ success: true, todos });
  } catch (error) {
    return res
      .status(500)
      .json({ error: true, message: "Internal Server Error" });
  }
};
// @route Get api/todos/view/:todoId
// @desc view details of a specific task
// @access only authenticated users can access
const viewSpacificTask = async (req, res) => {
  try {
    const specificTask = await Todo.findOne({
      _id: req.params.todoId,
      user: req.user._id,
    });
    if (!specificTask) {
      return res.status(400).json({ error: true, message: "Wrong todo Id" });
    }
    res.status(200).json({ success: true, specificTask });
  } catch (error) {
    return res
      .status(500)
      .json({ error: true, message: "Internal Server Error" });
  }
};
// @route Put api/todos/delete/:todoId
// @desc update a specific task
// @access only authenticated users can access
const updateSpecificTask = async (req, res) => {
  try {
    const { error } = updateTodoBodyValidation(req.body);
    if (error) {
      return res
        .status(400)
        .json({ error: true, message: error.details[0].message });
    }
    const specificTask = await Todo.findOneAndUpdate(
      {
        _id: req.params.todoId,
        user: req.user._id,
      },
      req.body,
      { new: true }
    );
    if (!specificTask) {
      return res.status(400).json({ error: true, message: "Wrong todo Id" });
    }
    res.status(200).json({
      success: true,
      message: "Task successfully update",
      specificTask,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ error: true, message: "Internal Server Error" });
  }
};
// @route Delete api/todos/delete/:todoId
// @desc delete a specific task
// @access only authenticated users can access
const deleteSpecificTask = async (req, res) => {
  try {
    const specificTask = await Todo.findOneAndDelete({
      _id: req.params.todoId,
      user: req.user._id,
    });
    if (!specificTask) {
      return res.status(400).json({ error: true, message: "Wrong todo Id" });
    }
    res
      .status(200)
      .json({ success: true, message: "Task successfully deleted" });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ error: true, message: "Internal Server Error" });
  }
};

export {
  createTodo,
  getAllTodos,
  deleteSpecificTask,
  viewSpacificTask,
  updateSpecificTask,
};

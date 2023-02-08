import { Router } from "express";
import {
  createTodo,
  deleteSpecificTask,
  getAllTodos,
  updateSpecificTask,
  viewSpacificTask,
} from "../controllers/todoController.js";
const router = Router();

router.post("/todos/create", createTodo);
router.get("/todos", getAllTodos);
router.get("/todos/view/:todoId", viewSpacificTask);
router.put("/todos/update/:todoId", updateSpecificTask);
router.delete("/todos/delete/:todoId", deleteSpecificTask);
export default router;

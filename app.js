import express from "express";
import { config } from "dotenv";
import cors from "cors";
import dbConnect from "./config/dbConnect.js";
import authMiddleware from "./middlerware/authMiddleware.js";
import userRoute from "./routes/userRoute.js";

//express initialization
const app = express();

//environment variables initialization
config();

//database initialization
dbConnect();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.status(200).json({ message: "API is working" });
});

app.use("/api", userRoute);
app.use(authMiddleware);

//listening on port
const port = process.env.PORT || 5000;
app.listen(port, (req, res) => {
  console.log(`listening on port http://localhost:${port}`);
});

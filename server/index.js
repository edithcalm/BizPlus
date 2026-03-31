import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mpesaRouter from "./routes/mpesa.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use("/api/mpesa", mpesaRouter);

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.listen(port, () => {
  console.log(`M-Pesa backend running on port ${port}`);
});


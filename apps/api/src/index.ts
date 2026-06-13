import "dotenv/config";
import express, { Request, Response } from "express";
import cors from "cors";
import notesRouter from "./routes/notes";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// routes
app.get("/health", (req: Request, res: Response) => {
  res.json({ status: "API is running..." });
});
app.use("/notes", notesRouter);

app.listen(PORT, () => {
  console.log(`API is running on http://localhost:${PORT}`);
});

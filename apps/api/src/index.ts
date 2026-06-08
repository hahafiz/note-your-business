import express, { Request, Response } from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// test route
app.get("/health", (req: Request, res: Response) => {
  res.json({ status: "API is running..." });
});

app.listen(PORT, () => {
  console.log(`API is running on http://localhost:${PORT}`);
});

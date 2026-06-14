import "dotenv/config";
import express from "express";
import cors from "cors";
import notesRouter from "./src/routes/notes";

const app = express();
const PORT = process.env.PORT || 3001;

// --- MIDDLEWARE ---
// cors() allows FE to talk to this API
app.use(cors());

// express.json() lets Express read JSON request bodies
app.use(express.json());

// --- ROUTES ---
app.get("/health", (req, res) => {
  res.json({ status: "API is running..." });
});

app.use("/notes", notesRouter);

// --- START SERVER ---
app.listen(PORT, () => {
  console.log(`API is running on http://localhost:${PORT}`);
});

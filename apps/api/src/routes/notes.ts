import { Router, Request, Response } from "express";
import { supabase } from "../lib/supabase";
import { requireAuth } from "../middleware/auth";

const router = Router();

// all notes routes require login
router.use(requireAuth);

// GET /notes - fetch all notes for the logged-in user
router.get("/", async (req: Request, res: Response) => {
  const { data, error } = await supabase
    .from("notes")
    .select("*")
    .eq("owner_id", req.user!.id)
    .order("updated_at", { ascending: false });

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  res.json(data);
});

// GET /notes/:id - fetch a specific note
router.get("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from("notes")
    .select("*")
    .eq("id", id)
    .eq("owner_id", req.user!.id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      res.status(404).json({ error: "Note not found" });
      return;
    }
    res.status(500).json({ error: error.message });
    return;
  }

  res.json(data);
});

// POST /notes - create new note
router.post("/", async (req: Request, res: Response) => {
  const { title, content } = req.body;

  const { data, error } = await supabase
    .from("notes")
    .insert({ title, content, owner_id: req.user!.id })
    .select()
    .single();

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  res.status(201).json(data);
});

// DELETE /notes/:id - delete a note
router.delete("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;

  const { error } = await supabase
    .from("notes")
    .delete()
    .eq("id", id)
    .eq("owner_id", req.user!.id);

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  res.status(204).send();
});

export default router;

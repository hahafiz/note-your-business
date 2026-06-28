import { Router, Request, Response } from "express";
import { supabase } from "../lib/supabase";
import { requireAuth } from "../middleware/auth";

const router = Router();

// all routes require login
router.use(requireAuth);

// GET /note_collaborators/:note_id - fetch all collaborator email list for that note_id
router.get("/:note_id", async (req: Request, res: Response) => {
  const { note_id } = req.params;

  const { data, error } = await supabase
    .from("note_collaborators")
    .select("*")
    .eq("note_id", note_id);

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  res.json(data);
});

// GET /note_collaborators - fetch all logged in collaborator's notes
router.get("/", async (req: Request, res: Response) => {
  const { data, error } = await supabase
    .from("note_collaborators")
    .select("note_id, notes(*)")
    .eq("user_email", req.user!.email);

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  res.json(data);
});

// POST /note_collaborators - add new collaborator email to note_id
router.post("/:note_id", async (req: Request, res: Response) => {
  const { note_id } = req.params;
  const { user_email } = req.body;

  if (!user_email?.trim()) {
    res.status(400).json({ error: "Email address is required" });
    return;
  }

  const { data, error } = await supabase
    .from("note_collaborators")
    .insert({ note_id, user_email })
    .select()
    .single();

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  res.status(201).json(data);
});

// DELETE /note_collaborators/:note_id - delete access of a collaborator from note_id
router.delete("/:note_id", async (req: Request, res: Response) => {
  const { note_id } = req.params;
  const { user_email } = req.body;

  const { data: note, error: noteError } = await supabase
    .from("notes")
    .select("owner_id")
    .eq("id", note_id)
    .single();

  console.log("note:", note);
  console.log("noteError:", noteError);
  console.log("req.user.id:", req.user!.id);

  if (note?.owner_id !== req.user!.id) {
    res
      .status(403)
      .json({ error: "Only the note owner can remove collaborators" });
    return;
  }

  const { error } = await supabase
    .from("note_collaborators")
    .delete()
    .eq("note_id", note_id)
    .eq("user_email", user_email);

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  res.status(204).send();
});

export default router;

import { Router, Request, Response } from "express";
import { supabase } from "../lib/supabase";
import { requireAuth } from "../middleware/auth";
import { v4 as uuidv4 } from "uuid";

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
  const { token } = req.query;
  const userId = req.user!.id;
  const userEmail = req.user!.email;
  const orCondition = token
    ? `owner_id.eq.${userId},share_token.eq.${token}`
    : `owner_id.eq${userId}`;

  // step 1: try owner or token access
  const { data, error } = await supabase
    .from("notes")
    .select("*")
    .eq("id", id)
    .or(orCondition)
    .single();

  // step 2: if not found, check collaborator table
  if (error?.code === "PGRST116") {
    const { data: collabData } = await supabase
      .from("note_collaborators")
      .select("*")
      .eq("note_id", id)
      .eq("user_email", userEmail)
      .single();

    // not a collaborator
    if (!collabData) {
      res.status(404).json({ error: "Note not found" });
      return;
    }

    // IS a collaborator - fetch w/o ownership check
    const { data: sharedNote, error: sharedError } = await supabase
      .from("notes")
      .select("*")
      .eq("id", id)
      .single();

    if (sharedError) {
      res.status(500).json({ error: sharedError.message });
      return;
    }

    res.json(sharedNote);
    return;
  }

  // step 3 - some other DB error
  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  // step 4 - owner or token access succeeded
  res.json(data);
});

// POST /notes - create new note
router.post("/", async (req: Request, res: Response) => {
  const { title, content } = req.body;

  if (!title?.trim()) {
    res.status(400).json({ error: "Title is required" });
    return;
  }

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

// PATCH /notes/:id - update a note
router.patch("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, content } = req.body;

  if (!title?.trim()) {
    res.status(400).json({ error: "Title is required" });
    return;
  }

  const { data, error } = await supabase
    .from("notes")
    .update({ title, content, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("owner_id", req.user!.id) // ensure the note belongs to the logged-in user
    .select()
    .single();

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  res.json(data);
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

// POST /notes/:id/share - share a note with another user
router.post("/:id/share", async (req: Request, res: Response) => {
  const { id } = req.params;
  const { email } = req.body;

  if (!email) {
    res.status(400).json({ error: "Email is required" });
    return;
  }

  const { data: existingNote } = await supabase
    .from("notes")
    .select("share_token")
    .eq("id", id)
    .single();

  // generate a random token for sharing
  // only update if no token exists yet
  const token = existingNote?.share_token ?? uuidv4();

  const { data, error } = await supabase
    .from("notes")
    .update({ share_token: token })
    .eq("id", id)
    .eq("owner_id", req.user!.id);

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  const { error: collabError } = await supabase
    .from("note_collaborators")
    .insert({ note_id: id, user_email: email });

  if (collabError) {
    res.status(500).json({ error: collabError.message });
    return;
  }

  const baseUrl = process.env.CLIENT_URL || "http://localhost:5173";
  const shareUrl = `${baseUrl}/notes/${id}?token=${token}`;
  res.json({ shareUrl });
});

export default router;

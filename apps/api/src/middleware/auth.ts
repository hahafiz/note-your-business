// checks that user is logged in before accessing notes
import { Request, Response, NextFunction } from "express";
import { supabase } from "../lib/supabase";

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  // frontend will send the user's token in every request header
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1]; // "Bearer <token>"

  if (!token) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  // verify the token with Supabase
  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    res.status(401).json({ error: "Invalid token" });
    return;
  }

  // attach user to request so routes can use it
  req.user = data.user;
  next();
}

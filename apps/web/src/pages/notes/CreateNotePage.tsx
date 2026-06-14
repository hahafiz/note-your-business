import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import type { CreateNotePayload } from "../../types/note";
import { apiFetch } from "../../lib/api";

export default function CreateNotePage() {
  const navigate = useNavigate();

  // controlled inputs - react owns the value, not the DOM
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    // basic validation - if the title is empty, don't save
    if (!title.trim()) {
      setError("Please aedd a title before saving");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const payload: CreateNotePayload = {
        title: title.trim(),
        content: content.trim(),
      };

      await apiFetch("/notes", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      // note saved - go back to dashboard
      navigate("/dashboard");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancelClick = () => {
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md flex flex-col items-center p-8 bg-white rounded-xl shadow">
        <h1 className="text-2xl font-bold mb-6">Create New Note</h1>

        <div>
          {error && (
            <p className="text-red-500 text-sm mb-4 bg-red-50 p-3 rounded-lg">
              {error}
            </p>
          )}
          <input
            type="text"
            placeholder="Title"
            className="w-full border rounded-lg px-4 py-2 mb-4"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <textarea
            placeholder="Start writing..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={20}
            className="w-full border rounded-lg px-4 py-2 mb-4"
          ></textarea>
        </div>

        <Button
          variant="primary"
          size="lg"
          fullWidth
          className="mb-2"
          disabled={saving}
          onClick={handleSave}
        >
          {saving ? "Saving..." : "Save"}
        </Button>
        <Button
          variant="ghost"
          size="lg"
          fullWidth
          className="mb-2"
          onClick={handleCancelClick}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}

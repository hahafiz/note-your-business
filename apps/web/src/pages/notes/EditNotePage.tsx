import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { apiFetch } from "../../lib/api";
import type { Note } from "../../types/note";

export default function EditNotePage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    const fetchNote = async () => {
      try {
        const data: Note = await apiFetch(`/notes/${id}`);
        setTitle(data.title);
        setContent(data.content);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message); // surface the error
        }
      } finally {
        setLoading(false);
      }
    };

    fetchNote();
  }, [id]);

  const handleSave = async () => {
    if (!title.trim()) {
      setError("Title cannot be empty");
      return;
    }

    setSaving(true);
    setError("");

    try {
      await apiFetch(`/notes/${id}`, {
        method: "PATCH",
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
        }),
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
        <h1 className="text-2xl font-bold mb-6">Edit Note</h1>

        {loading ? (
          <p>Loading...</p>
        ) : (
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
        )}

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

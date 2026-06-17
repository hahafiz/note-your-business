import { useState, useEffect, useRef } from "react";
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
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">(
    "idle",
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const hasEdited = useRef(false);

  // fetch the note
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

  // debounce the save
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (loading || !hasEdited.current || !title.trim()) return;

      try {
        setSaveStatus("saving");
        await apiFetch(`/notes/${id}`, {
          method: "PATCH",
          body: JSON.stringify({
            title: title.trim(),
            content: content.trim(),
          }),
        });
        setSaveStatus("saved");
        setTimeout(() => {
          setSaveStatus("idle");
        }, 5000);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        }
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [title, content, id, loading]);

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

  const handleDelete = async () => {
    // TODO: replace with proper confirmation
    if (window.confirm("Delete note?")) {
      try {
        await apiFetch(`/notes/${id}`, {
          method: "DELETE",
        });

        // note deleted - return to dashboard
        navigate("/dashboard");
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        }
      }
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
              onChange={(e) => {
                hasEdited.current = true;
                setTitle(e.target.value);
              }}
            />
            <textarea
              placeholder="Start writing..."
              value={content}
              onChange={(e) => {
                hasEdited.current = true;
                setContent(e.target.value);
              }}
              rows={20}
              className="w-full border rounded-lg px-4 py-2 mb-4"
            ></textarea>
          </div>
        )}

        {saveStatus === "saving" && (
          <span className="text-xs text-gray-400">Saving...</span>
        )}
        {saveStatus === "saved" && (
          <span className="text-xs text-green-600 mb-4 p-2 rounded bg-green-100">
            Saved
          </span>
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
          variant="danger"
          size="lg"
          fullWidth
          className="mb-2"
          onClick={handleDelete}
        >
          Delete
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

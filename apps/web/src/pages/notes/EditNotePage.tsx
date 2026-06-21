import { useState, useEffect, useRef, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { apiFetch } from "../../lib/api";
import type { Note } from "../../types/note";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Collaboration from "@tiptap/extension-collaboration";

export default function EditNotePage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [title, setTitle] = useState("");
  const [initialContent, setInitialContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">(
    "idle",
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastEditedAt, setLastEditedAt] = useState(0);
  const hasEdited = useRef(false);
  const hasInitialized = useRef(false);
  const saveStatusTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // create doc one (survives re-renders)
  const doc = useMemo(() => new Y.Doc(), []);

  // create provider inside useEffect, so cleanup can run on unmount
  useEffect(() => {
    if (!id) return;

    const wsProvider = new WebsocketProvider("ws://localhost:1234", id, doc);

    // cleanup when unmounts
    return () => {
      wsProvider.disconnect();
    };
  }, [id, doc]);

  const editor = useEditor({
    editorProps: {
      attributes: {
        class: "w-full border rounded-lg px-4 py-2 mb-4 min-h-[400px]",
      },
    },
    onUpdate: () => {
      hasEdited.current = true;
      setLastEditedAt(Date.now());
    },
    extensions: [
      StarterKit.configure({
        history: false,
      }),
      Collaboration.configure({ document: doc }),
    ],
  });

  // fetch the note
  useEffect(() => {
    if (!id) return;

    const fetchNote = async () => {
      try {
        const data: Note = await apiFetch(`/notes/${id}`);
        setTitle(data.title);
        setInitialContent(data.content);
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

  useEffect(() => {
    if (!hasInitialized.current) {
      if (!editor) return;
      if (loading) return;

      editor.commands.setContent(initialContent);
      hasEdited.current = false;
      hasInitialized.current = true;
    }
  }, [editor, loading, initialContent]);

  // debounce the save
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (loading || !hasEdited.current || !title.trim() || !editor) return;

      const htmlContent = editor.getHTML();
      setError("");

      try {
        setSaveStatus("saving");
        await apiFetch(`/notes/${id}`, {
          method: "PATCH",
          body: JSON.stringify({
            title: title.trim(),
            content: htmlContent,
          }),
        });
        setSaveStatus("saved");
        if (saveStatusTimerRef.current)
          clearTimeout(saveStatusTimerRef.current);
        saveStatusTimerRef.current = setTimeout(() => {
          setSaveStatus("idle");
        }, 5000);
      } catch (err: unknown) {
        setSaveStatus("idle");
        if (err instanceof Error) {
          setError(err.message);
        }
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [title, lastEditedAt, id, loading, editor]);

  useEffect(() => {
    return () => {
      if (saveStatusTimerRef.current) clearTimeout(saveStatusTimerRef.current);
    };
  }, []);

  const handleSave = async () => {
    if (!editor || !id) return;
    if (!title.trim()) {
      setError("Title cannot be empty");
      return;
    }

    const htmlContent = editor.getHTML();

    setSaving(true);
    setError("");

    try {
      await apiFetch(`/notes/${id}`, {
        method: "PATCH",
        body: JSON.stringify({
          title: title.trim(),
          content: htmlContent,
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
    if (!id) return;

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
        <Button variant="outline" size="lg" fullWidth className="mb-2">
          Share
        </Button>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="w-full">
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
            <EditorContent editor={editor} />
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

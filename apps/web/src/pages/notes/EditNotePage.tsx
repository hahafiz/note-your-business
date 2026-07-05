import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiFetch } from "../../lib/api";
import type { Note } from "../../types/note";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Collaboration from "@tiptap/extension-collaboration";
import { TaskItem, TaskList } from "@tiptap/extension-list";
import { Button } from "../../components/ui/Button";
import ModalSharing from "../modal/ModalSharing";
import { useYjsProvider } from "../../hooks/useYjsProvider";
import { useAwarenessPresence } from "../../hooks/useAwarenessPresence";
import { useAuth } from "../../hooks/useAuth";

export default function EditNotePage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const currentUser = user?.email ? { name: user.email } : null;

  // extract shared raw Yjs sync and presence logic
  const { doc, provider } = useYjsProvider(id);
  const { activeUsers } = useAwarenessPresence(provider, user?.email);

  const [title, setTitle] = useState("");
  const [initialContent, setInitialContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">(
    "idle",
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastEditedAt, setLastEditedAt] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const hasEdited = useRef(false);
  const hasInitialized = useRef(false);
  const saveStatusTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const editor = useEditor({
    shouldRerenderOnTransaction: true,
    editorProps: {
      attributes: {
        class:
          "w-full border rounded-lg px-4 py-2 my-4 max-h-[50vh] overflow-scroll",
      },
    },
    onUpdate: () => {
      hasEdited.current = true;
      setLastEditedAt(Date.now());
    },
    extensions: [
      StarterKit.configure({
        undoRedo: false,
      }),
      Collaboration.configure({ document: doc }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
    ],
    content: `
        <ul data-type="taskList">
          <li data-type="taskItem" data-checked="true">A list item</li>
          <li data-type="taskItem" data-checked="false">And another one</li>
        </ul>
      `,
  });

  // fetch initial note document
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

  // load backend content into the editor context once ready
  useEffect(() => {
    if (!hasInitialized.current) {
      if (!editor) return;
      if (loading) return;

      editor.commands.setContent(initialContent);
      hasEdited.current = false;
      hasInitialized.current = true;
    }
  }, [editor, loading, initialContent]);

  // debounce the auto-save
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

  if (!id) return null;
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md h-screen sm:h-auto lg:h-fit flex flex-col items-center p-4 bg-white rounded-xl shadow">
        <h1 className="text-2xl font-bold mb-6">Edit Note</h1>

        {activeUsers.length > 1 && (
          <div className="flex gap-1 mb-4 items-center self-start text-xs text-gray-500">
            <span className="font-semibold">Active editors:</span>
            {activeUsers.map((user) => (
              <span
                key={user.clientId}
                className="px-2 py-0.5 rounded-full border text-white"
                style={{ backgroundColor: user.color || "#ccc" }}
              >
                {user.name}
              </span>
            ))}
          </div>
        )}

        <Button
          variant="outline"
          size="lg"
          fullWidth
          className="mb-2"
          onClick={() => setIsModalOpen(true)}
        >
          Share
        </Button>
        <ModalSharing
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={`Share ${title}`}
          id={id}
        />

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
            <div>
              <div className="flex gap-1 flex-wrap">
                <Button
                  variant="secondary"
                  className={editor.isActive("taskList") ? "is-active" : ""}
                  onClick={() => editor.chain().toggleTaskList().run()}
                >
                  Toggle task list
                </Button>
                <Button
                  variant="secondary"
                  disabled={!editor.can().splitListItem("taskItem")}
                  onClick={() =>
                    editor.chain().focus().splitListItem("taskItem").run()
                  }
                >
                  Split task item
                </Button>
                <Button
                  variant="secondary"
                  disabled={!editor.can().sinkListItem("taskItem")}
                  onClick={() =>
                    editor.chain().focus().sinkListItem("taskItem").run()
                  }
                >
                  Sink list item
                </Button>
                <Button
                  variant="secondary"
                  disabled={!editor.can().liftListItem("taskItem")}
                  onClick={() =>
                    editor.chain().focus().liftListItem("taskItem").run()
                  }
                >
                  Lift list item
                </Button>
              </div>
            </div>

            <EditorContent editor={editor} />
          </div>
        )}

        <Button
          variant="primary"
          size="lg"
          fullWidth
          className="mb-2"
          disabled={saving || saveStatus === "saving"}
          onClick={handleSave}
        >
          {saving || saveStatus === "saving"
            ? "Saving..."
            : saveStatus === "saved"
              ? "Saved"
              : "Save"}
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

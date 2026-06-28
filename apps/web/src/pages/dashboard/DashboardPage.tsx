import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { apiFetch } from "../../lib/api";
import { useAuth } from "../../hooks/useAuth";
import type { Note } from "../../types/note";

export default function DashboardPage() {
  const { user, signOut } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loadingNotes, setLoadingNotes] = useState(true);
  const [loadingCollab, setLoadingCollab] = useState(true);
  const [error, setError] = useState("");
  const [collabNotes, setCollabNotes] = useState<Note[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const fetchNotes = async () => {
      try {
        const data = (await apiFetch("/notes")) as Note[];
        setNotes(data);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        }
      } finally {
        setLoadingNotes(false);
      }
    };

    const fetchCollaboratorsNotes = async () => {
      try {
        const data = await apiFetch("/note_collaborators");
        setCollabNotes(data.map((item) => item.notes));
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        }
      } finally {
        setLoadingCollab(false);
      }
    };

    fetchNotes();
    fetchCollaboratorsNotes();
  }, [user, navigate]);

  const handleNoteClick = (id: string) => {
    navigate(`/notes/${id}`);
  };

  const handleNewNoteClick = () => {
    navigate(`/notes/new`);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-UK", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md flex flex-col items-center p-8 bg-white rounded-xl shadow">
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
        <p className="text-gray-500 mb-6">Welcome, {user?.email}</p>

        <Button
          variant="primary"
          size="lg"
          fullWidth
          leftIcon="➕"
          className="mb-6"
          onClick={handleNewNoteClick}
        >
          New Note
        </Button>

        {loadingNotes ? (
          <p className="text-gray-500 text-sm mb-4 bg-gray-50 p-3 rounded-lg">
            Loading...
          </p>
        ) : error ? (
          <p className="text-red-500 text-sm mb-4 bg-red-50 p-3 rounded-lg">
            {error}
          </p>
        ) : notes.length === 0 ? (
          <p className="text-gray-500 text-sm mb-4 bg-gray-50 p-3 rounded-lg">
            No notes yet. Create your first one!
          </p>
        ) : (
          <ul className="w-full mb-6">
            {notes.map((note) => (
              <li
                key={note.id}
                className="mb-4 pb-4 border-b border-gray-200 cursor-pointer flex justify-between items-baseline"
                onClick={() => {
                  handleNoteClick(note.id);
                }}
              >
                <span className="font-medium">{note.title}</span>
                <span className="text-gray-400 text-sm">
                  {formatDate(note.created_at)}
                </span>
              </li>
            ))}
          </ul>
        )}

        {(loadingCollab || error || collabNotes.length > 0) && (
          <>
            <h4 className="font-medium mb-6">Shared Notes</h4>
            {loadingCollab ? (
              <p className="text-gray-500 text-sm mb-4 bg-gray-50 p-3 rounded-lg">
                Loading...
              </p>
            ) : error ? (
              <p className="text-red-500 text-sm mb-4 bg-red-50 p-3 rounded-lg">
                {error}
              </p>
            ) : collabNotes.length === 0 ? (
              <p className="text-gray-500 text-sm mb-4 bg-gray-50 p-3 rounded-lg">
                No notes shared
              </p>
            ) : (
              <ul className="w-full mb-6">
                {collabNotes.map((note) => (
                  <li
                    key={note.id}
                    className="mb-4 pb-4 border-b border-gray-200 cursor-pointer flex justify-between items-baseline"
                    onClick={() => {
                      handleNoteClick(note.id);
                    }}
                  >
                    <span className="font-medium">{note.title}</span>
                    <span className="text-gray-400 text-sm">
                      {formatDate(note.created_at)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}

        <Button variant="secondary" size="lg" fullWidth onClick={signOut}>
          Logout
        </Button>
      </div>
    </div>
  );
}

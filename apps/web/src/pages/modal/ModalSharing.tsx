import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import { useState, useEffect } from "react";
import { apiFetch } from "../../lib/api";
import type { CollabList } from "../../types/note";

interface ModalSharing {
  isOpen: boolean;
  onClose: () => void;
  id: string;
  title?: string;
}

export default function ModalSharing({
  isOpen,
  onClose,
  title,
  id,
}: ModalSharing) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [sharing, setSharing] = useState(false);
  const [success, setSuccess] = useState("");
  const [email, setEmail] = useState("");
  const [collabList, setCollabList] = useState<CollabList[]>([]);

  useEffect(() => {
    if (!isOpen) return;

    const fetchCollabList = async () => {
      try {
        const list: CollabList[] = await apiFetch(`/note_collaborators/${id}`);
        setCollabList(list);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCollabList();
  }, [id, isOpen]);

  const handleShare = async () => {
    if (!email.trim()) {
      setError("Please fill email address");
      return;
    }

    setSharing(true);
    setError("");

    try {
      await apiFetch(`/note_collaborators/${id}`, {
        method: "POST",
        body: JSON.stringify({
          user_email: email,
        }),
      });
      const list: CollabList[] = await apiFetch(`/note_collaborators/${id}`);
      setCollabList(list);
      setEmail("");
      setSuccess("Collaborator added!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      }
    } finally {
      setSharing(false);
    }
  };

  const handleRemoveCollab = async (user_email: string) => {
    setError("");
    try {
      await apiFetch(`/note_collaborators/${id}`, {
        method: "DELETE",
        body: JSON.stringify({ user_email }),
      });

      const list: CollabList[] = await apiFetch(`/note_collaborators/${id}`);
      setCollabList(list);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      }
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`${title}`}>
      <div className="flex gap-2 my-2">
        <input
          type="email"
          placeholder="Enter email"
          className="w-full rounded-md border px-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Button
          variant="primary"
          size="md"
          className="px-2"
          disabled={sharing}
          onClick={handleShare}
        >
          {sharing ? "Sharing..." : "Share"}
        </Button>
      </div>
      {loading && <p>Loading</p>}
      {success && (
        <p className="text-green-600 text-sm mb-4 bg-green-50 p-3 rounded-lg">
          {success}
        </p>
      )}
      {error && (
        <p className="text-red-500 text-sm mb-4 bg-red-50 p-3 rounded-lg">
          {error}
        </p>
      )}

      <div className="pt-4">
        <h6 className="text-sm font-medium text-gray-600 pb-2">
          Collaborator list
        </h6>
        <ul className="w-full mb-6">
          {collabList.map((email) => (
            <li
              key={email.id}
              className="mb-2 border-gray-200 cursor-pointer flex justify-between items-baseline"
            >
              {email.user_email}
              <Button
                variant="ghost"
                className="text-red-500"
                onClick={() => handleRemoveCollab(email.user_email)}
              >
                Remove
              </Button>
            </li>
          ))}
        </ul>
      </div>
    </Modal>
  );
}

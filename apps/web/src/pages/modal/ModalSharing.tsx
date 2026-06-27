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

// TODO: send invitation to collaborator (email or link)
// TODO: remove collaborator

export default function ModalSharing({
  isOpen,
  onClose,
  title,
  id,
}: ModalSharing) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [sharing, setSharing] = useState(false);
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (!isOpen) return;

    const fetchCollabList = async () => {
      try {
        const list: CollabList[] = await apiFetch(`/note_collaborators/${id}`);
        // does this apiFetch will return an array if there are multiple values ?
        console.log("list: ", list);
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
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      }
    } finally {
      setSharing(false);
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
        <Button
          variant="secondary"
          size="md"
          className="px-2 whitespace-nowrap"
        >
          Copy Link
        </Button>
      </div>
      {loading ? (
        <p>Loading...</p>
      ) : (
        error && (
          <p className="text-red-500 text-sm mb-4 bg-red-50 p-3 rounded-lg">
            {error}
          </p>
        )
      )}

      <div className="pt-2">
        <h6 className="text-sm font-medium text-gray-600 pb-2">
          Collaborator list
        </h6>
        <ul>
          <li>test@email.com</li>
          <li>test@email.com</li>
          <li>test@email.com</li>
        </ul>
      </div>
    </Modal>
  );
}

import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { apiFetch } from "../../lib/api";
import { useAuth } from "../../hooks/useAuth";

export default function DashboardPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const testApi = async () => {
    try {
      const data = await apiFetch("/health");
      console.log("API response:", data);
      alert("API connected!");
    } catch (err) {
      console.error(err);
      alert("API failed!");
    }
  };

  const handleNoteClick = (id: number) => {
    navigate(`/dashboard/notes/${id}`);
  };

  const noteLists = [
    {
      id: 1,
      title: "First Note",
      content: "First Note Content",
    },
    {
      id: 2,
      title: "Second Note",
      content: "Second Note Content",
    },
    {
      id: 3,
      title: "Third Note",
      content: "Third Note Content",
    },
  ];
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md flex flex-col items-center p-8 bg-white rounded-xl shadow">
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
        <p className="text-gray-500 mb-6">Welcome, {user?.email}</p>

        <ul className="w-full mb-6">
          {noteLists.map((note) => (
            <li
              className="mb-4 pb-4 border-b border-gray-200"
              onClick={() => handleNoteClick(note.id)}
            >
              {note.title}
            </li>
          ))}
        </ul>

        <div className="flex gap-4">
          <Button variant="primary" size="lg" onClick={testApi}>
            Test API connection
          </Button>
          <Button variant="primary" size="lg" fullWidth onClick={signOut}>
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
}

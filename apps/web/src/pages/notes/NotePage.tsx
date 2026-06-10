import { useNavigate } from "react-router-dom";
interface NotePageProps {
  title: string;
  content: string;
}

export default function NotePage({ title, content }: NotePageProps) {
  const navigate = useNavigate();
  const handleBackClick = () => {
    navigate("/dashboard");
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md flex flex-col items-center p-8 border-red-500 bg-white rounded-xl shadow">
        <h1 className="text-2xl font-bold mb-6">{title}</h1>
        <textarea className="w-full border rounded-lg px-4 py-2 mb-4">
          {content}
        </textarea>
        <button className="w-full bg-black text-white py-2 mb-6 rounded-xl">
          Save
        </button>
        <button
          className="w-full bg-black text-white py-2 mb-6 rounded-xl"
          onClick={handleBackClick}
        >
          Back
        </button>
      </div>
    </div>
  );
}

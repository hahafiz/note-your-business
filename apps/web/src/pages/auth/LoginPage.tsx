import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const navigate = useNavigate();

  const handleRegisterClick = () => {
    navigate("/register");
  };

  const handleLoginClick = () => {
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md flex flex-col items-center p-8 border-red-500 bg-white rounded-xl shadow">
        <h1 className="text-2xl font-bold mb-6">Login</h1>
        <input
          type="text"
          placeholder="username"
          className="w-full border rounded-lg px-4 py-2 mb-4"
        />
        <input
          type="password"
          placeholder="password"
          className="w-full border rounded-lg px-4 py-2 mb-4"
        />
        <button
          className="w-full bg-black text-white py-2 mb-6 rounded-xl"
          onClick={handleLoginClick}
        >
          Login
        </button>
        <p className="text-center text-sm mt-4 text-gray-500">
          No account?{" "}
          <button
            className="text-black font-medium"
            onClick={handleRegisterClick}
          >
            Register
          </button>
        </p>
      </div>
    </div>
  );
}

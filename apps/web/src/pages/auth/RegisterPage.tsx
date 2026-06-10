import { useNavigate } from "react-router-dom";

export default function RegisterPage() {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md flex flex-col items-center p-8 border-red-500 bg-white rounded-xl shadow">
        <h1 className="text-2xl font-bold mb-6">Register</h1>
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
          Register
        </button>
        <p className="text-center text-sm mt-4 text-gray-500">
          Have an account?{" "}
          <button className="text-black font-medium" onClick={handleLoginClick}>
            Login
          </button>
        </p>
      </div>
    </div>
  );
}

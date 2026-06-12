import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";

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
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onClick={handleLoginClick}
        >
          Register
        </Button>
        <p className="text-center text-sm mt-4 text-gray-500">
          Have an account?{" "}
          <Button variant="ghost" size="sm" onClick={handleLoginClick}>
            Login
          </Button>
        </p>
      </div>
    </div>
  );
}

import { useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { useAuth } from "../../hooks/useAuth";
import HCaptcha from "@hcaptcha/react-hcaptcha";

export default function LoginPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const captchaRef = useRef<HCaptcha>(null);

  const [searchParams] = useSearchParams();
  const justRegistered = searchParams.get("registered") === "true";

  const handleSubmit = async () => {
    if (!captchaToken) {
      setError("Please complete the captcha");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await signIn(email, password, captchaToken);
      navigate("/dashboard");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      }
      setCaptchaToken(null);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterClick = () => {
    navigate("/register");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md flex flex-col items-center p-8 border-red-500 bg-white rounded-xl shadow">
        <h1 className="text-2xl font-bold mb-6">Login</h1>

        {error && (
          <p className="text-red-500 text-sm mb-4 bg-red-50 p-3 rounded-lg">
            {error}
          </p>
        )}

        {justRegistered && (
          <p className="text-gray-800 text-sm mb-4 bg-gray-100 p-3 rounded-lg">
            Check your email for verification before logging in.
          </p>
        )}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border rounded-lg px-4 py-2 mb-4"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border rounded-lg px-4 py-2 mb-4"
        />

        <HCaptcha
          sitekey={import.meta.env.VITE_HCAPTCHA_SITE_KEY}
          onVerify={(token) => setCaptchaToken(token)}
          ref={captchaRef}
        />

        <Button
          variant="primary"
          size="lg"
          fullWidth
          onClick={handleSubmit}
          disabled={loading}
          className="mt-6"
        >
          {loading ? "Logging in..." : "Log in"}
        </Button>

        <p className="text-center text-sm mt-4 text-gray-500">
          No account?{" "}
          <Button variant="ghost" size="sm" onClick={handleRegisterClick}>
            Register
          </Button>
        </p>
      </div>
    </div>
  );
}

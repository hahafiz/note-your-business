import { useNavigate } from "react-router-dom";

export default function DashboardPage() {
  const navigate = useNavigate();

  const handleLogoutClick = () => {
    navigate("/login");
  };
  return (
    <div>
      <h1>Dashboard</h1>
      <button onClick={handleLogoutClick}>Logout</button>
    </div>
  );
}

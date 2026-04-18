import { useNavigate } from "react-router-dom";
import { AuthShell } from "./AuthShell";

export default function Login() {
  const navigate = useNavigate();
  return <AuthShell mode="signin" onSubmit={() => navigate("/app/analyze")} />;
}

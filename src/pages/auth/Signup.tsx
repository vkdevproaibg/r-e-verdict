import { useNavigate } from "react-router-dom";
import { AuthShell } from "./AuthShell";

export default function Signup() {
  const navigate = useNavigate();
  return <AuthShell mode="signup" onSubmit={() => navigate("/app/analyze")} />;
}

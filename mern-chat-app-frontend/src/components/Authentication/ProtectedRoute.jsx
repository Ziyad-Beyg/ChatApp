import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  let navigate = useNavigate();

  const token = localStorage.getItem("accessToken");

  useEffect(() => {
    if (token === null) {
      navigate("/", { replace: true });
    }
  }, []);

  return children;
};

export default ProtectedRoute;

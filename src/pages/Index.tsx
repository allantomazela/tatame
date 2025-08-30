import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redireciona para login
    navigate("/login");
  }, [navigate]);

  return null;
};

export default Index;

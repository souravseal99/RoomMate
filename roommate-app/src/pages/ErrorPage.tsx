import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

function ErrorPage() {
  const navigate = useNavigate();

  const handleBackToHome = () => navigate("/login");
  return (
    <>
      <div>Page not found</div>
      <Button variant="link" onClick={handleBackToHome}>
        Back to Home
      </Button>
    </>
  );
}

export default ErrorPage;

import { useNavigate } from "react-router-dom";
import { useMousePosition } from "@/hooks/useMousePosition";
import { useAuth } from "@/contexts/AuthContext";
import LoginForm from "@/components/auth/LoginForm";
import { Link } from "react-router-dom";

const LoginPage = () => {
  const { elementRef } = useMousePosition();
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (data: { email: string; password: string }) => {
    try {
      await login(data.email, data.password);
      navigate("/");
    } catch (error: unknown) {
      console.error("Error en login:", error);
      // El error ya se maneja en el AuthContext
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-300px)] px-4 my-12 md:my-12">
      <h1
        className="mb-8 md:mb-12 font-poppins font-bold text-5xl md:text-6xl leading-tight text-transparent bg-clip-text gradient-text"
      >
        Login
      </h1>
      <div
        className="border border-[#515d53] rounded-lg md:w-[65vw] w-full max-w-2xl mouse-border-effect"
        ref={elementRef}
      >
        <div className="p-4 card-with-light-effect">
          <LoginForm handleSubmit={handleSubmit} />
          <p className="flex flex-col items-center justify-center gap-2 mt-8 text-center sm:justify-center">
            <span className="text-[#939cab] text-sm">¿Has olvidado tu contraseña?</span>
            <Link
              to="/forgot-password"
              className="block font-bold text-[#ff5da2] hover:text-[#ff7ab5] transition-colors text-sm"
            >
              Recupera contraseña
            </Link>
          </p>
        </div>
      </div>
      <p className="flex flex-col items-center justify-center gap-2 mt-12 text-center sm:justify-center md:flex-row">
        <span className="text-[#939cab]">¿Aún no estás registrado?</span>
        <Link
          to="/register"
          className="block font-bold text-[#ff5da2] hover:text-[#ff7ab5] transition-colors"
        >
          Regístrate
        </Link>
      </p>
    </div>
  );
};

export default LoginPage;

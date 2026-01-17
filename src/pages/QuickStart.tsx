import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { projectId, publicAnonKey } from "@/utils/supabase/info";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-39ee6a8c`;

export const QuickStart: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [step, setStep] = useState<"choice" | "register" | "login">("choice");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form data
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
  });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // 1. Crear usuario
      const signupResponse = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({
          name: formData.name,
          username: formData.username,
          email: formData.email,
          password: formData.password,
        }),
      });

      if (!signupResponse.ok) {
        const errorData = await signupResponse.json();
        throw new Error(errorData.error || "Error al registrar usuario");
      }

      const { user, session } = await signupResponse.json();

      // 2. Login automático
      await login(formData.email, formData.password);

      setSuccess("✅ ¡Cuenta creada exitosamente! Redirigiendo...");

      setTimeout(() => {
        navigate("/perfil");
      }, 1500);
    } catch (err: unknown) {
      console.error("Error en registro:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Error al crear cuenta";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await login(formData.email, formData.password);
      setSuccess("✅ ¡Login exitoso! Redirigiendo...");

      setTimeout(() => {
        navigate("/");
      }, 1000);
    } catch (err: unknown) {
      console.error("Error en login:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Error al iniciar sesión";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const createDemoUser = async () => {
    const demoEmail = `demo_${Date.now()}@pairconnect.dev`;
    const demoUsername = `demo${Date.now()}`;

    setFormData({
      name: "Usuario Demo",
      username: demoUsername,
      email: demoEmail,
      password: "demo123456",
    });

    setStep("register");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-[var(--color-dark-card)] rounded-[5px] border border-[#65dde6] p-8 shadow-[0_0_20px_rgba(101,221,230,0.3)]">
          {/* Logo */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-transparent bg-gradient-to-r from-[#4ad3e5] to-[#ff5da2] bg-clip-text font-['Source_Code_Pro'] mb-2">
              Pair Connect
            </h1>
            <p className="text-[#8fa6bc] text-sm font-['Source_Code_Pro']">
              🚀 Quick Start
            </p>
          </div>

          {/* Choice Step */}
          {step === "choice" && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-[#4ad3e5] mb-4 font-['Source_Code_Pro']">
                ¿Qué quieres hacer?
              </h2>

              <Button
                onClick={() => setStep("register")}
                className="w-full bg-gradient-to-r from-[#4ad3e5] to-[#ff5da2] hover:opacity-90"
              >
                📝 Crear nueva cuenta
              </Button>

              <Button
                onClick={createDemoUser}
                variant="outline"
                className="w-full border-[#4ad3e5] text-[#4ad3e5] hover:bg-[#4ad3e5]/10"
              >
                ⚡ Crear cuenta demo rápida
              </Button>

              <Button
                onClick={() => setStep("login")}
                variant="outline"
                className="w-full border-[#ff5da2] text-[#ff5da2] hover:bg-[#ff5da2]/10"
              >
                🔑 Ya tengo cuenta
              </Button>

              <div className="mt-6 pt-6 border-t border-[#29303d]">
                <p className="text-[#8fa6bc] text-xs text-center font-['Source_Code_Pro']">
                  💡 Tip: Usa la cuenta demo para probar rápidamente
                </p>
              </div>
            </div>
          )}

          {/* Register Step */}
          {step === "register" && (
            <form
              onSubmit={handleRegister}
              className="space-y-4"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-[#4ad3e5] font-['Source_Code_Pro']">
                  Crear Cuenta
                </h2>
                <button
                  type="button"
                  onClick={() => setStep("choice")}
                  className="cursor-pointer text-[#8fa6bc] hover:text-[#4ad3e5] text-sm"
                >
                  ← Volver
                </button>
              </div>

              <div>
                <label className="block text-[#8fa6bc] text-sm mb-2 font-['Source_Code_Pro']">
                  Nombre completo
                </label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Ana García"
                  required
                  className="bg-[#0b0c10] border-[#29303d] text-white"
                />
              </div>

              <div>
                <label className="block text-[#8fa6bc] text-sm mb-2 font-['Source_Code_Pro']">
                  Username
                </label>
                <Input
                  type="text"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  placeholder="ana_dev"
                  required
                  className="bg-[#0b0c10] border-[#29303d] text-white"
                />
              </div>

              <div>
                <label className="block text-[#8fa6bc] text-sm mb-2 font-['Source_Code_Pro']">
                  Email
                </label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="ana@example.com"
                  required
                  className="bg-[#0b0c10] border-[#29303d] text-white"
                />
              </div>

              <div>
                <label className="block text-[#8fa6bc] text-sm mb-2 font-['Source_Code_Pro']">
                  Password
                </label>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  placeholder="Mínimo 6 caracteres"
                  required
                  minLength={6}
                  className="bg-[#0b0c10] border-[#29303d] text-white"
                />
              </div>

              {error && (
                <div className="bg-[#ff5da2]/10 border border-[#ff5da2] rounded p-3">
                  <p className="text-[#ff5da2] text-sm font-['Source_Code_Pro']">
                    ❌ {error}
                  </p>
                </div>
              )}

              {success && (
                <div className="bg-[#4ad3e5]/10 border border-[#4ad3e5] rounded p-3">
                  <p className="text-[#4ad3e5] text-sm font-['Source_Code_Pro']">
                    {success}
                  </p>
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#4ad3e5] to-[#ff5da2] hover:opacity-90"
              >
                {loading ? "⏳ Creando cuenta..." : "🚀 Crear cuenta"}
              </Button>
            </form>
          )}

          {/* Login Step */}
          {step === "login" && (
            <form
              onSubmit={handleLogin}
              className="space-y-4"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-[#4ad3e5] font-['Source_Code_Pro']">
                  Iniciar Sesión
                </h2>
                <button
                  type="button"
                  onClick={() => setStep("choice")}
                  className="cursor-pointer text-[#8fa6bc] hover:text-[#4ad3e5] text-sm"
                >
                  ← Volver
                </button>
              </div>

              <div>
                <label className="block text-[#8fa6bc] text-sm mb-2 font-['Source_Code_Pro']">
                  Email
                </label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="tu@email.com"
                  required
                  className="bg-[#0b0c10] border-[#29303d] text-white"
                />
              </div>

              <div>
                <label className="block text-[#8fa6bc] text-sm mb-2 font-['Source_Code_Pro']">
                  Password
                </label>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  placeholder="Tu password"
                  required
                  className="bg-[#0b0c10] border-[#29303d] text-white"
                />
              </div>

              {error && (
                <div className="bg-[#ff5da2]/10 border border-[#ff5da2] rounded p-3">
                  <p className="text-[#ff5da2] text-sm font-['Source_Code_Pro']">
                    ❌ {error}
                  </p>
                </div>
              )}

              {success && (
                <div className="bg-[#4ad3e5]/10 border border-[#4ad3e5] rounded p-3">
                  <p className="text-[#4ad3e5] text-sm font-['Source_Code_Pro']">
                    {success}
                  </p>
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#ff5da2] to-[#4ad3e5] hover:opacity-90"
              >
                {loading ? "⏳ Iniciando sesión..." : "🔑 Iniciar sesión"}
              </Button>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <a
            href="/"
            className="text-[#8fa6bc] hover:text-[#4ad3e5] text-sm font-['Source_Code_Pro']"
          >
            ← Volver al inicio
          </a>
        </div>
      </div>
    </div>
  );
};

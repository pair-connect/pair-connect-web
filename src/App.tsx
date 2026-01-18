import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Home } from "@/pages/Home";
import { SessionDetail } from "@/pages/SessionDetail";
import { Team } from "@/pages/Team";
import { QuickStart } from "@/pages/QuickStart";
import { Diagnostics } from "@/pages/Diagnostics";
import { Profile } from "@/pages/Profile";
import { MyProjects } from "@/pages/MyProjects";
import { CreateProject } from "@/pages/CreateProject";
import { ProjectDetail } from "@/pages/ProjectDetail";
import { CreateSession } from "@/pages/CreateSession";
import { ProjectRequests } from "@/pages/ProjectRequests";
import { About } from "@/pages/About";
import { Community } from "@/pages/Community";
import LoginPage from "@/pages/Login";
import RegisterPage from "@/pages/Register";
import ScrollToTop from "@/components/shared/ScrollToTop";

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <ScrollToTop />
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1">
              <Routes>
                <Route
                  path="/"
                  element={<Home />}
                />
                <Route
                  path="/sesion/:id"
                  element={<SessionDetail />}
                />
                <Route
                  path="/sobre-el-equipo"
                  element={<Team />}
                />
                <Route
                  path="/pair-programming"
                  element={<About />}
                />
                <Route
                  path="/comunidad"
                  element={<Community />}
                />
                <Route
                  path="/login"
                  element={<LoginPage />}
                />
                <Route
                  path="/register"
                  element={<RegisterPage />}
                />
                <Route
                  path="/perfil/:id"
                  element={<Profile />}
                />
                <Route
                  path="/mi-perfil"
                  element={<Profile />}
                />
                <Route
                  path="/mis-proyectos"
                  element={<MyProjects />}
                />
                <Route
                  path="/proyectos/nuevo"
                  element={<CreateProject />}
                />
                <Route
                  path="/proyectos/:id"
                  element={<ProjectDetail />}
                />
                <Route
                  path="/proyectos/:id/editar"
                  element={<CreateProject />}
                />
                <Route
                  path="/proyectos/:projectId/nueva-sesion"
                  element={<CreateSession />}
                />
                <Route
                  path="/proyectos/:id/solicitudes"
                  element={<ProjectRequests />}
                />
                <Route
                  path="/quick-start"
                  element={<QuickStart />}
                />
                <Route
                  path="/diagnostics"
                  element={<Diagnostics />}
                />
              </Routes>
            </main>
            <Footer />
          </div>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;

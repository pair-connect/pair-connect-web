import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/layout/Logo";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/Button";
import { ModeToggle } from "@/components/ui/ModeToggle";

export const Navbar: React.FC = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { path: "/", label: "Home" },
    { path: "/comunidad", label: "Comunidad" },
    { path: "/sobre-el-equipo", label: "Equipo" },
    { path: "/pair-programming", label: "Sobre Pair Connect" },
    ...(isAuthenticated && user
      ? [
          { path: `/perfil/${user.id}`, label: "Mi perfil" },
          { path: "/mis-proyectos", label: "Mis proyectos" },
        ]
      : []),
  ];

  const isActive = (path: string) => location.pathname === path;

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  return (
    <nav className="bg-[var(--color-dark-bg)] border-b border-[var(--color-dark-border)] shadow-lg shadow-[#4ad3e5]/20 sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link
            to="/"
            className="shrink-0"
            aria-label="Ir a inicio"
          >
            <Logo />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-base font-medium transition-colors duration-200 ${
                  isActive(link.path)
                    ? "text-[#4ad3e5] font-bold"
                    : "text-[var(--color-light)] hover:text-[#4ad3e5]"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <ModeToggle />

            {/* Auth Button */}
            {isAuthenticated ? (
              <Button
                onClick={logout}
                variant="primary"
                size="sm"
                className="hidden lg:block"
              >
                Log Out
              </Button>
            ) : (
              <Button
                onClick={() => navigate("/login")}
                variant="primary"
                size="sm"
                className="hidden lg:block"
              >
                Login
              </Button>
            )}

            {/* Mobile/Tablet Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className="cursor-pointer lg:hidden p-2 text-[var(--color-light)] hover:text-[#4ad3e5] transition-colors rounded-md hover:bg-accent"
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile/Tablet Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-[var(--color-dark-border)]">
            <div className="flex flex-col space-y-3">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                    isActive(link.path)
                      ? "bg-[#4ad3e5]/20 text-[#4ad3e5] font-bold"
                      : "text-[var(--color-light)] hover:bg-accent/50 hover:text-[#4ad3e5]"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              {isAuthenticated ? (
                <Button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  variant="primary"
                  size="sm"
                  className="mx-4"
                >
                  Log Out
                </Button>
              ) : (
                <Button
                  onClick={() => {
                    navigate("/login");
                    setMobileMenuOpen(false);
                  }}
                  variant="primary"
                  size="sm"
                  className="mx-4"
                >
                  Login
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

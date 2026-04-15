import React from "react";
import { Instagram, Youtube } from "lucide-react";
import { Link } from "react-router-dom";
import logoSvg from "@/assets/images/logos/logo.svg";

const LinkedInIcon = ({ className }: { className?: string }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden
  >
    <g clipPath="url(#linkedin-clip)">
      <path
        d="M19.65 3H4.35C3.6 3 3 3.6 3 4.275V19.65C3 20.325 3.6 20.925 4.35 20.925H19.65C20.4 20.925 21 20.325 21 19.65V4.275C21 3.6 20.4 3 19.65 3ZM8.325 18.3H5.7V9.75H8.325V18.3ZM7.05 8.55C6.225 8.55 5.475 7.875 5.475 6.975C5.475 6.075 6.15 5.4 7.05 5.4C7.875 5.4 8.625 6.075 8.625 6.975C8.625 7.875 7.875 8.55 7.05 8.55ZM18.375 18.225H15.75V14.025C15.75 13.05 15.75 11.7 14.325 11.7C12.9 11.7 12.75 12.825 12.75 13.875V18.15H10.125V9.75H12.6V10.875H12.675C13.05 10.2 13.95 9.45 15.225 9.45C17.925 9.45 18.45 11.25 18.45 13.575V18.225H18.375Z"
        fill="currentColor"
      />
    </g>
    <defs>
      <clipPath id="linkedin-clip">
        <rect width="24" height="24" fill="white" />
      </clipPath>
    </defs>
  </svg>
);

const SOCIAL_LINKS = [
  {
    href: "https://www.linkedin.com/company/pair-connect/",
    label: "LinkedIn",
    Icon: LinkedInIcon,
  },
  {
    href: "https://www.instagram.com/pair_connect_/",
    label: "Instagram",
    Icon: Instagram,
  },
  {
    href: "https://www.youtube.com/@pair_connect",
    label: "YouTube",
    Icon: Youtube,
  },
] as const;

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto border-t border-[var(--color-dark-border)] bg-[var(--color-dark-card)]">
      <div className="container mx-auto px-4 py-8 md:py-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          {/* Logo + lema: móvil apilado (logo arriba, lema abajo), desktop en línea */}
          <Link
            to="/"
            className="flex flex-col items-center gap-2 shrink-0 md:flex-row md:items-center md:gap-3"
            aria-label="Pair Connect - Inicio"
          >
            <img
              src={logoSvg}
              alt=""
              className="h-8 w-auto object-contain md:h-7"
            />
            <span className="text-center text-sm text-[var(--color-gray-blue)] md:text-left">
              Conecta, programa y crece en equipo
            </span>
          </Link>

          {/* Redes sociales */}
          <div className="flex items-center justify-center gap-4 md:justify-end">
            {SOCIAL_LINKS.map(({ href, label, Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--color-dark-border)] text-[var(--color-gray-blue)] transition-colors hover:border-[var(--color-cyan)] hover:bg-[var(--color-cyan)]/10 hover:text-[var(--color-cyan)]"
                aria-label={label}
              >
                {label === "LinkedIn" ? (
                  <Icon className="h-5 w-5 shrink-0 scale-110" />
                ) : (
                  <Icon className="h-5 w-5" strokeWidth={1.8} />
                )}
              </a>
            ))}
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 border-t border-[var(--color-dark-border)] pt-6">
          <p className="text-center text-xs text-[var(--color-gray-blue)] md:text-sm">
            © {new Date().getFullYear()}{" "}
            <span className="font-semibold text-[var(--color-light)]">
              Pair Connect
            </span>
            . Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

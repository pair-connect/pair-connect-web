import React from "react";

const BANNER_TEXT = (
  <>
    <span className="opacity-90" style={{ marginLeft: "0.35em" }}>&lt;</span>
    {" Página en construcción — Pronto estará más bonito que un merge sin conflictos "}
    <span className="opacity-90" style={{ marginRight: "0.35em" }}>/&gt;</span>
  </>
);

export const ConstructionBanner: React.FC = () => {
  return (
    <div className="relative overflow-hidden bg-[var(--color-cyan)] py-0.5 px-4" style={{ fontSize: 0 }}>
      <div
        className="inline-flex w-max animate-banner-marquee whitespace-nowrap text-xs font-semibold uppercase tracking-wide text-[var(--color-dark-bg)] md:text-sm"
        style={{ willChange: "transform", fontSize: "clamp(0.75rem, 2vw, 0.875rem)" }}
      >
        <span className="inline-block shrink-0">{BANNER_TEXT}</span><span className="inline-block shrink-0">{BANNER_TEXT}</span><span className="inline-block shrink-0">{BANNER_TEXT}</span><span className="inline-block shrink-0">{BANNER_TEXT}</span>
      </div>
    </div>
  );
};

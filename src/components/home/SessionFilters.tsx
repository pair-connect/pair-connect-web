import React from "react";
import { Search } from "lucide-react";
import { Stack, Level } from "@/types";
import { availableLanguages } from "@/data/constants";

interface SessionFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedStack: Stack | "All";
  onStackChange: (stack: Stack | "All") => void;
  selectedLevel: Level | "All";
  onLevelChange: (level: Level | "All") => void;
  selectedLanguages: string[];
  onToggleLanguage: (lang: string) => void;
  languageSearchQuery: string;
  onLanguageSearchChange: (value: string) => void;
}

export const SessionFilters: React.FC<SessionFiltersProps> = ({
  searchQuery,
  onSearchChange,
  selectedStack,
  onStackChange,
  selectedLevel,
  onLevelChange,
  selectedLanguages,
  onToggleLanguage,
  languageSearchQuery,
  onLanguageSearchChange,
}) => {
  const getStackColor = (stack: Stack | "All") => {
    if (selectedStack !== stack) {
      return "bg-[var(--color-dark-bg)] text-[var(--color-light)] border border-[#4ad3e5]/30 hover:border-[#4ad3e5]";
    }
    switch (stack) {
      case "Frontend":
        return "bg-[#069a9a] text-white";
      case "Backend":
        return "bg-[#ff5da2] text-white";
      case "Fullstack":
        return "bg-[#a16ee4] text-white";
      case "All":
      default:
        return "bg-[#4ad3e5] text-[#13161d]";
    }
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#8fa6bc]" />
        <input
          type="text"
          placeholder="Buscar sesiones..."
          value={searchQuery}
          onChange={(e) => {
            e.stopPropagation();
            onSearchChange(e.target.value);
          }}
          onClick={(e) => e.stopPropagation()}
          className="w-full pl-10 pr-4 py-2 bg-[var(--color-dark-card)] border border-[#4ad3e5]/30 rounded-lg text-sm text-[var(--color-light)] placeholder-[#8fa6bc] focus:outline-none focus:ring-1 focus:ring-[#4ad3e5] focus:border-[#4ad3e5] transition-all"
        />
      </div>

      {/* Filters Card */}
      <div className="bg-[var(--color-dark-card)] rounded-lg border border-[#4ad3e5]/30 p-4 space-y-4">
        {/* Stack Filter */}
        <div>
          <label className="block text-xs text-[#8fa6bc] mb-2">Stack</label>
          <div className="flex flex-wrap gap-2">
            {(["All", "Frontend", "Backend", "Fullstack"] as const).map(
              (stack) => (
                <button
                  key={stack}
                  onClick={(e) => {
                    e.stopPropagation();
                    onStackChange(stack);
                  }}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${getStackColor(stack)}`}
                >
                  {stack}
                </button>
              )
            )}
          </div>
        </div>

        {/* Level Filter */}
        <div>
          <label className="block text-xs text-[#8fa6bc] mb-2">Nivel</label>
          <div className="flex flex-wrap gap-2">
            {(["All", "Junior", "Mid", "Senior"] as const).map((level) => (
              <button
                key={level}
                onClick={(e) => {
                  e.stopPropagation();
                  onLevelChange(level);
                }}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  selectedLevel === level
                    ? "bg-[#4ad3e5] text-[#13161d]"
                    : "bg-[var(--color-dark-bg)] text-[var(--color-light)] border border-[#4ad3e5]/30 hover:border-[#4ad3e5]"
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* Languages Filter - Always Open */}
        <div className="pt-2 border-t border-[#4ad3e5]/20">
          <label className="block text-xs text-[#8fa6bc] mb-2">Lenguajes</label>
          
          {/* Language Search */}
          <div className="relative mb-3">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-[#8fa6bc]" />
            <input
              type="text"
              placeholder="Buscar lenguaje..."
              value={languageSearchQuery}
              onChange={(e) => {
                e.stopPropagation();
                onLanguageSearchChange(e.target.value);
              }}
              onClick={(e) => e.stopPropagation()}
              className="w-full pl-8 pr-2 py-1.5 bg-[var(--color-dark-bg)] border border-[#4ad3e5]/20 rounded-md text-xs text-[var(--color-light)] placeholder-[#8fa6bc] focus:outline-none focus:ring-1 focus:ring-[#4ad3e5] focus:border-[#4ad3e5] transition-all"
            />
          </div>

          {/* Languages List */}
          <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
            {availableLanguages
              .filter((lang) =>
                lang.toLowerCase().includes(languageSearchQuery.toLowerCase())
              )
              .map((lang) => (
                <button
                  key={lang}
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleLanguage(lang);
                  }}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                    selectedLanguages.includes(lang)
                      ? "bg-gradient-to-r from-[#ff5da2] to-[#4ad3e5] text-[#13161d]"
                      : "bg-[var(--color-dark-bg)] text-[var(--color-light)] border border-[#4ad3e5]/20 hover:border-[#4ad3e5]/40"
                  }`}
                >
                  {lang}
                </button>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

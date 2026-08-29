import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { useLanguage, SUPPORTED_LANGUAGES, Language } from '../lib/i18n';
import { playHoverSound } from '../lib/sound';

interface LanguageSelectorProps {
  variant?: 'dropdown' | 'compact' | 'cards';
  className?: string;
  onSelectLanguage?: (lang: Language) => void;
  onLanguageChange?: (lang: Language) => void;
}

export default function LanguageSelector({
  variant = 'dropdown',
  className = '',
  onSelectLanguage,
  onLanguageChange,
}: LanguageSelectorProps) {
  const { language, setLanguage, dir } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentOption = SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];

  const handleHover = useCallback(() => {
    playHoverSound();
  }, []);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (code: Language) => {
    playHoverSound();
    setLanguage(code);
    setIsOpen(false);
    if (onSelectLanguage) {
      onSelectLanguage(code);
    }
    if (onLanguageChange) {
      onLanguageChange(code);
    }
  };

  // Cards Variant (e.g. for modal or settings)
  if (variant === 'cards') {
    return (
      <div className={`grid grid-cols-2 sm:grid-cols-4 gap-3 ${className}`}>
        {SUPPORTED_LANGUAGES.map((langItem) => {
          const isSelected = language === langItem.code;
          return (
            <button
              key={langItem.code}
              type="button"
              onMouseEnter={handleHover}
              onClick={() => handleSelect(langItem.code)}
              className={`p-3.5 rounded-2xl border text-center transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 group ${
                isSelected
                  ? 'border-[#d2ff1f] bg-[#d2ff1f] text-black shadow-lg shadow-[#d2ff1f]/25 ring-2 ring-[#d2ff1f]'
                  : 'border-[#27272a] bg-[#18181b] text-zinc-300 hover:border-[#d2ff1f] hover:bg-[#d2ff1f]/15 hover:text-[#d2ff1f] hover:shadow-md hover:shadow-[#d2ff1f]/10'
              }`}
            >
              <span className={`text-sm font-extrabold tracking-wide transition-colors ${isSelected ? 'text-black' : 'text-white group-hover:text-[#d2ff1f]'}`}>
                {langItem.nativeLabel}
              </span>
              {isSelected && <Check className="h-4 w-4 text-black stroke-[3]" />}
            </button>
          );
        })}
      </div>
    );
  }

  // Compact Variant (used in top navigation HUD and Login screen)
  if (variant === 'compact') {
    return (
      <div className={`relative inline-block ${className}`} ref={dropdownRef}>
        <button
          type="button"
          onMouseEnter={handleHover}
          onClick={() => {
            playHoverSound();
            setIsOpen(!isOpen);
          }}
          className="flex items-center gap-2 rounded-xl bg-[#18181b] border border-[#27272a] hover:border-[#d2ff1f] hover:bg-[#d2ff1f]/10 px-3.5 py-1.5 text-xs text-white hover:text-[#d2ff1f] transition-all duration-150 cursor-pointer group shadow-sm"
          title="Language / اللغة"
        >
          <Globe className="h-4 w-4 text-[#d2ff1f] transition-transform duration-300 group-hover:rotate-45" />
          <span className="font-extrabold text-xs tracking-wide transition-colors group-hover:text-[#d2ff1f]">
            {currentOption.nativeLabel}
          </span>
          <ChevronDown className={`h-3 w-3 text-zinc-400 transition-all duration-200 group-hover:text-[#d2ff1f] ${isOpen ? 'rotate-180 text-[#d2ff1f]' : ''}`} />
        </button>

        {isOpen && (
          <div
            className={`absolute top-full mt-2 w-44 rounded-2xl border border-[#27272a] hover:border-[#d2ff1f]/40 bg-[#121214] p-1.5 shadow-2xl z-50 animate-fadeIn ${
              dir === 'rtl' ? 'right-0 text-right' : 'left-0 text-left'
            }`}
          >
            <div className="space-y-1">
              {SUPPORTED_LANGUAGES.map((langItem) => {
                const isSelected = language === langItem.code;
                return (
                  <button
                    key={langItem.code}
                    type="button"
                    onMouseEnter={handleHover}
                    onClick={() => handleSelect(langItem.code)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all duration-150 cursor-pointer group border ${
                      isSelected
                        ? 'bg-[#d2ff1f] text-black border-[#d2ff1f] font-extrabold shadow-md shadow-[#d2ff1f]/20'
                        : 'border-transparent text-zinc-300 hover:border-[#d2ff1f]/40 hover:bg-[#d2ff1f]/15 hover:text-[#d2ff1f] font-semibold'
                    }`}
                  >
                    <span className={`font-extrabold text-xs transition-colors ${isSelected ? 'text-black' : 'text-zinc-200 group-hover:text-[#d2ff1f]'}`}>
                      {langItem.nativeLabel}
                    </span>
                    {isSelected && <Check className="h-4 w-4 text-black stroke-[3] shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Standard Elegant Dropdown Variant
  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onMouseEnter={handleHover}
        onClick={() => {
          playHoverSound();
          setIsOpen(!isOpen);
        }}
        className="flex items-center gap-2 rounded-xl bg-[#18181b] border border-[#27272a] hover:border-[#d2ff1f] hover:bg-[#d2ff1f]/10 px-3.5 py-2 text-xs text-white hover:text-[#d2ff1f] transition-all duration-150 cursor-pointer group shadow-sm"
      >
        <Globe className="h-4 w-4 text-[#d2ff1f] transition-transform duration-300 group-hover:rotate-45" />
        <span className="font-extrabold text-xs font-sans tracking-wide transition-colors group-hover:text-[#d2ff1f]">
          {currentOption.nativeLabel}
        </span>
        <ChevronDown
          className={`h-3.5 w-3.5 text-zinc-400 transition-all duration-200 group-hover:text-[#d2ff1f] ${isOpen ? 'rotate-180 text-[#d2ff1f]' : ''}`}
        />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setIsOpen(false)} />
          <div
            className={`absolute top-full mt-2 w-44 rounded-2xl border border-[#27272a] hover:border-[#d2ff1f]/40 bg-[#121214] p-1.5 shadow-2xl z-50 animate-fadeIn ${
              dir === 'rtl' ? 'left-0 text-right' : 'right-0 text-left'
            }`}
          >
            <div className="space-y-1">
              {SUPPORTED_LANGUAGES.map((langItem) => {
                const isSelected = language === langItem.code;
                return (
                  <button
                    key={langItem.code}
                    type="button"
                    onMouseEnter={handleHover}
                    onClick={() => handleSelect(langItem.code)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all duration-150 cursor-pointer group border ${
                      isSelected
                        ? 'bg-[#d2ff1f] text-black border-[#d2ff1f] font-extrabold shadow-md shadow-[#d2ff1f]/20'
                        : 'border-transparent text-zinc-300 hover:border-[#d2ff1f]/40 hover:bg-[#d2ff1f]/15 hover:text-[#d2ff1f] font-semibold'
                    }`}
                  >
                    <span className={`font-extrabold text-xs transition-colors ${isSelected ? 'text-black' : 'text-zinc-200 group-hover:text-[#d2ff1f]'}`}>
                      {langItem.nativeLabel}
                    </span>
                    {isSelected && <Check className="h-4 w-4 text-black stroke-[3] shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

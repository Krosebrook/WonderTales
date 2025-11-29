
import React, { useMemo, useState } from "react";
import { UserProfile, BookFormat } from "../types";
import { 
  THEME_PRESETS, 
  AVATAR_OPTIONS, 
  PAGE_PRESETS, 
  FORMAT_OPTIONS, 
  MIN_PAGES, 
  MAX_PAGES, 
  PAGE_STEP 
} from "../config/constants";
import { playSystemSound } from "../services/audioUtils";

interface SetupWizardProps {
  onGenerate: (profile: UserProfile) => void;
}

// Simple className combiner
function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

const SetupWizard: React.FC<SetupWizardProps> = ({ onGenerate }) => {
  const [name, setName] = useState("");
  const [age, setAge] = useState<number | null>(7);
  const [avatar, setAvatar] = useState(AVATAR_OPTIONS[1]); 
  const [themePresetId, setThemePresetId] = useState<string | null>(null);
  const [customTheme, setCustomTheme] = useState("");
  const [pages, setPages] = useState(10);
  const [format, setFormat] = useState<BookFormat | null>("digital");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedThemePreset = useMemo(
    () => THEME_PRESETS.find((t) => t.id === themePresetId) ?? null,
    [themePresetId]
  );

  const resolvedTheme = useMemo(() => {
    const trimmed = customTheme.trim();
    if (trimmed.length > 0) return trimmed;
    if (selectedThemePreset) return selectedThemePreset.label;
    return "";
  }, [customTheme, selectedThemePreset]);

  const isValid = useMemo(
    () =>
      name.trim().length > 0 &&
      resolvedTheme.length > 0 &&
      format !== null &&
      pages >= MIN_PAGES &&
      pages <= MAX_PAGES,
    [name, resolvedTheme, format, pages]
  );

  const currentStep = useMemo(() => {
    if (!name.trim()) return 1;
    if (!resolvedTheme) return 2;
    return 3;
  }, [name, resolvedTheme]);

  const handleSurpriseTheme = () => {
    playSystemSound('magic');
    const index = Math.floor(Math.random() * THEME_PRESETS.length);
    const preset = THEME_PRESETS[index];
    setThemePresetId(preset.id);
    setCustomTheme("");
    const el = document.querySelector<HTMLButtonElement>(
      `[data-theme-id="${preset.id}"]`
    );
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  };

  const handlePagesChange = (delta: number) => {
    playSystemSound('click');
    setPages((prev) => {
      const next = prev + delta * PAGE_STEP;
      if (next < MIN_PAGES) return MIN_PAGES;
      if (next > MAX_PAGES) return MAX_PAGES;
      return next;
    });
  };

  const handlePresetPages = (value: number) => {
    playSystemSound('click');
    const clamped = Math.min(Math.max(value, MIN_PAGES), MAX_PAGES);
    setPages(clamped);
  };

  const handleSubmit = async () => {
    if (!isValid || !format) return;
    playSystemSound('success');
    setIsSubmitting(true);
    
    // Slight delay to show loading state
    await new Promise(r => setTimeout(r, 800));
    
    onGenerate({
        name: name.trim(),
        age: age || 7,
        avatar,
        theme: resolvedTheme,
        format
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 font-sans">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-100 text-2xl shadow-sm">
              ✨
            </div>
            <div>
              <h1 className="text-lg font-bold text-indigo-900">
                WonderTales · Setup
              </h1>
              <p className="text-xs text-slate-500">
                Create magical, personalized stories in a few taps.
              </p>
            </div>
          </div>
          <div className="hidden items-center gap-3 sm:flex">
            <span className="inline-flex items-center gap-2 rounded-full bg-pink-50 px-3 py-1 text-xs font-medium text-pink-700 border border-pink-100">
              <span className="text-base">🧙‍♂️</span>
              “Hi, I'm Doodle! I'll help you build an adventure.”
            </span>
          </div>
        </header>

        <main className="rounded-3xl bg-white shadow-xl shadow-slate-200/60 border border-slate-100">
          <StepHeader currentStep={currentStep} />

          <div className="flex flex-col gap-6 border-t border-slate-100 p-6 lg:flex-row lg:p-8">
            <div className="flex-1 space-y-6">
              <FormSection
                step={1}
                title="Who is this for?"
                description="We’ll put their name on the cover and tune the pages to their age."
                isCurrent={currentStep === 1}
              >
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-[minmax(0,2fr),minmax(0,1fr)]">
                    <label className="flex flex-col gap-1 text-xs font-medium text-slate-700">
                      Name
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Charlie"
                        className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none ring-0 transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
                      />
                    </label>

                    <label className="flex flex-col gap-1 text-xs font-medium text-slate-700">
                      Age
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={2}
                          max={12}
                          value={age ?? ""}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value === "") {
                              setAge(null);
                            } else {
                              const num = Number(value);
                              if (!Number.isNaN(num)) setAge(num);
                            }
                          }}
                          className="h-10 w-20 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none ring-0 transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
                        />
                      </div>
                    </label>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-medium text-slate-700">Pick an avatar</p>
                    <div className="flex flex-wrap gap-2">
                      {AVATAR_OPTIONS.map((option) => {
                        const isActive = option === avatar;
                        return (
                          <button
                            key={option}
                            type="button"
                            onClick={() => {
                              setAvatar(option);
                              playSystemSound('pop');
                            }}
                            className={cn(
                              "flex h-10 w-10 items-center justify-center rounded-full border text-2xl transition hover:scale-110 hover:shadow-md",
                              isActive
                                ? "border-indigo-500 bg-indigo-50 shadow-sm scale-110"
                                : "border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/60"
                            )}
                          >
                            {option}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </FormSection>

              <FormSection
                step={2}
                title="Pick an adventure"
                description="Choose a theme or make up your own wild idea."
                isCurrent={currentStep === 2}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-medium text-slate-700">Popular adventures</p>
                    <button
                      type="button"
                      onClick={handleSurpriseTheme}
                      className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[11px] font-medium text-amber-800 shadow-sm transition hover:border-amber-300 hover:bg-amber-100 hover:scale-105 active:scale-95"
                    >
                      <span>🎲</span>
                      <span>Surprise me</span>
                    </button>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {THEME_PRESETS.map((preset) => {
                      const isActive = preset.id === themePresetId && customTheme.trim().length === 0;
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          data-theme-id={preset.id}
                          onClick={() => {
                             playSystemSound('pop');
                             setThemePresetId(isActive ? null : preset.id);
                             if (!isActive) setCustomTheme("");
                          }}
                          className={cn(
                            "flex flex-col items-start gap-1 rounded-xl border bg-white p-3 text-left text-xs shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300",
                            isActive
                              ? "border-indigo-500 ring-1 ring-indigo-300 bg-indigo-50"
                              : "border-slate-200"
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{preset.emoji}</span>
                            <span className="font-bold text-slate-900">
                              {preset.label}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500">{preset.description}</p>
                        </button>
                      );
                    })}
                  </div>

                  <div className="grid gap-4 sm:grid-cols-[minmax(0,3fr),minmax(0,2fr)]">
                    <label className="flex flex-col gap-1 text-xs font-medium text-slate-700">
                      Or type your own idea
                      <input
                        type="text"
                        value={customTheme}
                        onChange={(e) => {
                            setCustomTheme(e.target.value);
                            if (e.target.value.trim().length > 0) setThemePresetId(null);
                        }}
                        placeholder="e.g. Unicorn detectives"
                        className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none ring-0 transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
                      />
                    </label>

                    <div className="rounded-lg bg-indigo-50/80 p-3 text-[11px] text-slate-700 border border-indigo-100">
                      <p className="mb-1 font-bold text-indigo-900">
                        Doodle&apos;s tip 💡
                      </p>
                      <p>Mix things up: <span className="font-medium">“Space mermaids”</span>.</p>
                    </div>
                  </div>
                </div>
              </FormSection>

              <FormSection
                step={3}
                title="Story details"
                description="Decide how big the adventure is and how you’ll experience it."
                isCurrent={currentStep === 3}
              >
                <div className="space-y-5">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-medium text-slate-700">Pages</p>
                      <span className="text-[11px] text-slate-400">{MIN_PAGES}–{MAX_PAGES} pages.</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <button type="button" onClick={() => handlePagesChange(-1)} className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-lg text-slate-700 shadow-sm transition hover:border-indigo-300 hover:bg-indigo-50">−</button>
                      <div className="flex min-w-[4rem] items-center justify-center rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold text-slate-900">{pages}</div>
                      <button type="button" onClick={() => handlePagesChange(1)} className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-lg text-slate-700 shadow-sm transition hover:border-indigo-300 hover:bg-indigo-50">+</button>
                      <div className="flex flex-1 flex-wrap justify-end gap-2">
                        {PAGE_PRESETS.map((preset) => (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() => handlePresetPages(preset.pages)}
                            className={cn(
                              "inline-flex items-center gap-1 rounded-full border px-3 py-1 text-[11px] font-medium transition",
                              pages === preset.pages
                                ? "border-indigo-500 bg-indigo-50 text-indigo-800"
                                : "border-slate-200 bg-white text-slate-600 hover:border-indigo-300 hover:bg-indigo-50/60"
                            )}
                          >
                            <span>{preset.label}</span>
                            <span className="text-[10px] text-slate-400">{preset.pages}p</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-xs font-medium text-slate-700">Experience</p>
                    <div className="grid gap-3 sm:grid-cols-3">
                      {FORMAT_OPTIONS.map((option) => {
                        const isActive = format === option.id;
                        return (
                          <button
                            key={option.id}
                            type="button"
                            onClick={() => {
                              setFormat(option.id);
                              playSystemSound('pop');
                            }}
                            className={cn(
                              "flex h-full flex-col items-start gap-1 rounded-xl border bg-white p-3 text-left text-xs shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300",
                              isActive
                                ? "border-indigo-500 ring-1 ring-indigo-300 bg-indigo-50"
                                : "border-slate-200"
                            )}
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{option.icon}</span>
                              <span className="font-bold text-slate-900">{option.label}</span>
                            </div>
                            <p className="text-[11px] text-slate-500">{option.description}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </FormSection>
            </div>

            <div className="lg:w-[320px]">
               {/* Preview Section - Keeping it inline for simplicity but using dynamic data */}
               <aside className="sticky top-4 space-y-4 rounded-2xl border border-slate-100 bg-slate-50/80 p-4 shadow-sm lg:top-20">
                  <p className="text-xs font-medium text-slate-600">Preview</p>
                  <div className={cn(
                    "relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br p-4 shadow-sm transition-all h-[360px] flex flex-col items-center justify-center text-center",
                    resolvedTheme ? "from-indigo-100 via-purple-100 to-pink-100" : "from-slate-100 via-slate-50 to-slate-100"
                  )}>
                    <div className="relative flex flex-col items-center gap-4 z-10">
                      <div className="text-6xl animate-bounce">{avatar}</div>
                      <div className="inline-flex items-center gap-2 rounded-full bg-white/60 px-3 py-1 text-[11px] font-bold text-slate-800 backdrop-blur-sm shadow-sm">
                        The Adventures of {name || "Your Child"}
                      </div>
                      <h4 className="text-xl font-black text-slate-900 leading-tight max-w-[200px]">
                        {resolvedTheme || "Choose an adventure"}
                      </h4>
                      <div className="flex flex-wrap items-center justify-center gap-2 text-[10px] text-slate-700 mt-2">
                         <span className="inline-flex items-center gap-1 rounded-full bg-white/50 px-2 py-1 backdrop-blur-sm border border-white/20">
                           <span>📄</span><span>{pages} pages</span>
                         </span>
                      </div>
                    </div>
                  </div>
               </aside>
            </div>
          </div>

          <footer className="border-t border-slate-100 bg-slate-50/70 px-6 py-4 lg:px-8 rounded-b-3xl">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 text-[11px] text-slate-500">
                <span className="text-base">💡</span>
                <span>We'll use AI to generate the story, images, and voices in real-time.</span>
              </div>
              <button
                type="button"
                disabled={!isValid || isSubmitting}
                onClick={handleSubmit}
                className={cn(
                  "inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-400/40 transition-all",
                  isValid && !isSubmitting
                    ? "bg-gradient-to-r from-indigo-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 hover:scale-105 active:scale-95"
                    : "bg-slate-300 text-slate-500 shadow-none cursor-not-allowed"
                )}
              >
                {isSubmitting ? "Preparing Magic..." : "Start Adventure"}
              </button>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
};

// Sub-component for form sections
const StepHeader: React.FC<{ currentStep: number }> = ({ currentStep }) => (
    <div className="border-b border-slate-100 px-6 pt-6 pb-4 lg:px-8 lg:pt-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Design Your Adventure</h2>
          <p className="text-sm text-slate-500">Enter a few details and we'll generate a unique interactive story.</p>
        </div>
        <div className="mt-4 h-1 w-32 rounded-full bg-slate-100 overflow-hidden lg:mt-0">
            <div className="h-1 rounded-full bg-gradient-to-r from-indigo-500 to-pink-500 transition-all duration-500" style={{ width: `${(currentStep / 3) * 100}%` }} />
        </div>
      </div>
    </div>
);

const FormSection: React.FC<{ step: number, title: string, description: string, isCurrent: boolean, children: React.ReactNode }> = ({ step, title, description, isCurrent, children }) => (
    <section className={cn("rounded-2xl border p-4 sm:p-5 transition-all duration-300", isCurrent ? "border-indigo-200 bg-indigo-50/40 shadow-sm" : "border-slate-100 bg-slate-50/30 opacity-80")}>
      <div className="mb-4">
        <h3 className="text-sm font-bold text-slate-900"><span className="mr-1 text-xs text-slate-400 font-normal">Step {step} ·</span>{title}</h3>
        <p className="mt-1 text-xs text-slate-500">{description}</p>
      </div>
      {children}
    </section>
);

export default SetupWizard;

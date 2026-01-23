import React, { useMemo, useState } from "react";
import { useStory } from "../contexts/StoryContext";
import { UserProfile, BookFormat } from "../types";
import { THEME_PRESETS, AVATAR_OPTIONS, MIN_PAGES, MAX_PAGES } from "../config/constants";
import { playSystemSound } from "../services/audioUtils";
import { StepHeader } from "./StepHeader";
import { FormSection } from "./FormSection";
import { Step1Profile, Step2Theme, Step3Details } from "./setup/WizardSteps";
import { cn } from "../utils/cn";

interface SetupWizardProps {
  onGenerate: (profile: UserProfile) => void;
}

const SetupWizard: React.FC<SetupWizardProps> = ({ onGenerate }) => {
  const { pages, continueStory } = useStory();
  const hasSavedStory = pages && pages.length > 0;

  // Local State for Form
  const [name, setName] = useState("");
  const [age, setAge] = useState<number | null>(7);
  const [avatar, setAvatar] = useState(AVATAR_OPTIONS[1]); 
  const [themePresetId, setThemePresetId] = useState<string | null>(null);
  const [customTheme, setCustomTheme] = useState("");
  const [pagesCount, setPagesCount] = useState(10);
  const [format, setFormat] = useState<BookFormat | null>("digital");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Derived State
  const selectedThemePreset = useMemo(() => THEME_PRESETS.find(t => t.id === themePresetId), [themePresetId]);
  const resolvedTheme = useMemo(() => customTheme.trim() || selectedThemePreset?.label || "", [customTheme, selectedThemePreset]);
  
  const isValid = useMemo(() => 
    name.trim().length > 0 && resolvedTheme.length > 0 && format !== null && pagesCount >= MIN_PAGES && pagesCount <= MAX_PAGES, 
  [name, resolvedTheme, format, pagesCount]);

  const currentStep = useMemo(() => {
    if (!name.trim()) return 1;
    if (!resolvedTheme) return 2;
    return 3;
  }, [name, resolvedTheme]);

  const handleSubmit = async () => {
    if (!isValid || !format) return;
    playSystemSound('success');
    setIsSubmitting(true);
    await new Promise(r => setTimeout(r, 800));
    
    onGenerate({
        name: name.trim(),
        age: age || 7,
        avatar,
        theme: resolvedTheme,
        format,
        animationStyle: selectedThemePreset?.defaultAnimation || 'gentle'
    });
  };

  const handleContinue = () => {
    playSystemSound('magic');
    continueStory();
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 font-sans relative">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-100 text-2xl shadow-sm">✨</div>
            <div><h1 className="text-lg font-bold text-indigo-900">WonderTales · Setup</h1></div>
          </div>
          
          {hasSavedStory && (
            <button 
              onClick={handleContinue}
              className="group relative flex items-center gap-3 bg-white border-2 border-emerald-100 pr-6 pl-4 py-2 rounded-full shadow-sm hover:shadow-md hover:border-emerald-300 transition-all active:scale-95"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-sm group-hover:scale-110 transition-transform">📖</span>
              <div className="text-left">
                 <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-wide">Resume</div>
                 <div className="text-sm font-bold text-slate-700">Continue Previous Story</div>
              </div>
            </button>
          )}
        </header>

        <main className="rounded-3xl bg-white shadow-xl shadow-slate-200/60 border border-slate-100 relative overflow-hidden">
          <StepHeader currentStep={currentStep} />
          <div className="flex flex-col gap-6 border-t border-slate-100 p-6 lg:flex-row lg:p-8">
            <div className="flex-1 space-y-6">
              <FormSection step={1} title="Who is this for?" description="Name & Avatar" isCurrent={currentStep === 1}>
                <Step1Profile name={name} setName={setName} age={age} setAge={setAge} avatar={avatar} setAvatar={setAvatar} />
              </FormSection>
              <FormSection step={2} title="Pick an adventure" description="Theme Selection" isCurrent={currentStep === 2}>
                <Step2Theme themePresetId={themePresetId} setThemePresetId={setThemePresetId} customTheme={customTheme} setCustomTheme={setCustomTheme} />
              </FormSection>
              <FormSection step={3} title="Story details" description="Format & Length" isCurrent={currentStep === 3}>
                <Step3Details pages={pagesCount} setPages={setPagesCount} format={format} setFormat={setFormat} />
              </FormSection>
            </div>
            
            {/* Preview Panel */}
            <div className="lg:w-[320px] sticky top-8 h-fit">
              <div className={cn("rounded-2xl border p-6 flex flex-col items-center text-center transition-all h-[360px] justify-center", resolvedTheme ? "bg-indigo-50 border-indigo-200" : "bg-slate-50 border-slate-200")}>
                <div className="text-6xl mb-4 animate-bounce">{avatar}</div>
                <h3 className="text-xl font-black text-slate-900 mb-2">{name || "Your Name"}</h3>
                <p className="text-sm text-slate-600 font-medium">{resolvedTheme || "Select a theme..."}</p>
              </div>
            </div>
          </div>

          <footer className="border-t border-slate-100 bg-slate-50/70 px-6 py-4 rounded-b-3xl flex justify-end">
            <button 
              disabled={!isValid || isSubmitting} 
              onClick={handleSubmit} 
              className={cn(
                "px-8 py-3 rounded-full text-sm font-bold text-white shadow-lg transition-all transform", 
                isValid && !isSubmitting ? "bg-indigo-600 hover:bg-indigo-700 hover:scale-105 active:scale-95" : "bg-slate-300 cursor-not-allowed"
              )}
            >
              {isSubmitting ? "Creating Magic..." : "Start Adventure"}
            </button>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default SetupWizard;
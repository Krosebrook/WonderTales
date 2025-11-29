import React from 'react';
import { AVATAR_OPTIONS, THEME_PRESETS, PAGE_PRESETS, FORMAT_OPTIONS } from '../../config/constants';
import { playSystemSound } from '../../services/audioUtils';
import { cn } from '../../utils/cn';

export const Step1Profile: React.FC<{ 
  name: string, setName: (s: string) => void,
  age: number | null, setAge: (n: number | null) => void,
  avatar: string, setAvatar: (s: string) => void
}> = ({ name, setName, age, setAge, avatar, setAvatar }) => (
  <div className="space-y-4">
    <div className="grid gap-4 sm:grid-cols-[minmax(0,2fr),minmax(0,1fr)]">
      <label className="flex flex-col gap-1 text-xs font-medium text-slate-700">
        Name
        <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Charlie" className="h-10 rounded-lg border border-slate-200 px-3 text-sm focus:ring-2 focus:ring-indigo-200 transition" />
      </label>
      <label className="flex flex-col gap-1 text-xs font-medium text-slate-700">
        Age
        <input type="number" min={2} max={12} value={age ?? ""} onChange={e => setAge(e.target.value ? Number(e.target.value) : null)} className="h-10 rounded-lg border border-slate-200 px-3 text-sm focus:ring-2 focus:ring-indigo-200 transition" />
      </label>
    </div>
    <div className="space-y-2">
      <p className="text-xs font-medium text-slate-700">Pick an avatar</p>
      <div className="flex flex-wrap gap-2">
        {AVATAR_OPTIONS.map(opt => (
          <button key={opt} onClick={() => { setAvatar(opt); playSystemSound('pop'); }} className={cn("flex h-10 w-10 items-center justify-center rounded-full border text-2xl transition hover:scale-110", opt === avatar ? "border-indigo-500 bg-indigo-50 scale-110" : "border-slate-200 bg-white")}>{opt}</button>
        ))}
      </div>
    </div>
  </div>
);

export const Step2Theme: React.FC<{
  themePresetId: string | null, setThemePresetId: (s: string | null) => void,
  customTheme: string, setCustomTheme: (s: string) => void
}> = ({ themePresetId, setThemePresetId, customTheme, setCustomTheme }) => (
  <div className="space-y-4">
    <div className="grid gap-3 sm:grid-cols-2">
      {THEME_PRESETS.map(preset => {
        const isActive = preset.id === themePresetId && !customTheme;
        return (
          <button key={preset.id} onClick={() => { playSystemSound('pop'); setThemePresetId(isActive ? null : preset.id); if(!isActive) setCustomTheme(""); }} className={cn("flex flex-col items-start gap-1 rounded-xl border p-3 text-left text-xs transition hover:shadow-md", isActive ? "border-indigo-500 bg-indigo-50 ring-1 ring-indigo-300" : "bg-white border-slate-200")}>
            <div className="flex items-center gap-2"><span className="text-lg">{preset.emoji}</span><span className="font-bold">{preset.label}</span></div>
            <p className="text-[11px] text-slate-500">{preset.description}</p>
          </button>
        );
      })}
    </div>
    <label className="flex flex-col gap-1 text-xs font-medium text-slate-700">
      Or type your own idea
      <input type="text" value={customTheme} onChange={e => { setCustomTheme(e.target.value); if(e.target.value) setThemePresetId(null); }} placeholder="e.g. Unicorn detectives" className="h-10 rounded-lg border border-slate-200 px-3 text-sm focus:ring-2 focus:ring-indigo-200 transition" />
    </label>
  </div>
);

export const Step3Details: React.FC<{
  pages: number, setPages: (n: number) => void,
  format: any, setFormat: (f: any) => void
}> = ({ pages, setPages, format, setFormat }) => (
  <div className="space-y-5">
    <div className="space-y-3">
      <p className="text-xs font-medium text-slate-700">Pages</p>
      <div className="flex gap-2">
        {PAGE_PRESETS.map(p => (
          <button key={p.id} onClick={() => { setPages(p.pages); playSystemSound('click'); }} className={cn("px-3 py-1 rounded-full border text-xs font-medium transition", pages === p.pages ? "bg-indigo-50 border-indigo-500 text-indigo-700" : "bg-white border-slate-200")}>{p.label} ({p.pages}p)</button>
        ))}
      </div>
    </div>
    <div className="space-y-3">
      <p className="text-xs font-medium text-slate-700">Experience</p>
      <div className="grid gap-3 sm:grid-cols-3">
        {FORMAT_OPTIONS.map(opt => (
          <button key={opt.id} onClick={() => { setFormat(opt.id); playSystemSound('pop'); }} className={cn("flex flex-col gap-1 rounded-xl border p-3 text-left text-xs transition hover:shadow-md", format === opt.id ? "border-indigo-500 bg-indigo-50 ring-1 ring-indigo-300" : "bg-white border-slate-200")}>
            <div className="flex items-center gap-2"><span className="text-lg">{opt.icon}</span><span className="font-bold">{opt.label}</span></div>
            <p className="text-[11px] text-slate-500">{opt.description}</p>
          </button>
        ))}
      </div>
    </div>
  </div>
);
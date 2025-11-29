import React from 'react';
import { cn } from '../utils/cn';

interface StepHeaderProps {
  currentStep: number;
}

export const StepHeader: React.FC<StepHeaderProps> = ({ currentStep }) => {
  const steps = [
    { id: 1, label: "Hero", description: "Name & Avatar" },
    { id: 2, label: "Adventure", description: "Pick a theme" },
    { id: 3, label: "Details", description: "Length & Style" },
  ];

  return (
    <div className="border-b border-slate-100 px-6 pt-6 pb-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Design Your Adventure</h2>
          <p className="text-sm text-slate-500">Enter a few details and we'll generate a unique interactive story.</p>
        </div>
        <ol className="flex items-center gap-4">
          {steps.map((step) => {
            const isDone = step.id < currentStep;
            const isActive = step.id === currentStep;
            return (
              <li key={step.id} className="flex items-center gap-2 text-xs font-medium text-slate-500">
                <div className={cn("flex h-7 w-7 items-center justify-center rounded-full border text-xs transition", isActive ? "border-indigo-500 bg-indigo-50 text-indigo-700 shadow-sm" : isDone ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-slate-300 bg-slate-50")}>
                  {isDone ? "✓" : step.id}
                </div>
                <div className="hidden flex-col leading-tight sm:flex">
                  <span className={cn("text-[11px] uppercase tracking-wide", isActive ? "text-slate-900" : "text-slate-500")}>{step.label}</span>
                  <span className="text-[11px] text-slate-400">{step.description}</span>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
      <div className="mt-4 h-1 w-full rounded-full bg-slate-100 overflow-hidden">
        <div className="h-1 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500 ease-out" style={{ width: `${(currentStep / 3) * 100}%` }} />
      </div>
    </div>
  );
};
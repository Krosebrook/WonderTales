import React from 'react';
import { cn } from '../utils/cn';

interface FormSectionProps {
  step: number;
  title: string;
  description: string;
  isCurrent: boolean;
  children: React.ReactNode;
}

export const FormSection: React.FC<FormSectionProps> = ({ step, title, description, isCurrent, children }) => {
  return (
    <section className={cn("rounded-2xl border p-4 sm:p-5 transition-all duration-300", isCurrent ? "border-indigo-200 bg-indigo-50/30 shadow-sm" : "border-slate-100 bg-slate-50/60 opacity-60 grayscale-[0.5]")}>
      <div className="mb-4">
        <h3 className="text-sm font-bold text-slate-900"><span className="mr-1 text-xs text-slate-400">Step {step} ·</span> {title}</h3>
        <p className="text-xs text-slate-500">{description}</p>
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
};

import { ThemePreset, PagePreset, FormatOption } from "../types";

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: "space-dinos",
    label: "Space Dinosaurs",
    emoji: "🦖",
    description: "Dinosaurs exploring faraway galaxies.",
    category: "space",
  },
  {
    id: "mermaid-city",
    label: "Mermaid City",
    emoji: "🧜‍♀️",
    description: "Underwater skyscrapers and mermaid schools.",
    category: "fantasy",
  },
  {
    id: "ninja-kittens",
    label: "Ninja Kittens",
    emoji: "🐱",
    description: "Sneaky cats on secret missions.",
    category: "animals",
  },
  {
    id: "robot-school",
    label: "Rainbow Robot School",
    emoji: "🤖",
    description: "Robots learning art and music.",
    category: "vehicles",
  },
  {
    id: "unicorn-detectives",
    label: "Unicorn Detectives",
    emoji: "🦄",
    description: "Mystery-solving unicorn friends.",
    category: "fantasy",
  },
  {
    id: "jungle-racers",
    label: "Jungle Racers",
    emoji: "🏎️",
    description: "Animal drivers in wild races.",
    category: "vehicles",
  },
  {
    id: "candy-kingdom",
    label: "Candy Kingdom",
    emoji: "🍭",
    description: "A magical, sugary world made of sweets and treats.",
    category: "mixed",
  },
  {
    id: "pirate-hunt",
    label: "Pirate Treasure",
    emoji: "🏴‍☠️",
    description: "Sailing the seven seas for gold.",
    category: "fantasy",
  },
  {
    id: "superhero-squad",
    label: "Superhero Squad",
    emoji: "🦸",
    description: "Saving the city with super powers.",
    category: "fantasy",
  },
  {
    id: "dragon-riders",
    label: "Dragon Riders",
    emoji: "🐉",
    description: "Flying high on friendly dragons.",
    category: "fantasy",
  },
];

export const AVATAR_OPTIONS = [
  "🧒", "👧", "🦊", "🐼", "🦄", "🤖", 
  "👽", "🦁", "🐸", "🧚‍♀️", "🦸", "🐶"
];

export const PAGE_PRESETS: PagePreset[] = [
  { id: "quick", label: "Quick", pages: 8 },
  { id: "just-right", label: "Just right", pages: 16 },
  { id: "epic", label: "Epic", pages: 24 },
];

export const FORMAT_OPTIONS: FormatOption[] = [
  {
    id: "digital",
    label: "Interactive Story",
    icon: "📱",
    description: "Play on tablets with voice & animation.",
  },
  {
    id: "single-pages",
    label: "Single Pages",
    icon: "📄",
    description: "Best for quick home printing.",
  },
  {
    id: "printable-book",
    label: "Printable Book",
    icon: "📘",
    description: "Print, staple, and keep forever.",
  },
];

export const MIN_PAGES = 4;
export const MAX_PAGES = 40;
export const PAGE_STEP = 2;

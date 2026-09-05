import { BookOpen, Coffee, Compass, Gamepad2, GraduationCap, Trees } from 'lucide-react';
import type { FilterCategory } from '../data/places';

export function CategoryIcon({ category, size = 20, className = '' }: {
  category: FilterCategory;
  size?: number;
  className?: string;
}) {
  const Icon = {
    all: Compass,
    university: GraduationCap,
    food: Coffee,
    parks: Trees,
    leisure: Gamepad2,
    study: BookOpen,
  }[category];

  return <Icon size={size} strokeWidth={1.8} className={className} aria-hidden="true" />;
}

// Leaflet div icons live outside React's tree, so their small SVGs are static markup.
export function markerSvg(category: FilterCategory): string {
  const paths: Record<FilterCategory, string> = {
    all: '<circle cx="12" cy="12" r="9"/><path d="m16 8-2 6-6 2 2-6Z"/>',
    university: '<path d="m2 9 10-5 10 5-10 5L2 9Z"/><path d="M6 11v6c3 3 9 3 12 0v-6M22 9v7"/>',
    food: '<path d="M5 8h12v8a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4V8ZM17 9h2a3 3 0 1 1 0 6h-2M7 3v2M11 2v3M15 3v2"/>',
    parks: '<path d="m10 3-6 8h3l-4 6h14l-4-6h3L10 3ZM10 17v4M18 4l3 5h-2l3 5h-4M19 14v6"/>',
    leisure: '<path d="M7 6h10a4 4 0 0 1 4 3l1 8a2 2 0 0 1-3.5 1.5L15 15H9l-3.5 3.5A2 2 0 0 1 2 17l1-8a4 4 0 0 1 4-3ZM6 10v4M4 12h4M16 10h.01M19 12h.01"/>',
    study: '<path d="M12 5C8 2 4 3 2 4v15c3-1 6-1 10 2 4-3 7-3 10-2V4c-2-1-6-2-10 1ZM12 5v16"/>',
  };
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[category]}</svg>`;
}
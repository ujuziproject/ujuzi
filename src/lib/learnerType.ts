// Turns a student's two preference answers into a friendly "learner type" with a
// plain explanation of what uJuzi will do differently for them.

export type FormatPref = 'visual' | 'text' | 'balanced';
export type DepthPref = 'simple' | 'advanced' | 'balanced';

export interface LearnerType {
  emoji: string;
  name: string;
  tagline: string;
}

const TYPES: Record<`${FormatPref}-${DepthPref}`, LearnerType> = {
  'visual-simple':     { emoji: '🎨', name: 'The Visual Explorer',     tagline: 'You like to see it, in plain language.' },
  'visual-advanced':   { emoji: '📐', name: 'The Visual Analyst',      tagline: 'You like diagrams with the full technical detail.' },
  'visual-balanced':   { emoji: '🗺️', name: 'The Big-Picture Thinker', tagline: 'You like to see the map, then zoom in.' },
  'text-simple':       { emoji: '📖', name: 'The Storyteller',          tagline: 'You like clear explanations with everyday examples.' },
  'text-advanced':     { emoji: '🔬', name: 'The Deep Diver',           tagline: 'You like precise, detailed explanations.' },
  'text-balanced':     { emoji: '✍️', name: 'The Note Taker',           tagline: 'You like well-organised written notes.' },
  'balanced-simple':   { emoji: '🪜', name: 'The Step-by-Step Learner', tagline: 'You like to start simple and build up.' },
  'balanced-advanced': { emoji: '⚡', name: 'The Challenger',           tagline: 'You like to get straight to the hard stuff.' },
  'balanced-balanced': { emoji: '🌟', name: 'The All-Rounder',          tagline: 'You’re comfortable with every kind of material.' },
};

export function learnerType(format?: string | null, depth?: string | null): LearnerType {
  const f = (['visual', 'text', 'balanced'].includes(format || '') ? format : 'balanced') as FormatPref;
  const d = (['simple', 'advanced', 'balanced'].includes(depth || '') ? depth : 'balanced') as DepthPref;
  return TYPES[`${f}-${d}`];
}

export function formatEffect(format?: string | null): string {
  if (format === 'visual') return 'Notes come with step-by-step breakdowns, tables and diagrams described in words.';
  if (format === 'text') return 'Notes are clear, well-organised written explanations.';
  return 'Notes mix written explanations with tables and step-by-step breakdowns.';
}

export function depthEffect(depth?: string | null): string {
  if (depth === 'simple') return 'Explanations start with everyday examples before the technical terms.';
  if (depth === 'advanced') return 'Explanations use precise academic language from the start.';
  return 'Explanations are pitched at your level, adding detail as you go.';
}

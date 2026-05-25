/** Shared gradient & border presets for wall host shapes (inspector). */

export const WALL_GRADIENT_PRESETS = [
  { id: 'midnight-neon', label: 'Midnight Neon', css: 'linear-gradient(135deg,#0f172a,#1e1b4b,#beee1d33)' },
  { id: 'toxic-cyan', label: 'Toxic Cyan', css: 'linear-gradient(135deg,#042f2e,#06b6d4,#22d3ee)' },
  { id: 'poison-gold', label: 'Poison Gold', css: 'linear-gradient(135deg,#422006,#eab308,#facc15)' },
  { id: 'purple-haze', label: 'Purple Haze', css: 'linear-gradient(135deg,#2e1065,#7c3aed,#c084fc)' },
  { id: 'rose-dusk', label: 'Rose Dusk', css: 'linear-gradient(135deg,#4c0519,#fb7185,#fda4af)' },
  { id: 'ocean-deep', label: 'Ocean Deep', css: 'linear-gradient(160deg,#0c4a6e,#0284c7,#67e8f9)' },
  { id: 'forest-moss', label: 'Forest Moss', css: 'linear-gradient(145deg,#14532d,#22c55e,#bbf7d0)' },
  { id: 'slate-glass', label: 'Slate Glass', css: 'linear-gradient(135deg,#1e293b,#334155,#94a3b8)' },
  { id: 'sunset-blaze', label: 'Sunset Blaze', css: 'linear-gradient(120deg,#7c2d12,#f97316,#fde047)' },
  { id: 'candy-pop', label: 'Candy Pop', css: 'linear-gradient(120deg,#ec4899,#a855f7,#22d3ee)' },
  { id: 'mono-ink', label: 'Mono Ink', css: 'linear-gradient(180deg,#0a0a0a,#262626,#525252)' },
  { id: 'warm-linen', label: 'Warm Linen', css: 'linear-gradient(180deg,#fffbeb,#fde68a,#fcd34d)' },
  { id: 'berry-burst', label: 'Berry Burst', css: 'linear-gradient(135deg,#581c87,#be185d,#f472b6)' },
  { id: 'arctic-frost', label: 'Arctic Frost', css: 'linear-gradient(160deg,#f0f9ff,#bae6fd,#0ea5e9)' },
  { id: 'copper-rust', label: 'Copper Rust', css: 'linear-gradient(145deg,#78350f,#ea580c,#fed7aa)' },
  { id: 'electric-lime', label: 'Electric Lime', css: 'linear-gradient(120deg,#14532d,#beee1d,#fef08a)' },
  { id: 'velvet-night', label: 'Velvet Night', css: 'linear-gradient(160deg,#1e1b4b,#312e81,#6366f1)' },
  { id: 'peach-sorbet', label: 'Peach Sorbet', css: 'linear-gradient(135deg,#fff7ed,#fdba74,#fb7185)' },
  { id: 'steel-blue', label: 'Steel Blue', css: 'linear-gradient(180deg,#1e3a5f,#2563eb,#93c5fd)' },
  { id: 'hologram', label: 'Hologram', css: 'linear-gradient(120deg,#22d3ee,#a78bfa,#f472b6,#beee1d)' },
] as const

export const WALL_BORDER_PRESETS = [
  { id: 'solid', label: 'Solid', dash: 'draw' as const },
  { id: 'dashed', label: 'Dashed', dash: 'dashed' as const },
  { id: 'dotted', label: 'Dotted', dash: 'dotted' as const },
  { id: 'draw', label: 'Hand-drawn', dash: 'solid' as const },
  { id: 'bold-solid', label: 'Bold', dash: 'draw' as const },
  { id: 'retro-dash', label: 'Retro dash', dash: 'dashed' as const },
  { id: 'sketch', label: 'Sketch', dash: 'dotted' as const },
  { id: 'clean', label: 'Clean line', dash: 'solid' as const },
  { id: 'heavy', label: 'Heavy', dash: 'draw' as const },
  { id: 'light-dash', label: 'Light dash', dash: 'dashed' as const },
  { id: 'micro-dot', label: 'Micro dots', dash: 'dotted' as const },
  { id: 'blueprint', label: 'Blueprint', dash: 'solid' as const },
] as const

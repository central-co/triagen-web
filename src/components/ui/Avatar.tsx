interface AvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  darkMode?: boolean;
}

const SIZE_CLASSES = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
};

// Muted, deterministic backgrounds so the same person always gets the same tone
const PALETTE = [
  'bg-triagen-primary text-white',
  'bg-triagen-secondary text-white',
  'bg-triagen-secondary-green text-white',
  'bg-triagen-primary-blue text-white',
  'bg-[#E4D1C3] text-triagen-primary',
  'bg-triagen-sage-tint text-triagen-secondary-green',
];

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function hashOf(text: string): number {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (hash * 31 + text.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function Avatar({ name, size = 'md' }: Readonly<AvatarProps>) {
  const colorClass = PALETTE[hashOf(name) % PALETTE.length];
  return (
    <div
      aria-hidden="true"
      className={`${SIZE_CLASSES[size]} ${colorClass} rounded flex items-center justify-center font-heading shrink-0 select-none`}
    >
      {initialsOf(name)}
    </div>
  );
}

export default Avatar;

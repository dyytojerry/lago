'use client';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  fullScreen?: boolean;
}

export function Loading({ size = 'md', text, fullScreen = false }: LoadingProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  const containerClass = fullScreen
    ? 'fixed inset-0 flex items-center justify-center bg-white bg-opacity-80 z-50'
    : 'flex items-center justify-center py-8';

  return (
    <div className={containerClass}>
      <div className="flex flex-col items-center gap-3">
        <div
          className={`${sizeClasses[size]} border-4 border-primary border-t-transparent rounded-full animate-spin`}
        />
        {text && <p className="text-sm text-text-secondary">{text}</p>}
      </div>
    </div>
  );
}


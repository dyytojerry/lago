'use client';

interface LoadingProps {
  text?: string;
}

export function Loading({ text }: LoadingProps) {
  return (
    <div className="py-10 flex flex-col items-center justify-center gap-3">
      <span className="inline-flex h-10 w-10">
        <span className="h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </span>
      {text && <p className="text-sm text-gray-500">{text}</p>}
    </div>
  );
}


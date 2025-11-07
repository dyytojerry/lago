'use client';

import { Package, Search, MessageCircle, ShoppingBag, Calendar, Users } from 'lucide-react';

interface EmptyStateProps {
  icon?: 'package' | 'search' | 'message' | 'shopping' | 'users' | 'calendar';
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const iconMap = {
  package: Package,
  search: Search,
  message: MessageCircle,
  shopping: ShoppingBag,
  users: Users,
  calendar: Calendar,
};

export function EmptyState({
  icon = 'package',
  title,
  description,
  action,
}: EmptyStateProps) {
  const Icon = iconMap[icon];

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-gray-400" />
      </div>
      {title && (
        <h3 className="text-lg font-semibold text-text-primary mb-2">{title}</h3>
      )}
      {description && (
        <p className="text-sm text-text-secondary text-center mb-6 max-w-sm">
          {description}
        </p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}


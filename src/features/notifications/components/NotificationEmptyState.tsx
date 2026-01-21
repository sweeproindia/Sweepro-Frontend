import { Bell } from 'lucide-react';

export function NotificationEmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="p-10 text-center text-muted-foreground">
      <Bell className="h-10 w-10 mx-auto mb-3 opacity-50" aria-hidden="true" />
      <p className="text-base font-medium text-foreground">{title}</p>
      <p className="text-sm mt-1">{description}</p>
    </div>
  );
}

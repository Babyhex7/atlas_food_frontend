import React from "react";
import { Inbox } from "lucide-react";

type EmptyStateProps = {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
};

export function EmptyState({ title, description, icon = <Inbox size={40} className="text-text-muted" />, action }: EmptyStateProps) {
  return (
    <section className="flex flex-col items-center justify-center py-12 px-6 text-center gap-3">
      <span className="leading-none">{icon}</span>
      <h2 className="text-base font-semibold text-text-primary m-0">{title}</h2>
      {description && (
        <p className="text-sm text-text-muted max-w-[360px] m-0">{description}</p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </section>
  );
}

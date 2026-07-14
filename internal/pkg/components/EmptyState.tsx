type EmptyStateProps = {
  title: string;
  description?: string;
  icon?: string;
  action?: React.ReactNode;
};

export function EmptyState({ title, description, icon = "📭", action }: EmptyStateProps) {
  return (
    <section
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "var(--space-12) var(--space-6)",
        textAlign: "center",
        gap: "var(--space-3)",
      }}
    >
      <span style={{ fontSize: "2.5rem", lineHeight: 1 }}>{icon}</span>
      <h2
        style={{
          fontSize: "var(--text-base)",
          fontWeight: "var(--weight-semibold)",
          color: "var(--color-text-primary)",
          margin: 0,
        }}
      >
        {title}
      </h2>
      {description && (
        <p
          style={{
            fontSize: "var(--text-sm)",
            color: "var(--color-text-muted)",
            maxWidth: "360px",
            margin: 0,
          }}
        >
          {description}
        </p>
      )}
      {action && <div style={{ marginTop: "var(--space-2)" }}>{action}</div>}
    </section>
  );
}

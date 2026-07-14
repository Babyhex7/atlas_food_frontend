type PageHeaderProps = {
  title: string;
  description?: string;
  action?: React.ReactNode;
};

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: "var(--space-4)",
        marginBottom: "var(--space-6)",
      }}
    >
      <div>
        <h1
          style={{
            fontSize: "var(--text-2xl)",
            fontWeight: "var(--weight-bold)",
            color: "var(--color-text-primary)",
            margin: 0,
            lineHeight: "var(--leading-tight)",
          }}
        >
          {title}
        </h1>
        {description && (
          <p
            style={{
              fontSize: "var(--text-sm)",
              color: "var(--color-text-muted)",
              marginTop: "var(--space-1)",
            }}
          >
            {description}
          </p>
        )}
      </div>
      {action && <div style={{ flexShrink: 0 }}>{action}</div>}
    </div>
  );
}

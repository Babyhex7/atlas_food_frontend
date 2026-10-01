type PageHeaderProps = {
  title: string;
  description?: string;
  action?: React.ReactNode;
};

/**
 * Dipakai di semua halaman daftar admin.
 * h1 intentionally rendered di sini sehingga setiap halaman punya satu h1 semantik.
 */
export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="m-0 text-[22px] font-semibold leading-tight tracking-tight text-text-primary">
          {title}
        </h1>
        {description && (
          <p className="m-0 mt-0.5 text-sm text-text-muted">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

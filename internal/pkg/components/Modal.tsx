import type { ReactNode } from "react";

type ModalProps = {
  open: boolean;
  onClose?: () => void;
  title?: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg";
};

const sizeClass: Record<string, string> = {
  sm: "modal modal-sm",
  md: "modal",
  lg: "modal modal-lg",
};

export function Modal({ open, onClose, title, children, size = "md" }: ModalProps) {
  if (!open) return null;

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" onClick={(e) => { if (e.target === e.currentTarget) onClose?.(); }}>
      <div className={sizeClass[size]}>
        {title && (
          <div className="modal-header">
            <h2 className="modal-title">{title}</h2>
            {onClose && (
              <button className="modal-close" onClick={onClose} aria-label="Tutup">
                ✕
              </button>
            )}
          </div>
        )}
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

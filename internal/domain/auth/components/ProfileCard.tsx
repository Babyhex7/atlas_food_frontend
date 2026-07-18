"use client";

import Link from "next/link";
import { useState, useRef, useCallback } from "react";
import {
  Loader2, User, Shield, Camera, LogOut, Settings, Search,
  X, Upload, ImageIcon, Trash2, Eye, EyeOff, Lock, CheckCircle2,
  Info, ArrowRight,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useLogout } from "../hooks/useLogout";
import { authRoles } from "../constants/authRoles";
import { AppHeader } from "@/internal/components/layout/AppHeader";
import { CONTAINER_CLASS } from "@/internal/lib/layout";
import { getAccessToken } from "@/internal/lib/cookies";

type ActiveSection = "personal" | "security";
type PhotoModal = "change" | "uploading" | "remove" | null;
type PasswordModal = "form" | "success" | null;

/** Calculate age as { years, months, days } from a date string (YYYY-MM-DD). */
function calcAge(s: string): { years: number; months: number; days: number } | null {
  if (!s) return null;
  const birth = new Date(s);
  if (isNaN(birth.getTime())) return null;
  const today = new Date();
  let years = today.getFullYear() - birth.getFullYear();
  let months = today.getMonth() - birth.getMonth();
  let days = today.getDate() - birth.getDate();
  if (days < 0) { months--; days += new Date(today.getFullYear(), today.getMonth(), 0).getDate(); }
  if (months < 0) { years--; months += 12; }
  return { years, months, days };
}

/** Password strength 0–4 */
function passwordStrength(pw: string): { score: number; label: string; color: string } {
  if (!pw) return { score: 0, label: "", color: "" };
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const map: Record<number, { label: string; color: string }> = {
    1: { label: "WEAK", color: "#ef4444" },
    2: { label: "FAIR", color: "#f59e0b" },
    3: { label: "GOOD", color: "#3b82f6" },
    4: { label: "STRONG", color: "#22c55e" },
  };
  return { score, ...(map[score] ?? { label: "", color: "" }) };
}

/* ─────────────────────────── Modal overlay wrapper ─────────────────────── */
function ModalOverlay({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        backgroundColor: "rgba(0,0,0,0.45)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "var(--space-4)",
      }}
    >
      {children}
    </div>
  );
}

/* ─────────────────────── Change Photo modal ────────────────────────────── */
function ChangePhotoModal({
  onClose,
  onFileSelected,
  onRemoveClick,
}: {
  onClose: () => void;
  onFileSelected: (file: File) => void;
  onRemoveClick: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleFile = (file: File) => {
    if (!file.type.match(/^image\/(jpeg|png|webp)$/)) return;
    if (file.size > 5 * 1024 * 1024) return;
    onFileSelected(file);
  };

  return (
    <ModalOverlay onClose={onClose}>
      <div style={{
        background: "var(--color-surface)", borderRadius: "var(--radius-xl)",
        width: "100%", maxWidth: 480, boxShadow: "var(--shadow-xl)",
      }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", padding: "var(--space-5) var(--space-6)", borderBottom: "1px solid var(--color-border)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", backgroundColor: "var(--color-primary-light)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ImageIcon size={18} style={{ color: "var(--color-primary)" }} />
            </div>
            <div>
              <p style={{ margin: 0, fontWeight: "var(--weight-semibold)", fontSize: "var(--text-base)", color: "var(--color-text-primary)" }}>Change Profile Photo</p>
              <p style={{ margin: 0, fontSize: "var(--text-sm)", color: "var(--color-text-muted)" }}>Update how you appear to others on Atlas Food</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-text-muted)", padding: "var(--space-1)" }}>
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "var(--space-5) var(--space-6)", display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
          {/* Upload zone */}
          <div
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
            style={{
              border: `2px dashed ${dragging ? "var(--color-primary)" : "var(--color-border)"}`,
              borderRadius: "var(--radius-lg)", padding: "var(--space-8) var(--space-4)",
              textAlign: "center", cursor: "pointer", transition: "border-color 0.15s",
              backgroundColor: dragging ? "var(--color-primary-light)" : "transparent",
            }}
          >
            <div style={{ width: 48, height: 48, borderRadius: "50%", backgroundColor: "var(--color-primary-light)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto var(--space-3)" }}>
              <Upload size={20} style={{ color: "var(--color-primary)" }} />
            </div>
            <p style={{ margin: "0 0 var(--space-1)", fontWeight: "var(--weight-semibold)", fontSize: "var(--text-base)", color: "var(--color-text-primary)" }}>Upload From Device</p>
            <p style={{ margin: 0, fontSize: "var(--text-sm)", color: "var(--color-text-muted)" }}>Drag and drop your file here</p>
            <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
          </div>

          {/* Take Photo + Remove Current */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-3)" }}>
            <button style={{ border: "1.5px solid var(--color-border)", borderRadius: "var(--radius-lg)", background: "var(--color-surface)", padding: "var(--space-5) var(--space-3)", display: "flex", flexDirection: "column", alignItems: "center", gap: "var(--space-2)", cursor: "pointer" }}>
              <Camera size={22} style={{ color: "var(--color-text-secondary)" }} />
              <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "var(--color-text-primary)" }}>Take Photo</span>
            </button>
            <button onClick={onRemoveClick} style={{ border: "1.5px solid var(--color-border)", borderRadius: "var(--radius-lg)", background: "var(--color-surface)", padding: "var(--space-5) var(--space-3)", display: "flex", flexDirection: "column", alignItems: "center", gap: "var(--space-2)", cursor: "pointer" }}>
              <Trash2 size={22} style={{ color: "var(--color-text-secondary)" }} />
              <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "var(--color-text-primary)" }}>Remove Current</span>
            </button>
          </div>

          {/* Info */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: "var(--space-2)", padding: "var(--space-3) var(--space-4)", backgroundColor: "var(--color-bg)", borderRadius: "var(--radius-md)" }}>
            <Info size={14} style={{ color: "var(--color-text-muted)", flexShrink: 0, marginTop: 1 }} />
            <p style={{ margin: 0, fontSize: "var(--text-xs)", color: "var(--color-text-muted)", lineHeight: 1.5 }}>
              Supported formats: JPG, PNG, WEBP.<br />
              Maximum file size: 5 MB. For best results, use a square image of at least 400×400px.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--space-3)", padding: "var(--space-4) var(--space-6)", borderTop: "1px solid var(--color-border)" }}>
          <button onClick={onClose} className="btn btn-secondary btn-sm">Cancel</button>
          <button className="btn btn-primary btn-sm">Save Changes</button>
        </div>
      </div>
    </ModalOverlay>
  );
}

/* ─────────────────────── Upload Progress modal ─────────────────────────── */
function UploadProgressModal({
  file,
  progress,
  onClose,
  onBack,
}: {
  file: File;
  progress: number;
  onClose: () => void;
  onBack: () => void;
}) {
  const loaded = ((file.size * progress) / 100 / (1024 * 1024)).toFixed(1);
  const total = (file.size / (1024 * 1024)).toFixed(1);

  return (
    <ModalOverlay onClose={onClose}>
      <div style={{ background: "var(--color-surface)", borderRadius: "var(--radius-xl)", width: "100%", maxWidth: 480, boxShadow: "var(--shadow-xl)" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "var(--space-5) var(--space-6)" }}>
          <p style={{ margin: 0, fontWeight: "var(--weight-semibold)", fontSize: "var(--text-lg)", color: "var(--color-text-primary)" }}>Change Profile Photo</p>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-text-muted)" }}><X size={18} /></button>
        </div>

        {/* Upload area */}
        <div style={{ margin: "0 var(--space-6) var(--space-5)", border: "2px dashed var(--color-primary-border)", borderRadius: "var(--radius-lg)", padding: "var(--space-5)", backgroundColor: "var(--color-primary-light)" }}>
          {/* File row */}
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", marginBottom: "var(--space-4)" }}>
            <div style={{ width: 44, height: 44, borderRadius: "var(--radius-md)", backgroundColor: "var(--color-surface)", border: "1.5px solid var(--color-primary-border)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <ImageIcon size={20} style={{ color: "var(--color-primary)" }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: "var(--text-sm)", fontWeight: "var(--weight-semibold)", color: "var(--color-text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{file.name}</p>
              <p style={{ margin: 0, fontSize: "var(--text-xs)", color: "var(--color-text-muted)" }}>{total} MB · {progress < 100 ? "Uploading..." : "Done"}</p>
            </div>
            <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "var(--text-sm)", fontWeight: "var(--weight-semibold)", color: "var(--color-primary)" }}>Cancel</button>
          </div>

          {/* Progress bar */}
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "var(--space-1)" }}>
            <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)" }}>{progress}% complete</span>
            <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)" }}>{loaded} MB of {total} MB</span>
          </div>
          <div style={{ height: 6, borderRadius: 99, backgroundColor: "var(--color-border)" }}>
            <div style={{ height: "100%", borderRadius: 99, backgroundColor: "var(--color-primary)", width: `${progress}%`, transition: "width 0.3s" }} />
          </div>

          {/* Hint */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: "var(--space-2)", marginTop: "var(--space-3)", padding: "var(--space-3)", backgroundColor: "var(--color-surface)", borderRadius: "var(--radius-md)" }}>
            <Info size={13} style={{ color: "var(--color-text-muted)", flexShrink: 0, marginTop: 1 }} />
            <p style={{ margin: 0, fontSize: "var(--text-xs)", color: "var(--color-text-muted)", lineHeight: 1.5 }}>For best results, use a square image at least 400×400px. JPG or PNG only.</p>
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--space-3)", padding: "var(--space-4) var(--space-6)", borderTop: "1px solid var(--color-border)" }}>
          <button onClick={onBack} className="btn btn-secondary btn-sm">Back</button>
          <button className="btn btn-primary btn-sm" disabled={progress < 100}>Save Changes</button>
        </div>
      </div>
    </ModalOverlay>
  );
}

/* ─────────────────────── Remove Photo confirm modal ────────────────────── */
function RemovePhotoModal({ onClose, onConfirm }: { onClose: () => void; onConfirm: () => void }) {
  return (
    <ModalOverlay onClose={onClose}>
      <div style={{ background: "var(--color-surface)", borderRadius: "var(--radius-xl)", width: "100%", maxWidth: 400, boxShadow: "var(--shadow-xl)", padding: "var(--space-8) var(--space-6)", textAlign: "center" }}>
        {/* Icon */}
        <div style={{ width: 72, height: 72, borderRadius: "50%", backgroundColor: "var(--color-primary-light)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto var(--space-5)" }}>
          <Trash2 size={28} style={{ color: "var(--color-primary)" }} />
        </div>
        <p style={{ margin: "0 0 var(--space-3)", fontSize: "var(--text-xl)", fontWeight: "var(--weight-bold)", color: "var(--color-text-primary)" }}>Remove Profile Photo?</p>
        <p style={{ margin: "0 0 var(--space-7)", fontSize: "var(--text-sm)", color: "var(--color-text-muted)", lineHeight: 1.6 }}>
          This will delete your current photo and revert to the default avatar. This action cannot be undone.
        </p>
        <div style={{ display: "flex", gap: "var(--space-3)" }}>
          <button onClick={onClose} className="btn btn-secondary" style={{ flex: 1, borderRadius: 99 }}>Cancel</button>
          <button onClick={onConfirm} className="btn btn-primary" style={{ flex: 1, borderRadius: 99 }}>Remove</button>
        </div>
      </div>
    </ModalOverlay>
  );
}

/* ─────────────────────── Change Password modal ─────────────────────────── */
function ChangePasswordModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const strength = passwordStrength(next);
  const match = next.length > 0 && confirm.length > 0 && next === confirm;
  const mismatch = confirm.length > 0 && next !== confirm;
  const canSave = current.length > 0 && strength.score >= 2 && match;

  return (
    <ModalOverlay onClose={onClose}>
      <div style={{ background: "var(--color-surface)", borderRadius: "var(--radius-xl)", width: "100%", maxWidth: 480, boxShadow: "var(--shadow-xl)" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", padding: "var(--space-6)" }}>
          <div>
            <p style={{ margin: "0 0 var(--space-1)", fontWeight: "var(--weight-bold)", fontSize: "var(--text-xl)", color: "var(--color-text-primary)" }}>Change Password</p>
            <p style={{ margin: 0, fontSize: "var(--text-sm)", color: "var(--color-text-muted)" }}>Ensure your account stays secure with a strong password.</p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-text-muted)" }}><X size={18} /></button>
        </div>

        {/* Fields */}
        <div style={{ padding: "0 var(--space-6) var(--space-6)", display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
          {/* Current password */}
          <div>
            <p style={{ margin: "0 0 var(--space-2)", fontSize: "var(--text-xs)", fontWeight: "var(--weight-semibold)", color: "var(--color-text-muted)", letterSpacing: "0.06em" }}>CURRENT PASSWORD</p>
            <div style={{ position: "relative" }}>
              <Lock size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--color-text-muted)", pointerEvents: "none" }} />
              <input type={showCurrent ? "text" : "password"} value={current} onChange={(e) => setCurrent(e.target.value)} placeholder="••••••••••" style={{ paddingLeft: 36, paddingRight: 40, width: "100%", boxSizing: "border-box" }} />
              <button type="button" onClick={() => setShowCurrent(v => !v)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--color-text-muted)" }}>
                {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* New password */}
          <div>
            <p style={{ margin: "0 0 var(--space-2)", fontSize: "var(--text-xs)", fontWeight: "var(--weight-semibold)", color: "var(--color-text-muted)", letterSpacing: "0.06em" }}>NEW PASSWORD</p>
            <div style={{ position: "relative" }}>
              <Lock size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--color-text-muted)", pointerEvents: "none" }} />
              <input type={showNext ? "text" : "password"} value={next} onChange={(e) => setNext(e.target.value)} placeholder="Min. 8 characters" style={{ paddingLeft: 36, paddingRight: 40, width: "100%", boxSizing: "border-box" }} />
              <button type="button" onClick={() => setShowNext(v => !v)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--color-text-muted)" }}>
                {showNext ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {next.length > 0 && (
              <div style={{ marginTop: "var(--space-2)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "var(--space-1)" }}>
                  <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-semibold)", color: strength.color }}>{strength.label}</span>
                  <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)" }}>{strength.score * 25}% secure</span>
                </div>
                <div style={{ height: 4, borderRadius: 99, backgroundColor: "var(--color-border)" }}>
                  <div style={{ height: "100%", borderRadius: 99, backgroundColor: strength.color, width: `${strength.score * 25}%`, transition: "width 0.2s" }} />
                </div>
              </div>
            )}
          </div>

          {/* Confirm password */}
          <div>
            <p style={{ margin: "0 0 var(--space-2)", fontSize: "var(--text-xs)", fontWeight: "var(--weight-semibold)", color: "var(--color-text-muted)", letterSpacing: "0.06em" }}>CONFIRM NEW PASSWORD</p>
            <div style={{ position: "relative" }}>
              <Lock size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--color-text-muted)", pointerEvents: "none" }} />
              <input type={showConfirm ? "text" : "password"} value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Repeat password" style={{ paddingLeft: 36, paddingRight: 40, width: "100%", boxSizing: "border-box", borderColor: mismatch ? "var(--color-danger)" : undefined }} />
              <button type="button" onClick={() => setShowConfirm(v => !v)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--color-text-muted)" }}>
                {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {match && <p style={{ margin: "var(--space-1) 0 0", fontSize: "var(--text-xs)", color: "#22c55e", display: "flex", alignItems: "center", gap: 4 }}><CheckCircle2 size={12} /> Passwords match</p>}
            {mismatch && <p style={{ margin: "var(--space-1) 0 0", fontSize: "var(--text-xs)", color: "var(--color-danger)" }}>Passwords do not match</p>}
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--space-3)", padding: "var(--space-4) var(--space-6)", borderTop: "1px solid var(--color-border)" }}>
          <button onClick={onClose} className="btn btn-secondary btn-sm">Cancel</button>
          <button onClick={onSuccess} className="btn btn-primary btn-sm" disabled={!canSave}>Save New Password</button>
        </div>
      </div>
    </ModalOverlay>
  );
}

/* ─────────────────────── Password success modal ───────────────────────── */
function PasswordSuccessModal({ onClose }: { onClose: () => void }) {
  return (
    <ModalOverlay onClose={onClose}>
      <div style={{ background: "var(--color-surface)", borderRadius: "var(--radius-xl)", width: "100%", maxWidth: 360, boxShadow: "var(--shadow-xl)", padding: "var(--space-10) var(--space-8)", textAlign: "center" }}>
        {/* Green glow icon */}
        <div style={{ position: "relative", width: 72, height: 72, margin: "0 auto var(--space-5)" }}>
          <div style={{ position: "absolute", inset: -16, borderRadius: "50%", backgroundColor: "rgba(34,197,94,0.12)" }} />
          <div style={{ width: "100%", height: "100%", borderRadius: "50%", backgroundColor: "#22c55e", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
            <CheckCircle2 size={32} color="white" />
          </div>
        </div>
        <p style={{ margin: "0 0 var(--space-3)", fontSize: "var(--text-xl)", fontWeight: "var(--weight-bold)", color: "var(--color-text-primary)" }}>Password Updated Successfully</p>
        <p style={{ margin: "0 0 var(--space-7)", fontSize: "var(--text-sm)", color: "var(--color-text-muted)", lineHeight: 1.6 }}>
          Your account is now more secure. You will receive a confirmation email shortly.
        </p>
        <button onClick={onClose} className="btn btn-primary" style={{ width: "100%", borderRadius: 99, display: "flex", alignItems: "center", justifyContent: "center", gap: "var(--space-2)" }}>
          Back to Profile <ArrowRight size={15} />
        </button>
      </div>
    </ModalOverlay>
  );
}

/* ─────────────────────── Main ProfileCard ──────────────────────────────── */
export function ProfileCard() {
  const { user, isAuthenticated } = useAuth();
  const logout = useLogout();
  const isLoading = !user && Boolean(getAccessToken());

  const [activeSection, setActiveSection] = useState<ActiveSection>("personal");
  const [birthDate, setBirthDate] = useState("");
  const age = calcAge(birthDate);

  // Photo modals
  const [photoModal, setPhotoModal] = useState<PhotoModal>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Password modals
  const [passwordModal, setPasswordModal] = useState<PasswordModal>(null);

  const handleFileSelected = useCallback((file: File) => {
    setUploadFile(file);
    setUploadProgress(0);
    setPhotoModal("uploading");
    // Simulate upload progress
    let pct = 0;
    const iv = setInterval(() => {
      pct += Math.floor(Math.random() * 18) + 5;
      if (pct >= 100) { pct = 100; clearInterval(iv); }
      setUploadProgress(pct);
    }, 350);
  }, []);

  if (isLoading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "var(--color-bg)" }}>
        <Loader2 size={36} className="animate-spin" style={{ color: "var(--color-primary)" }} />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", backgroundColor: "var(--color-bg)" }}>
        <AppHeader />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "var(--space-4)", padding: "var(--space-4)" }}>
          <p style={{ color: "var(--color-text-muted)", fontSize: "var(--text-sm)" }}>Anda belum masuk.</p>
          <Link href="/login" className="link-primary-hover" style={{ fontWeight: "var(--weight-medium)" }}>Masuk ke akun →</Link>
        </div>
      </div>
    );
  }

  const initials = user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", backgroundColor: "var(--color-bg)" }}>
      <AppHeader />

      {/* Modals */}
      {photoModal === "change" && (
        <ChangePhotoModal
          onClose={() => setPhotoModal(null)}
          onFileSelected={handleFileSelected}
          onRemoveClick={() => setPhotoModal("remove")}
        />
      )}
      {photoModal === "uploading" && uploadFile && (
        <UploadProgressModal
          file={uploadFile}
          progress={uploadProgress}
          onClose={() => { setPhotoModal(null); setUploadFile(null); }}
          onBack={() => setPhotoModal("change")}
        />
      )}
      {photoModal === "remove" && (
        <RemovePhotoModal
          onClose={() => setPhotoModal(null)}
          onConfirm={() => setPhotoModal(null)}
        />
      )}
      {passwordModal === "form" && (
        <ChangePasswordModal
          onClose={() => setPasswordModal(null)}
          onSuccess={() => setPasswordModal("success")}
        />
      )}
      {passwordModal === "success" && (
        <PasswordSuccessModal onClose={() => setPasswordModal(null)} />
      )}

      {/* Page header */}
      <div className={CONTAINER_CLASS} style={{ paddingTop: "var(--space-8)", paddingBottom: "var(--space-2)" }}>
        <h1 style={{ fontSize: "var(--text-2xl)", fontWeight: "var(--weight-bold)", color: "var(--color-text-primary)", margin: "0 0 var(--space-1)" }}>My Profile</h1>
        <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-muted)", margin: 0 }}>Manage your account information and security preferences.</p>
      </div>

      {/* Two-column layout */}
      <div className={CONTAINER_CLASS} style={{ flex: 1, paddingTop: "var(--space-6)", paddingBottom: "var(--space-10)", display: "grid", gridTemplateColumns: "280px 1fr", gap: "var(--space-6)", alignItems: "start" }}>

        {/* ── Left sidebar ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          {/* Avatar card */}
          <div className="card" style={{ padding: "var(--space-6)", display: "flex", flexDirection: "column", alignItems: "center", gap: "var(--space-3)" }}>
            <div style={{ position: "relative", display: "inline-flex" }}>
              <div style={{ width: 96, height: 96, borderRadius: "50%", backgroundColor: "var(--color-primary-light)", color: "var(--color-primary)", fontSize: "var(--text-2xl)", fontWeight: "var(--weight-bold)", display: "flex", alignItems: "center", justifyContent: "center", border: "3px solid var(--color-white)", boxShadow: "var(--shadow-md)", overflow: "hidden" }}>
                {initials}
              </div>
              <button
                onClick={() => setPhotoModal("change")}
                style={{ position: "absolute", bottom: 4, right: 4, width: 28, height: 28, borderRadius: "50%", backgroundColor: "var(--color-primary)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid var(--color-white)", cursor: "pointer" }}
              >
                <Camera size={12} />
              </button>
            </div>
            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: "var(--text-lg)", fontWeight: "var(--weight-bold)", color: "var(--color-text-primary)", margin: "0 0 var(--space-1)" }}>{user.name}</p>
              <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-muted)", margin: 0, textTransform: "capitalize" }}>
                {user.role === authRoles.admin ? "Admin Member" : "Pro Plan Member"}
              </p>
            </div>
            <button onClick={() => setPhotoModal("change")} className="btn btn-outline btn-sm btn-full" style={{ marginTop: "var(--space-1)" }}>
              Change Photo
            </button>
          </div>

          {/* Navigation card */}
          <div className="card" style={{ padding: "var(--space-2)", overflow: "visible" }}>
            <button onClick={() => setActiveSection("personal")} className={`profile-nav-item${activeSection === "personal" ? " profile-nav-item--active" : ""}`}>
              <User size={16} /> Personal Info
            </button>
            <button onClick={() => setActiveSection("security")} className={`profile-nav-item${activeSection === "security" ? " profile-nav-item--active" : ""}`}>
              <Shield size={16} /> Security
            </button>
            {user.role === authRoles.admin && (
              <>
                <div style={{ height: 1, backgroundColor: "var(--color-border)", margin: "var(--space-2) var(--space-3)" }} />
                <Link href="/admin/surveys" className="profile-nav-item"><Settings size={16} /> Panel Admin</Link>
              </>
            )}
            <div style={{ height: 1, backgroundColor: "var(--color-border)", margin: "var(--space-2) var(--space-3)" }} />
            <Link href="/find-food" className="profile-nav-item"><Search size={16} /> Find Food</Link>
            <button onClick={() => logout()} className="profile-nav-item profile-nav-item--danger"><LogOut size={16} /> Keluar</button>
          </div>
        </div>

        {/* ── Right content ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>

          {/* Personal Information */}
          {activeSection === "personal" && (
            <div className="card">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "var(--space-5) var(--space-6)", borderBottom: "1px solid var(--color-border)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
                  <div style={{ width: 36, height: 36, borderRadius: "var(--radius-md)", backgroundColor: "var(--color-primary-light)", color: "var(--color-primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <User size={18} />
                  </div>
                  <h2 style={{ fontSize: "var(--text-lg)", fontWeight: "var(--weight-semibold)", color: "var(--color-text-primary)", margin: 0 }}>Personal Information</h2>
                </div>
                <button className="btn btn-link" style={{ fontSize: "var(--text-sm)" }}>Edit Profile</button>
              </div>
              <div style={{ padding: "var(--space-6)" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)" }}>
                  <div className="form-group"><label className="form-label">Full Name</label><input type="text" defaultValue={user.name} readOnly /></div>
                  <div className="form-group"><label className="form-label">Email Address</label><input type="email" defaultValue={user.email} readOnly /></div>
                  <div className="form-group"><label className="form-label">Phone Number</label><input type="tel" placeholder="+62 000-0000-0000" /></div>
                  <div className="form-group">
                    <label className="form-label">Gender</label>
                    <select defaultValue="">
                      <option value="" disabled>Pilih jenis kelamin</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Birth Date</label>
                    <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} max={new Date().toISOString().split("T")[0]} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Usia</label>
                    <input type="text" readOnly value={age ? `${age.years} tahun ${age.months} bulan ${age.days} hari` : ""} placeholder="Otomatis dari tanggal lahir" />
                  </div>
                </div>
                <div style={{ height: 1, backgroundColor: "var(--color-border)", margin: "var(--space-6) 0 var(--space-5)" }} />
                <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--space-3)" }}>
                  <button className="btn btn-secondary">Cancel</button>
                  <button className="btn btn-primary">Save Changes</button>
                </div>
              </div>
            </div>
          )}

          {/* Security */}
          {activeSection === "security" && (
            <div className="card">
              <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", padding: "var(--space-5) var(--space-6)", borderBottom: "1px solid var(--color-border)" }}>
                <div style={{ width: 36, height: 36, borderRadius: "var(--radius-md)", backgroundColor: "var(--color-primary-light)", color: "var(--color-primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Shield size={18} />
                </div>
                <h2 style={{ fontSize: "var(--text-lg)", fontWeight: "var(--weight-semibold)", color: "var(--color-text-primary)", margin: 0 }}>Security</h2>
              </div>
              <div style={{ padding: "var(--space-6)", display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "var(--space-4) var(--space-5)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-lg)", backgroundColor: "var(--color-surface)" }}>
                  <div>
                    <p style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-semibold)", color: "var(--color-text-primary)", margin: "0 0 var(--space-1)" }}>Password</p>
                    <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-muted)", margin: 0, letterSpacing: "0.15em" }}>••••••••••••</p>
                  </div>
                  <button onClick={() => setPasswordModal("form")} className="btn btn-outline btn-sm">Change Password</button>
                </div>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "var(--space-3)", padding: "var(--space-4) var(--space-5)", border: "1px solid var(--color-primary-border)", borderRadius: "var(--radius-lg)", backgroundColor: "var(--color-primary-light)" }}>
                  <div style={{ color: "var(--color-primary)", flexShrink: 0, marginTop: 1 }}><Shield size={16} /></div>
                  <div>
                    <p style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-semibold)", color: "var(--color-primary)", margin: "0 0 var(--space-1)" }}>Security Tip</p>
                    <p style={{ fontSize: "var(--text-sm)", color: "var(--color-primary)", margin: 0, opacity: 0.85 }}>Enable Two-Factor Authentication (2FA) for an extra layer of security on your account.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer style={{ backgroundColor: "var(--color-surface)", borderTop: "1px solid var(--color-border)", padding: "var(--space-6) 0" }}>
        <div className={CONTAINER_CLASS} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <p style={{ fontSize: "var(--text-base)", fontWeight: "var(--weight-bold)", color: "var(--color-text-primary)", margin: "0 0 var(--space-1)" }}>Atlas Food</p>
            <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)", margin: 0 }}>© {new Date().getFullYear()} Atlas Food Nutrition. All rights reserved.</p>
          </div>
          <div style={{ display: "flex", gap: "var(--space-6)" }}>
            {["Privacy Policy", "Terms of Service", "Clinical Standards", "Contact"].map((label) => (
              <Link key={label} href="#" style={{ fontSize: "var(--text-sm)", color: "var(--color-text-muted)", textDecoration: "underline", textUnderlineOffset: 3 }}>{label}</Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}

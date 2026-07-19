"use client";

import Link from "next/link";
import { useCallback, useRef, useState } from "react";
import {
  Loader2, User, Shield, Camera, LogOut, Settings, Search,
  X, Upload, Image as ImageIcon, Trash2, Eye, EyeOff, Lock, CheckCircle2,
  Info, ArrowRight,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useLogout } from "../hooks/useLogout";
import { authRoles } from "../constants/authRoles";
import { AppHeader } from "@/internal/components/layout/AppHeader";
import { CONTAINER_CLASS } from "@/internal/lib/layout";
import { getAccessToken } from "@/internal/lib/cookies";
import { cn } from "@/internal/lib/cn";

type ActiveSection = "personal" | "security";
type PhotoModal = "change" | "uploading" | "remove" | null;
type PasswordModal = "form" | "success" | null;

const FOOTER_LINKS = ["Privacy Policy", "Terms of Service", "Clinical Standards", "Contact"];

function passwordStrength(pw: string): { score: number; label: string; color: string } {
  if (!pw) return { score: 0, label: "", color: "" };
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const map: Record<number, { label: string; color: string }> = {
    1: { label: "WEAK", color: "text-danger" },
    2: { label: "FAIR", color: "text-warning" },
    3: { label: "GOOD", color: "text-info" },
    4: { label: "STRONG", color: "text-success" },
  };
  return { score, ...(map[score] ?? { label: "", color: "" }) };
}

function ModalOverlay({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 z-modal bg-black/45 flex items-center justify-center p-4"
    >
      {children}
    </div>
  );
}

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
      <div className="bg-surface rounded-xl w-full max-w-[480px] shadow-xl">
        <div className="flex items-start justify-between px-6 py-5 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-light text-primary flex items-center justify-center">
              <ImageIcon size={18} />
            </div>
            <div>
              <p className="m-0 font-semibold text-base text-text-primary">Change Profile Photo</p>
              <p className="m-0 text-sm text-text-muted">Update how you appear to others on Atlas Food</p>
            </div>
          </div>
          <button onClick={onClose} className="bg-transparent border-none cursor-pointer text-text-muted p-1">
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5 flex flex-col gap-3">
          <div
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
            className={cn(
              "border-2 border-dashed rounded-lg py-8 px-4 text-center cursor-pointer transition-fast",
              dragging ? "border-primary bg-primary-light" : "border-border bg-transparent"
            )}
          >
            <div className="w-12 h-12 rounded-full bg-primary-light text-primary flex items-center justify-center mx-auto mb-3">
              <Upload size={20} />
            </div>
            <p className="m-0 mb-1 font-semibold text-base text-text-primary">Upload From Device</p>
            <p className="m-0 text-sm text-text-muted">Drag and drop your file here</p>
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              hidden
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button className="border-[1.5px] border-border rounded-lg bg-surface py-5 px-3 flex flex-col items-center gap-2 cursor-pointer">
              <Camera size={22} className="text-text-secondary" />
              <span className="text-sm font-medium text-text-primary">Take Photo</span>
            </button>
            <button onClick={onRemoveClick} className="border-[1.5px] border-border rounded-lg bg-surface py-5 px-3 flex flex-col items-center gap-2 cursor-pointer">
              <Trash2 size={22} className="text-text-secondary" />
              <span className="text-sm font-medium text-text-primary">Remove Current</span>
            </button>
          </div>

          <div className="flex items-start gap-2 py-3 px-4 bg-background rounded-md">
            <Info size={14} className="text-text-muted shrink-0 mt-px" />
            <p className="m-0 text-xs text-text-muted leading-relaxed">
              Supported formats: JPG, PNG, WEBP.
              <br />
              Maximum file size: 5 MB. For best results, use a square image of at least 400×400px.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t border-border">
          <button onClick={onClose} className="btn btn-secondary btn-sm">Cancel</button>
          <button className="btn btn-primary btn-sm">Save Changes</button>
        </div>
      </div>
    </ModalOverlay>
  );
}

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
      <div className="bg-surface rounded-xl w-full max-w-[480px] shadow-xl">
        <div className="flex items-center justify-between px-6 py-5">
          <p className="m-0 font-semibold text-lg text-text-primary">Change Profile Photo</p>
          <button onClick={onClose} className="bg-transparent border-none cursor-pointer text-text-muted">
            <X size={18} />
          </button>
        </div>

        <div className="mx-6 mb-5 border-2 border-dashed border-primary-border rounded-lg p-5 bg-primary-light">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 rounded-md bg-surface border-[1.5px] border-primary-border flex items-center justify-center shrink-0">
              <ImageIcon size={20} className="text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="m-0 text-sm font-semibold text-text-primary overflow-hidden text-ellipsis whitespace-nowrap">{file.name}</p>
              <p className="m-0 text-xs text-text-muted">{total} MB · {progress < 100 ? "Uploading..." : "Done"}</p>
            </div>
            <button onClick={onBack} className="bg-transparent border-none cursor-pointer text-sm font-semibold text-primary">Cancel</button>
          </div>

          <div className="flex justify-between mb-1">
            <span className="text-xs text-text-muted">{progress}% complete</span>
            <span className="text-xs text-text-muted">{loaded} MB of {total} MB</span>
          </div>
          <div className="h-1.5 rounded-full bg-border">
            <div className="h-full rounded-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>

          <div className="flex items-start gap-2 mt-3 p-3 bg-surface rounded-md">
            <Info size={13} className="text-text-muted shrink-0 mt-px" />
            <p className="m-0 text-xs text-text-muted leading-relaxed">For best results, use a square image at least 400×400px. JPG or PNG only.</p>
          </div>
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t border-border">
          <button onClick={onBack} className="btn btn-secondary btn-sm">Back</button>
          <button className="btn btn-primary btn-sm" disabled={progress < 100}>Save Changes</button>
        </div>
      </div>
    </ModalOverlay>
  );
}

function RemovePhotoModal({ onClose, onConfirm }: { onClose: () => void; onConfirm: () => void }) {
  return (
    <ModalOverlay onClose={onClose}>
      <div className="bg-surface rounded-xl w-full max-w-[400px] shadow-xl p-8 text-center">
        <div className="w-[72px] h-[72px] rounded-full bg-primary-light text-primary flex items-center justify-center mx-auto mb-5">
          <Trash2 size={28} />
        </div>
        <p className="m-0 mb-3 text-xl font-bold text-text-primary">Remove Profile Photo?</p>
        <p className="m-0 mb-7 text-sm text-text-muted leading-relaxed">
          This will delete your current photo and revert to the default avatar. This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button onClick={onClose} className="btn btn-secondary flex-1 rounded-full">Cancel</button>
          <button onClick={onConfirm} className="btn btn-primary flex-1 rounded-full">Remove</button>
        </div>
      </div>
    </ModalOverlay>
  );
}

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
      <div className="bg-surface rounded-xl w-full max-w-[480px] shadow-xl">
        <div className="flex items-start justify-between p-6">
          <div>
            <p className="m-0 mb-1 font-bold text-xl text-text-primary">Change Password</p>
            <p className="m-0 text-sm text-text-muted">Ensure your account stays secure with a strong password.</p>
          </div>
          <button onClick={onClose} className="bg-transparent border-none cursor-pointer text-text-muted">
            <X size={18} />
          </button>
        </div>

        <div className="px-6 pb-6 flex flex-col gap-5">
          <div>
            <p className="m-0 mb-2 text-xs font-semibold text-text-muted tracking-wider">CURRENT PASSWORD</p>
            <div className="relative">
              <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
              <input
                type={showCurrent ? "text" : "password"}
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
                placeholder="••••••••••"
                className="pl-9 pr-10 w-full box-border"
              />
              <button type="button" onClick={() => setShowCurrent((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-text-muted">
                {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <div>
            <p className="m-0 mb-2 text-xs font-semibold text-text-muted tracking-wider">NEW PASSWORD</p>
            <div className="relative">
              <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
              <input
                type={showNext ? "text" : "password"}
                value={next}
                onChange={(e) => setNext(e.target.value)}
                placeholder="Min. 8 characters"
                className="pl-9 pr-10 w-full box-border"
              />
              <button type="button" onClick={() => setShowNext((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-text-muted">
                {showNext ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {next.length > 0 && (
              <div className="mt-2">
                <div className="flex justify-between mb-1">
                  <span className={cn("text-xs font-semibold", strength.color)}>{strength.label}</span>
                  <span className="text-xs text-text-muted">{strength.score * 25}% secure</span>
                </div>
                <div className="h-1 rounded-full bg-border">
                  <div className={cn("h-full rounded-full transition-all duration-200 bg-current", strength.color)} style={{ width: `${strength.score * 25}%` }} />
                </div>
              </div>
            )}
          </div>

          <div>
            <p className="m-0 mb-2 text-xs font-semibold text-text-muted tracking-wider">CONFIRM NEW PASSWORD</p>
            <div className="relative">
              <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
              <input
                type={showConfirm ? "text" : "password"}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Repeat password"
                className={cn("pl-9 pr-10 w-full box-border", mismatch && "border-danger")}
              />
              <button type="button" onClick={() => setShowConfirm((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-text-muted">
                {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {match && (
              <p className="mt-1 mb-0 text-xs text-success flex items-center gap-1">
                <CheckCircle2 size={12} /> Passwords match
              </p>
            )}
            {mismatch && <p className="mt-1 mb-0 text-xs text-danger">Passwords do not match</p>}
          </div>
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t border-border">
          <button onClick={onClose} className="btn btn-secondary btn-sm">Cancel</button>
          <button onClick={onSuccess} className="btn btn-primary btn-sm" disabled={!canSave}>Save New Password</button>
        </div>
      </div>
    </ModalOverlay>
  );
}

function PasswordSuccessModal({ onClose }: { onClose: () => void }) {
  return (
    <ModalOverlay onClose={onClose}>
      <div className="bg-surface rounded-xl w-full max-w-[360px] shadow-xl py-10 px-8 text-center">
        <div className="relative w-[72px] h-[72px] mx-auto mb-5">
          <div className="absolute -inset-4 rounded-full bg-success/10" />
          <div className="w-full h-full rounded-full bg-success flex items-center justify-center relative">
            <CheckCircle2 size={32} className="text-white" />
          </div>
        </div>
        <p className="m-0 mb-3 text-xl font-bold text-text-primary">Password Updated Successfully</p>
        <p className="m-0 mb-7 text-sm text-text-muted leading-relaxed">
          Your account is now more secure. You will receive a confirmation email shortly.
        </p>
        <button onClick={onClose} className="btn btn-primary w-full rounded-full flex items-center justify-center gap-2">
          Back to Profile <ArrowRight size={15} />
        </button>
      </div>
    </ModalOverlay>
  );
}

export function ProfileCard() {
  const { user, isAuthenticated } = useAuth();
  const logout = useLogout();
  const isLoading = !user && Boolean(getAccessToken());
  const [activeSection, setActiveSection] = useState<ActiveSection>("personal");

  const [photoModal, setPhotoModal] = useState<PhotoModal>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [passwordModal, setPasswordModal] = useState<PasswordModal>(null);

  const handleFileSelected = useCallback((file: File) => {
    setUploadFile(file);
    setUploadProgress(0);
    setPhotoModal("uploading");
    let pct = 0;
    const iv = setInterval(() => {
      pct += Math.floor(Math.random() * 18) + 5;
      if (pct >= 100) { pct = 100; clearInterval(iv); }
      setUploadProgress(pct);
    }, 350);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 size={36} className="animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", backgroundColor: "var(--color-bg)" }}>
        <AppHeader />
        <div className="flex-1 flex flex-col items-center justify-center gap-4 p-4">
          <p className="text-text-muted text-sm">Anda belum masuk.</p>
          <Link href="/login" className="link-primary-hover font-medium">
            Masuk ke akun →
          </Link>
        </div>
      </div>
    );
  }

  const initials = user.name
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="min-h-screen flex flex-col bg-background">
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
      <div className={`${CONTAINER_CLASS} pt-8 pb-2`}>
        <h1 className="text-2xl font-bold text-text-primary mb-1">My Profile</h1>
        <p className="text-sm text-text-muted m-0">
          Manage your account information and security preferences.
        </p>
      </div>

      {/* Two-column layout */}
      <div className={`${CONTAINER_CLASS} flex-1 pt-6 pb-10 grid grid-cols-[280px_1fr] gap-6 items-start`}>
        {/* ── Left sidebar ── */}
        <div className="flex flex-col gap-4">

          {/* Avatar card */}
          <div className="card p-6 flex flex-col items-center gap-3">
            {/* Avatar with camera overlay */}
            <div className="relative inline-flex">
              <div className="w-24 h-24 rounded-full bg-primary-light text-primary text-2xl font-bold flex items-center justify-center border-[3px] border-white shadow-md overflow-hidden">
                {initials}
              </div>
              {/* Camera badge */}
              <button
                onClick={() => setPhotoModal("change")}
                className="absolute bottom-1 right-1 w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center border-2 border-white cursor-pointer"
              >
                <Camera size={12} />
              </button>
            </div>

            {/* Name + role */}
            <div className="text-center">
              <p className="text-lg font-bold text-text-primary mb-1">{user.name}</p>
              <p className="text-sm text-text-muted m-0 capitalize">
                {user.role === authRoles.admin ? "Admin Member" : "Pro Plan Member"}
              </p>
            </div>

            {/* Change Photo button */}
            <button onClick={() => setPhotoModal("change")} className="btn btn-outline btn-sm btn-full mt-1">
              Change Photo
            </button>
          </div>

          {/* Navigation card */}
          <div className="card p-2 overflow-visible">
            <button
              onClick={() => setActiveSection("personal")}
              className={`profile-nav-item${activeSection === "personal" ? " profile-nav-item--active" : ""}`}
            >
              <User size={16} />
              Personal Info
            </button>

            <button
              onClick={() => setActiveSection("security")}
              className={`profile-nav-item${activeSection === "security" ? " profile-nav-item--active" : ""}`}
            >
              <Shield size={16} />
              Security
            </button>

            {user.role === authRoles.admin && (
              <>
                <div className="h-px bg-border my-2 mx-3" />
                <Link href="/admin/surveys" className="profile-nav-item">
                  <Settings size={16} />
                  Panel Admin
                </Link>
              </>
            )}

            <div className="h-px bg-border my-2 mx-3" />

            <Link href="/find-food" className="profile-nav-item">
              <Search size={16} />
              Find Food
            </Link>

            <button
              onClick={() => logout()}
              className="profile-nav-item profile-nav-item--danger"
            >
              <LogOut size={16} />
              Keluar
            </button>
          </div>
        </div>

        {/* ── Right content ── */}
        <div className="flex flex-col gap-5">

          {/* Personal Information */}
          {activeSection === "personal" && (
            <div className="card">
              {/* Card header */}
              <div className="flex items-center justify-between py-5 px-6 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-md bg-primary-light text-primary flex items-center justify-center">
                    <User size={18} />
                  </div>
                  <h2 className="text-lg font-semibold text-text-primary m-0">Personal Information</h2>
                </div>
                <button className="btn btn-link text-sm">Edit Profile</button>
              </div>

              {/* Form body */}
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input type="text" defaultValue={user.name} readOnly />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input type="email" defaultValue={user.email} readOnly />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input type="tel" placeholder="+62 000-0000-0000" />
                  </div>
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
                    <input type="date" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Age</label>
                    <select defaultValue="">
                      <option value="" disabled>Pilih rentang usia</option>
                      <option value="10">10 years</option>
                      <option value="20">20 years</option>
                      <option value="30">30 years</option>
                      <option value="40">40 years</option>
                    </select>
                  </div>
                </div>

                {/* Divider */}
                <div className="h-px bg-border mt-6 mb-5" />

                {/* Actions */}
                <div className="flex justify-end gap-3">
                  <button className="btn btn-secondary">Cancel</button>
                  <button className="btn btn-primary">Save Changes</button>
                </div>
              </div>
            </div>
          )}

          {/* Security */}
          {activeSection === "security" && (
            <div className="card">
              {/* Card header */}
              <div className="flex items-center gap-3 py-5 px-6 border-b border-border">
                <div className="w-9 h-9 rounded-md bg-primary-light text-primary flex items-center justify-center">
                  <Shield size={18} />
                </div>
                <h2 className="text-lg font-semibold text-text-primary m-0">Security</h2>
              </div>

              {/* Security body */}
              <div className="p-6 flex flex-col gap-4">

                {/* Password row */}
                <div className="flex items-center justify-between py-4 px-5 border border-border rounded-lg bg-surface">
                  <div>
                    <p className="text-sm font-semibold text-text-primary mb-1">Password</p>
                    <p className="text-sm text-text-muted m-0 tracking-[0.15em]">••••••••••••</p>
                  </div>
                  <button onClick={() => setPasswordModal("form")} className="btn btn-outline btn-sm">Change Password</button>
                </div>

                {/* Security tip */}
                <div className="flex items-start gap-3 py-4 px-5 border border-primary-border rounded-lg bg-primary-light">
                  <div className="text-primary shrink-0 mt-px">
                    <Shield size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-primary mb-1">Security Tip</p>
                    <p className="text-sm text-primary m-0 opacity-85">
                      Enable Two-Factor Authentication (2FA) for an extra layer of security on your account.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-surface border-t border-border py-6">
        <div className={`${CONTAINER_CLASS} flex items-center justify-between`}>
          <div>
            <p className="text-base font-bold text-text-primary mb-1">Atlas Food</p>
            <p className="text-xs text-text-muted m-0">
              © {new Date().getFullYear()} Atlas Food Nutrition. All rights reserved.
            </p>
          </div>
          <div className="flex gap-6">
            {FOOTER_LINKS.map((label) => (
              <Link key={label} href="#" className="text-sm text-text-muted underline underline-offset-[3px]">
                {label}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}

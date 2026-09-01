"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Loader2, User, Shield, Camera, LogOut, Settings, Search,
  X, Upload, Image as ImageIcon, Eye, EyeOff, Lock, CheckCircle2,
  Info, ArrowRight, AlertCircle, ClipboardList, Calendar, Flame, Utensils,
  ChevronRight, FileText,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useLogout } from "../hooks/useLogout";
import { authRoles } from "../constants/authRoles";
import { AppHeader } from "@/internal/components/layout/AppHeader";
import { CONTAINER_CLASS } from "@/internal/lib/layout";
import { getAccessToken } from "@/internal/lib/cookies";
import { cn } from "@/internal/lib/cn";
import { API_ASSET_ORIGIN } from "@/internal/pkg/api";
import { changePassword, updateProfile, uploadProfilePhoto } from "../services/authService";
import { useAuthStore } from "../store/authStore";
import { getMySubmissions, getMySubmissionDetail } from "@/internal/domain/submission/services/submissionService";
import type { SurveySubmission } from "@/internal/domain/submission/types/submission";
import { AiRecommendationPanel } from "@/internal/domain/ai";

type ActiveSection = "personal" | "history" | "security";
type PhotoModal = "change" | "uploading" | null;
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

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2 py-2 px-3 bg-danger-light border border-danger-border rounded-md text-danger text-xs">
      <AlertCircle size={14} className="shrink-0 mt-px" />
      <span>{message}</span>
    </div>
  );
}

function ChangePhotoModal({
  onClose,
  onFileSelected,
  error,
}: {
  onClose: () => void;
  onFileSelected: (file: File) => void;
  error: string | null;
}) {
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
          {error && <ErrorBanner message={error} />}
          <label
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
            className={cn(
              "border-2 border-dashed rounded-lg py-8 px-4 text-center cursor-pointer transition-fast block",
              dragging ? "border-primary bg-primary-light" : "border-border bg-transparent"
            )}
          >
            <div className="w-12 h-12 rounded-full bg-primary-light text-primary flex items-center justify-center mx-auto mb-3">
              <Upload size={20} />
            </div>
            <p className="m-0 mb-1 font-semibold text-base text-text-primary">Upload From Device</p>
            <p className="m-0 text-sm text-text-muted">Drag and drop your file here, or click to browse</p>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              hidden
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
            />
          </label>

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
        </div>
      </div>
    </ModalOverlay>
  );
}

function UploadProgressModal({
  file,
  uploading,
  error,
  onClose,
}: {
  file: File;
  uploading: boolean;
  error: string | null;
  onClose: () => void;
}) {
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
              <p className="m-0 text-xs text-text-muted">
                {total} MB · {error ? "Failed" : uploading ? "Uploading..." : "Done"}
              </p>
            </div>
          </div>

          {error ? (
            <ErrorBanner message={error} />
          ) : (
            <div className="h-1.5 rounded-full bg-border overflow-hidden">
              <div
                className={cn("h-full bg-primary transition-all", uploading ? "w-1/2 animate-pulse" : "w-full")}
              />
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t border-border">
          <button onClick={onClose} className="btn btn-secondary btn-sm">
            {uploading ? "Close" : "Done"}
          </button>
        </div>
      </div>
    </ModalOverlay>
  );
}

function ChangePasswordModal({
  onClose,
  onSubmit,
  submitting,
  error,
}: {
  onClose: () => void;
  onSubmit: (current: string, next: string) => void;
  submitting: boolean;
  error: string | null;
}) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const strength = passwordStrength(next);
  const match = next.length > 0 && confirm.length > 0 && next === confirm;
  const mismatch = confirm.length > 0 && next !== confirm;
  const canSave = current.length > 0 && strength.score >= 2 && match && !submitting;

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
          {error && <ErrorBanner message={error} />}

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
          <button onClick={() => onSubmit(current, next)} className="btn btn-primary btn-sm" disabled={!canSave}>
            {submitting ? "Saving..." : "Save New Password"}
          </button>
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
          Your account is now more secure. Please use your new password next time you log in.
        </p>
        <button onClick={onClose} className="btn btn-primary w-full rounded-full flex items-center justify-center gap-2">
          Back to Profile <ArrowRight size={15} />
        </button>
      </div>
    </ModalOverlay>
  );
}

function RecallHistorySection() {
  const [submissions, setSubmissions] = useState<SurveySubmission[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Detail modal state
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detailData, setDetailData] = useState<SurveySubmission | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    setLoading(true);
    getMySubmissions(1, 50)
      .then((data) => {
        setSubmissions(data.submissions);
        setTotal(data.total);
        setLoading(false);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Gagal memuat riwayat survey");
        setLoading(false);
      });
  }, []);

  const handleOpenDetail = async (id: string) => {
    setSelectedId(id);
    setLoadingDetail(true);
    setDetailData(null);
    try {
      const data = await getMySubmissionDetail(id);
      setDetailData(data);
    } catch {
      const item = submissions.find((s) => s.id === id);
      if (item) setDetailData(item);
    } finally {
      setLoadingDetail(false);
    }
  };

  const avgEnergy = submissions.length
    ? Math.round(
        submissions.reduce((acc, s) => acc + (s.total_energy || 0), 0) / submissions.length
      )
    : 0;

  return (
    <div className="card">
      <div className="flex items-center justify-between py-5 px-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-md bg-primary-light text-primary flex items-center justify-center">
            <ClipboardList size={18} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-text-primary m-0">Riwayat Survey Recall</h2>
            <p className="text-xs text-text-muted m-0">Daftar pengisian 24-hour food recall yang pernah Anda selesaikan.</p>
          </div>
        </div>
      </div>

      <div className="p-6 flex flex-col gap-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl border border-border bg-surface-alt flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary-light text-primary flex items-center justify-center shrink-0">
              <ClipboardList size={20} />
            </div>
            <div>
              <p className="text-xs text-text-muted font-semibold uppercase tracking-wider m-0">Total Recall</p>
              <p className="text-xl font-bold text-text-primary m-0">{total} Laporan</p>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-border bg-surface-alt flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-warning-light text-warning flex items-center justify-center shrink-0">
              <Flame size={20} />
            </div>
            <div>
              <p className="text-xs text-text-muted font-semibold uppercase tracking-wider m-0">Rata-Rata Energi</p>
              <p className="text-xl font-bold text-text-primary m-0">
                {avgEnergy} <span className="text-xs font-normal text-text-muted">kkal/hari</span>
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-border bg-surface-alt flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-success-light text-success flex items-center justify-center shrink-0">
              <Calendar size={20} />
            </div>
            <div>
              <p className="text-xs text-text-muted font-semibold uppercase tracking-wider m-0">Terakhir Diisi</p>
              <p className="text-sm font-bold text-text-primary m-0">
                {submissions.length
                  ? new Date(
                      submissions[0].submitted_at || submissions[0].created_at || ""
                    ).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                  : "Belum ada"}
              </p>
            </div>
          </div>
        </div>

        {/* List Content */}
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-2 text-text-muted">
            <Loader2 size={24} className="animate-spin text-primary" />
            <span className="text-sm">Memuat riwayat recall...</span>
          </div>
        ) : error ? (
          <ErrorBanner message={error} />
        ) : submissions.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center gap-3 text-center border-2 border-dashed border-border rounded-xl bg-surface-alt p-6">
            <div className="w-12 h-12 rounded-full bg-border/50 text-text-muted flex items-center justify-center">
              <ClipboardList size={24} />
            </div>
            <div>
              <p className="font-semibold text-text-primary text-base m-0">Belum Ada Riwayat Survey</p>
              <p className="text-sm text-text-muted m-0 mt-1 max-w-sm">
                Anda belum pernah mengisi survey food recall. Akses tautan survey dari peneliti atau bergabung melalui halaman utama.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {submissions.map((sub) => (
              <div
                key={sub.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-5 border border-border rounded-xl bg-surface hover:border-primary-border transition-all gap-4 shadow-sm"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary-light text-primary flex items-center justify-center shrink-0 mt-0.5">
                    <Utensils size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-semibold text-text-primary text-base m-0">
                        Recall{" "}
                        {new Date(
                          sub.submitted_at || sub.created_at || ""
                        ).toLocaleDateString("id-ID", {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </h4>
                      <span className="px-2 py-0.5 rounded-full bg-surface-alt text-text-muted text-xs font-mono font-medium">
                        ID: {sub.id.slice(0, 8)}...
                      </span>
                    </div>
                    <p className="text-xs text-text-muted m-0 mt-1 flex items-center gap-3">
                      <span>
                        🕒{" "}
                        {new Date(
                          sub.submitted_at || sub.created_at || ""
                        ).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}{" "}
                        WIB
                      </span>
                      {sub.meal_count ? <span>· {sub.meal_count} Waktu Makan</span> : null}
                      {sub.total_foods ? <span>· {sub.total_foods} Item Makanan</span> : null}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 border-t sm:border-t-0 pt-3 sm:pt-0 border-border justify-between sm:justify-end">
                  <div className="text-left sm:text-right">
                    <p className="font-mono font-bold text-primary text-base m-0">
                      {Math.round(sub.total_energy || (sub.daily_total?.energy ?? 0))}{" "}
                      <span className="text-xs text-text-muted font-sans font-normal">kkal</span>
                    </p>
                    <p className="text-[11px] text-text-muted m-0 mt-0.5">
                      P: {Math.round(sub.total_protein || (sub.daily_total?.protein ?? 0))}g · K:{" "}
                      {Math.round(sub.total_carbs || (sub.daily_total?.carbs ?? 0))}g · L:{" "}
                      {Math.round(sub.total_fat || (sub.daily_total?.fat ?? 0))}g
                    </p>
                  </div>

                  <button
                    onClick={() => handleOpenDetail(sub.id)}
                    className="btn btn-secondary btn-sm flex items-center gap-1.5 shrink-0"
                  >
                    <span>Detail</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedId && (
        <ModalOverlay onClose={() => setSelectedId(null)}>
          <div className="bg-surface rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
            <div className="sticky top-0 z-10 bg-surface flex items-center justify-between px-6 py-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary-light text-primary flex items-center justify-center">
                  <FileText size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-text-primary m-0">Detail Riwayat Recall</h3>
                  <p className="text-xs text-text-muted m-0">ID: {selectedId}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedId(null)}
                className="p-1 rounded-md text-text-muted hover:bg-surface-alt"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 flex flex-col gap-6">
              {loadingDetail ? (
                <div className="py-12 flex flex-col items-center justify-center gap-2 text-text-muted">
                  <Loader2 size={24} className="animate-spin text-primary" />
                  <span>Memuat detail makanan & analisis...</span>
                </div>
              ) : detailData ? (
                <>
                  {/* Daily Total Header Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-surface-alt p-4 rounded-xl border border-border">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">
                        Energi Total
                      </span>
                      <span className="font-mono text-lg font-bold text-primary">
                        {Math.round(
                          detailData.total_energy || (detailData.daily_total?.energy ?? 0)
                        )}{" "}
                        <span className="text-xs font-normal text-text-muted">kkal</span>
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">
                        Protein
                      </span>
                      <span className="font-mono text-lg font-bold text-text-primary">
                        {Math.round(
                          detailData.total_protein || (detailData.daily_total?.protein ?? 0)
                        )}{" "}
                        <span className="text-xs font-normal text-text-muted">g</span>
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">
                        Karbohidrat
                      </span>
                      <span className="font-mono text-lg font-bold text-text-primary">
                        {Math.round(
                          detailData.total_carbs || (detailData.daily_total?.carbs ?? 0)
                        )}{" "}
                        <span className="text-xs font-normal text-text-muted">g</span>
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">
                        Lemak
                      </span>
                      <span className="font-mono text-lg font-bold text-text-primary">
                        {Math.round(
                          detailData.total_fat || (detailData.daily_total?.fat ?? 0)
                        )}{" "}
                        <span className="text-xs font-normal text-text-muted">g</span>
                      </span>
                    </div>
                  </div>

                  {/* Meals Breakdown */}
                  {Array.isArray(detailData.meals_data) && detailData.meals_data.length > 0 ? (
                    <div className="flex flex-col gap-4">
                      <h4 className="font-semibold text-text-primary text-base m-0">
                        Rincian Makanan per Waktu Makan
                      </h4>
                      {detailData.meals_data.map((meal, idx) => (
                        <div
                          key={idx}
                          className="border border-border rounded-xl overflow-hidden bg-surface"
                        >
                          <div className="bg-surface-alt px-4 py-3 border-b border-border flex justify-between items-center">
                            <span className="font-semibold text-sm text-text-primary flex items-center gap-2">
                              <Utensils size={14} className="text-primary" />
                              {meal.name} {meal.time ? `(${meal.time})` : ""}
                            </span>
                            {meal.meal_total ? (
                              <span className="font-mono text-xs font-semibold text-primary">
                                {Math.round(meal.meal_total.energy)} kkal
                              </span>
                            ) : null}
                          </div>

                          <div className="divide-y divide-border">
                            {meal.foods &&
                              meal.foods.map((food, fIdx) => (
                                <div
                                  key={fIdx}
                                  className="px-4 py-3 flex items-center justify-between text-sm"
                                >
                                  <div>
                                    <p className="font-medium text-text-primary m-0">
                                      {food.food_name}
                                    </p>
                                    {food.additionals && food.additionals.length > 0 ? (
                                      <p className="text-xs text-text-muted m-0 mt-0.5">
                                        Bahan tambahan:{" "}
                                        {food.additionals.map((a) => a.name).join(", ")}
                                      </p>
                                    ) : null}
                                  </div>
                                  <div className="text-right">
                                    <span className="font-mono font-semibold text-text-primary block">
                                      {food.portion_gram}g
                                    </span>
                                    {food.nutrients ? (
                                      <span className="text-xs text-text-muted font-mono">
                                        {Math.round(food.nutrients.energy)} kkal
                                      </span>
                                    ) : null}
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : null}

                  {/* AI Recommendation Panel */}
                  <div className="border-t border-border pt-4">
                    <AiRecommendationPanel submissionId={selectedId} />
                  </div>
                </>
              ) : (
                <p className="text-text-muted text-sm text-center py-6">
                  Data detail tidak tersedia.
                </p>
              )}
            </div>
          </div>
        </ModalOverlay>
      )}
    </div>
  );
}

export function ProfileCard() {
  const { user, isAuthenticated } = useAuth();
  const logout = useLogout();
  const updateUser = useAuthStore((state) => state.updateUser);
  const isLoading = !user && Boolean(getAccessToken());
  const [activeSection, setActiveSection] = useState<ActiveSection>("personal");

  const [photoModal, setPhotoModal] = useState<PhotoModal>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);

  const [passwordModal, setPasswordModal] = useState<PasswordModal>(null);
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const [profileForm, setProfileForm] = useState({ name: user?.name ?? "", phone: user?.phone ?? "", gender: user?.gender ?? "", birth_date: user?.birth_date ?? "" });
  const [profileSubmitting, setProfileSubmitting] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSaved, setProfileSaved] = useState(false);
  const profileHydrated = useRef(Boolean(user));

  useEffect(() => {
    if (!user || profileHydrated.current) return;
    profileHydrated.current = true;
    setProfileForm({
      name: user.name,
      phone: user.phone ?? "",
      gender: user.gender ?? "",
      birth_date: user.birth_date ?? "",
    });
  }, [user]);

  const handleFileSelected = useCallback(async (file: File) => {
    setUploadFile(file);
    setUploading(true);
    setPhotoError(null);
    setPhotoModal("uploading");
    try {
      const token = getAccessToken();
      if (!token) throw new Error("Sesi habis, silakan masuk ulang.");
      const profile = await uploadProfilePhoto(file, token);
      updateUser({ photo_url: profile.photo_url });
      setUploading(false);
    } catch (err) {
      setUploading(false);
      setPhotoError(err instanceof Error ? err.message : "Gagal mengunggah foto");
    }
  }, [updateUser]);

  const handlePasswordSubmit = useCallback(async (current: string, next: string) => {
    setPasswordSubmitting(true);
    setPasswordError(null);
    try {
      const token = getAccessToken();
      if (!token) throw new Error("Sesi habis, silakan masuk ulang.");
      await changePassword({ current_password: current, new_password: next }, token);
      setPasswordSubmitting(false);
      setPasswordModal("success");
    } catch (err) {
      setPasswordSubmitting(false);
      setPasswordError(err instanceof Error ? err.message : "Gagal mengubah password");
    }
  }, []);

  const handleProfileSubmit = useCallback(async () => {
    setProfileSubmitting(true);
    setProfileError(null);
    setProfileSaved(false);
    try {
      const token = getAccessToken();
      if (!token) throw new Error("Sesi habis, silakan masuk ulang.");
      const profile = await updateProfile(
        {
          name: profileForm.name,
          phone: profileForm.phone || null,
          gender: (profileForm.gender || null) as "male" | "female" | null,
          birth_date: profileForm.birth_date || null,
        },
        token
      );
      updateUser({ name: profile.name, phone: profile.phone, gender: profile.gender, birth_date: profile.birth_date });
      setProfileSubmitting(false);
      setProfileSaved(true);
    } catch (err) {
      setProfileSubmitting(false);
      setProfileError(err instanceof Error ? err.message : "Gagal menyimpan profil");
    }
  }, [profileForm, updateUser]);

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

  const photoSrc = user.photo_url ? `${API_ASSET_ORIGIN}${user.photo_url}` : null;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AppHeader />

      {/* Modals */}
      {photoModal === "change" && (
        <ChangePhotoModal
          onClose={() => { setPhotoModal(null); setPhotoError(null); }}
          onFileSelected={handleFileSelected}
          error={photoError}
        />
      )}
      {photoModal === "uploading" && uploadFile && (
        <UploadProgressModal
          file={uploadFile}
          uploading={uploading}
          error={photoError}
          onClose={() => { setPhotoModal(null); setUploadFile(null); setPhotoError(null); }}
        />
      )}
      {passwordModal === "form" && (
        <ChangePasswordModal
          onClose={() => { setPasswordModal(null); setPasswordError(null); }}
          onSubmit={handlePasswordSubmit}
          submitting={passwordSubmitting}
          error={passwordError}
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
      <div className={`${CONTAINER_CLASS} flex-1 pt-6 pb-10 grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6 items-start`}>
        {/* ── Left sidebar ── */}
        <div className="flex flex-col gap-4">

          {/* Avatar card */}
          <div className="card p-6 flex flex-col items-center gap-3">
            {/* Avatar with camera overlay */}
            <div className="relative inline-flex">
              {photoSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={photoSrc}
                  alt={user.name}
                  className="w-24 h-24 rounded-full object-cover border-[3px] border-white shadow-md"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-primary-light text-primary text-2xl font-bold flex items-center justify-center border-[3px] border-white shadow-md overflow-hidden">
                  {initials}
                </div>
              )}
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
              onClick={() => setActiveSection("history")}
              className={`profile-nav-item${activeSection === "history" ? " profile-nav-item--active" : ""}`}
            >
              <ClipboardList size={16} />
              Riwayat Recall Saya
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
        <div className="flex flex-col gap-5 min-w-0">

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
              </div>

              {/* Form body */}
              <div className="p-6">
                {profileError && <div className="mb-4"><ErrorBanner message={profileError} /></div>}
                {profileSaved && (
                  <p className="mb-4 text-sm text-success flex items-center gap-1">
                    <CheckCircle2 size={14} /> Profil berhasil disimpan
                  </p>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input
                      type="text"
                      value={profileForm.name}
                      onChange={(e) => setProfileForm((f) => ({ ...f, name: e.target.value }))}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input type="email" defaultValue={user.email} readOnly />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input
                      type="tel"
                      placeholder="+62 000-0000-0000"
                      value={profileForm.phone ?? ""}
                      onChange={(e) => setProfileForm((f) => ({ ...f, phone: e.target.value }))}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Gender</label>
                    <select
                      value={profileForm.gender ?? ""}
                      onChange={(e) => setProfileForm((f) => ({ ...f, gender: e.target.value as "male" | "female" | "" }))}
                    >
                      <option value="">Pilih jenis kelamin</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Birth Date</label>
                    <input
                      type="date"
                      value={profileForm.birth_date ?? ""}
                      max={new Date().toISOString().split("T")[0]}
                      onChange={(e) => setProfileForm((f) => ({ ...f, birth_date: e.target.value }))}
                    />
                  </div>
                </div>

                {/* Divider */}
                <div className="h-px bg-border mt-6 mb-5" />

                {/* Actions */}
                <div className="flex justify-end gap-3">
                  <button
                    className="btn btn-secondary"
                    onClick={() => {
                      setProfileForm({ name: user.name, phone: user.phone ?? "", gender: user.gender ?? "", birth_date: user.birth_date ?? "" });
                      setProfileError(null);
                      setProfileSaved(false);
                    }}
                  >
                    Cancel
                  </button>
                  <button className="btn btn-primary" onClick={handleProfileSubmit} disabled={profileSubmitting || !profileForm.name.trim()}>
                    {profileSubmitting ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Recall History */}
          {activeSection === "history" && <RecallHistorySection />}

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

"use client";

import Link from "next/link";
import { useState } from "react";
import { Loader2, User, Shield, Camera, LogOut, Settings, Search } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useLogout } from "../hooks/useLogout";
import { authRoles } from "../constants/authRoles";
import { AppHeader } from "@/internal/components/layout/AppHeader";
import { CONTAINER_CLASS } from "@/internal/lib/layout";
import { getAccessToken } from "@/internal/lib/cookies";

type ActiveSection = "personal" | "security";

export function ProfileCard() {
  const { user, isAuthenticated } = useAuth();
  const logout = useLogout();
  const isLoading = !user && Boolean(getAccessToken());
  const [activeSection, setActiveSection] = useState<ActiveSection>("personal");

  if (isLoading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "var(--color-bg)",
        }}
      >
        <Loader2 size={36} className="animate-spin" style={{ color: "var(--color-primary)" }} />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "var(--color-bg)",
        }}
      >
        <AppHeader />
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "var(--space-4)",
            padding: "var(--space-4)",
          }}
        >
          <p style={{ color: "var(--color-text-muted)", fontSize: "var(--text-sm)" }}>
            Anda belum masuk.
          </p>
          <Link
            href="/login"
            className="link-primary-hover"
            style={{ fontWeight: "var(--weight-medium)" }}
          >
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
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "var(--color-bg)",
      }}
    >
      <AppHeader />

      {/* Page header */}
      <div className={CONTAINER_CLASS} style={{ paddingTop: "var(--space-8)", paddingBottom: "var(--space-2)" }}>
        <h1 style={{ fontSize: "var(--text-2xl)", fontWeight: "var(--weight-bold)", color: "var(--color-text-primary)", margin: "0 0 var(--space-1)" }}>
          My Profile
        </h1>
        <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-muted)", margin: 0 }}>
          Manage your account information and security preferences.
        </p>
      </div>

      {/* Two-column layout */}
      <div
        className={CONTAINER_CLASS}
        style={{
          flex: 1,
          paddingTop: "var(--space-6)",
          paddingBottom: "var(--space-10)",
          display: "grid",
          gridTemplateColumns: "280px 1fr",
          gap: "var(--space-6)",
          alignItems: "start",
        }}
      >
        {/* ── Left sidebar ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>

          {/* Avatar card */}
          <div
            className="card"
            style={{ padding: "var(--space-6)", display: "flex", flexDirection: "column", alignItems: "center", gap: "var(--space-3)" }}
          >
            {/* Avatar with camera overlay */}
            <div style={{ position: "relative", display: "inline-flex" }}>
              <div
                style={{
                  width: 96,
                  height: 96,
                  borderRadius: "50%",
                  backgroundColor: "var(--color-primary-light)",
                  color: "var(--color-primary)",
                  fontSize: "var(--text-2xl)",
                  fontWeight: "var(--weight-bold)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "3px solid var(--color-white)",
                  boxShadow: "var(--shadow-md)",
                  overflow: "hidden",
                }}
              >
                {initials}
              </div>
              {/* Camera badge */}
              <div
                style={{
                  position: "absolute",
                  bottom: 4,
                  right: 4,
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  backgroundColor: "var(--color-primary)",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "2px solid var(--color-white)",
                  cursor: "pointer",
                }}
              >
                <Camera size={12} />
              </div>
            </div>

            {/* Name + role */}
            <div style={{ textAlign: "center" }}>
              <p
                style={{
                  fontSize: "var(--text-lg)",
                  fontWeight: "var(--weight-bold)",
                  color: "var(--color-text-primary)",
                  margin: "0 0 var(--space-1)",
                }}
              >
                {user.name}
              </p>
              <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-muted)", margin: 0, textTransform: "capitalize" }}>
                {user.role === authRoles.admin ? "Admin Member" : "Pro Plan Member"}
              </p>
            </div>

            {/* Change Photo button */}
            <button
              className="btn btn-outline btn-sm btn-full"
              style={{ marginTop: "var(--space-1)" }}
            >
              Change Photo
            </button>
          </div>

          {/* Navigation card */}
          <div className="card" style={{ padding: "var(--space-2)", overflow: "visible" }}>
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
                <div style={{ height: 1, backgroundColor: "var(--color-border)", margin: "var(--space-2) var(--space-3)" }} />
                <Link href="/admin/surveys" className="profile-nav-item">
                  <Settings size={16} />
                  Panel Admin
                </Link>
              </>
            )}

            <div style={{ height: 1, backgroundColor: "var(--color-border)", margin: "var(--space-2) var(--space-3)" }} />

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
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>

          {/* Personal Information */}
          {activeSection === "personal" && (
            <div className="card">
              {/* Card header */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "var(--space-5) var(--space-6)",
                  borderBottom: "1px solid var(--color-border)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: "var(--radius-md)",
                      backgroundColor: "var(--color-primary-light)",
                      color: "var(--color-primary)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <User size={18} />
                  </div>
                  <h2
                    style={{
                      fontSize: "var(--text-lg)",
                      fontWeight: "var(--weight-semibold)",
                      color: "var(--color-text-primary)",
                      margin: 0,
                    }}
                  >
                    Personal Information
                  </h2>
                </div>
                <button className="btn btn-link" style={{ fontSize: "var(--text-sm)" }}>
                  Edit Profile
                </button>
              </div>

              {/* Form body */}
              <div style={{ padding: "var(--space-6)" }}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "var(--space-4)",
                  }}
                >
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
                <div style={{ height: 1, backgroundColor: "var(--color-border)", margin: "var(--space-6) 0 var(--space-5)" }} />

                {/* Actions */}
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
              {/* Card header */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--space-3)",
                  padding: "var(--space-5) var(--space-6)",
                  borderBottom: "1px solid var(--color-border)",
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "var(--radius-md)",
                    backgroundColor: "var(--color-primary-light)",
                    color: "var(--color-primary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Shield size={18} />
                </div>
                <h2
                  style={{
                    fontSize: "var(--text-lg)",
                    fontWeight: "var(--weight-semibold)",
                    color: "var(--color-text-primary)",
                    margin: 0,
                  }}
                >
                  Security
                </h2>
              </div>

              {/* Security body */}
              <div style={{ padding: "var(--space-6)", display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>

                {/* Password row */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "var(--space-4) var(--space-5)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "var(--radius-lg)",
                    backgroundColor: "var(--color-surface)",
                  }}
                >
                  <div>
                    <p
                      style={{
                        fontSize: "var(--text-sm)",
                        fontWeight: "var(--weight-semibold)",
                        color: "var(--color-text-primary)",
                        margin: "0 0 var(--space-1)",
                      }}
                    >
                      Password
                    </p>
                    <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-muted)", margin: 0, letterSpacing: "0.15em" }}>
                      ••••••••••••
                    </p>
                  </div>
                  <button className="btn btn-outline btn-sm">Change Password</button>
                </div>

                {/* Security tip */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "var(--space-3)",
                    padding: "var(--space-4) var(--space-5)",
                    border: "1px solid var(--color-primary-border)",
                    borderRadius: "var(--radius-lg)",
                    backgroundColor: "var(--color-primary-light)",
                  }}
                >
                  <div style={{ color: "var(--color-primary)", flexShrink: 0, marginTop: 1 }}>
                    <Shield size={16} />
                  </div>
                  <div>
                    <p
                      style={{
                        fontSize: "var(--text-sm)",
                        fontWeight: "var(--weight-semibold)",
                        color: "var(--color-primary)",
                        margin: "0 0 var(--space-1)",
                      }}
                    >
                      Security Tip
                    </p>
                    <p style={{ fontSize: "var(--text-sm)", color: "var(--color-primary)", margin: 0, opacity: 0.85 }}>
                      Enable Two-Factor Authentication (2FA) for an extra layer of security on your account.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Show both sections when no specific section active — default shows both stacked */}
        </div>
      </div>

      {/* Footer */}
      <footer
        style={{
          backgroundColor: "var(--color-surface)",
          borderTop: "1px solid var(--color-border)",
          padding: "var(--space-6) 0",
        }}
      >
        <div
          className={CONTAINER_CLASS}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <p
              style={{
                fontSize: "var(--text-base)",
                fontWeight: "var(--weight-bold)",
                color: "var(--color-text-primary)",
                margin: "0 0 var(--space-1)",
              }}
            >
              Atlas Food
            </p>
            <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)", margin: 0 }}>
              © {new Date().getFullYear()} Atlas Food Nutrition. All rights reserved.
            </p>
          </div>
          <div style={{ display: "flex", gap: "var(--space-6)" }}>
            {["Privacy Policy", "Terms of Service", "Clinical Standards", "Contact"].map((label) => (
              <Link
                key={label}
                href="#"
                style={{
                  fontSize: "var(--text-sm)",
                  color: "var(--color-text-muted)",
                  textDecoration: "underline",
                  textUnderlineOffset: 3,
                }}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}

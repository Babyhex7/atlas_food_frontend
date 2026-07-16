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

const FOOTER_LINKS = ["Privacy Policy", "Terms of Service", "Clinical Standards", "Contact"];

export function ProfileCard() {
  const { user, isAuthenticated } = useAuth();
  const logout = useLogout();
  const isLoading = !user && Boolean(getAccessToken());
  const [activeSection, setActiveSection] = useState<ActiveSection>("personal");

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 size={36} className="animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
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
              <div className="absolute bottom-1 right-1 w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center border-2 border-white cursor-pointer">
                <Camera size={12} />
              </div>
            </div>

            {/* Name + role */}
            <div className="text-center">
              <p className="text-lg font-bold text-text-primary mb-1">{user.name}</p>
              <p className="text-sm text-text-muted m-0 capitalize">
                {user.role === authRoles.admin ? "Admin Member" : "Pro Plan Member"}
              </p>
            </div>

            {/* Change Photo button */}
            <button className="btn btn-outline btn-sm btn-full mt-1">
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
                  <button className="btn btn-outline btn-sm">Change Password</button>
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

          {/* Show both sections when no specific section active — default shows both stacked */}
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

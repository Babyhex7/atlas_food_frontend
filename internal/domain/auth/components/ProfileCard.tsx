import type { ProfileResponse } from "../types/auth";

export function ProfileCard({ profile }: { profile?: ProfileResponse }) {
  if (!profile) return <section>Profile not loaded</section>;

  return (
    <section>
      <h1>{profile.name}</h1>
      <p>{profile.email}</p>
      <p>{profile.role}</p>
    </section>
  );
}

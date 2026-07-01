import { ReactNode } from 'react';

/**
 * Survey layout — intentionally minimal.
 * The join page has its own AppHeader.
 * The recall page renders RecallWizard which has its own full-screen layout with sidebar.
 * The done page has its own AppHeader.
 * We just pass children through so each page controls its own layout.
 */
export default function SurveyLayout({
  children,
}: {
  children: ReactNode;
  params: { accessToken: string };
}) {
  return <>{children}</>;
}

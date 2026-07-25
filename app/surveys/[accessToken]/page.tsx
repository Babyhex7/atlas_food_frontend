import { redirect } from 'next/navigation';

/** Token URL lama → hub survey (login + pilih survey aktif). */
export default function SurveyIndexPage() {
  redirect('/surveys');
}

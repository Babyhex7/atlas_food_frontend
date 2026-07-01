import { redirect } from 'next/navigation';

export default function SurveyIndexPage({ params }: { params: { accessToken: string } }) {
  redirect(`/surveys/${params.accessToken}/join`);
}

import { redirect } from "next/navigation";

/** Anotasi dikelola dari form makanan — bukan menu terpisah */
export default function AdminAnnotationsPage() {
  redirect("/admin/foods");
}

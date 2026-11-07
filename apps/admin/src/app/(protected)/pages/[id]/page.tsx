import { redirect } from "next/navigation";

// Sayfanın parçaları Site Haritası'nda ayrı ayrı listelenir
export default function PageIndex() {
  redirect("/dashboard");
}

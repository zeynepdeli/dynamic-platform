import { redirect } from "next/navigation";

/**
 * Panelin ana adresi doğrudan dashboard'a gider.
 * Oturum yoksa korumalı alan (/dashboard) kullanıcıyı giriş sayfasına yönlendirir.
 */
export default function Home() {
  redirect("/dashboard");
}

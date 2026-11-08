import { redirect } from "next/navigation";
import { getAdminUser } from "@/lib/auth";
import CommandHeader from "@/components/layout/CommandHeader";
import { getUnreadCount } from "@/lib/contact-messages";

export default async function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getAdminUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <CommandHeader unread={await getUnreadCount()} />

      <main className="w-full px-3 py-4 sm:px-4 lg:px-6 lg:py-5">
        {children}
      </main>
    </div>
  );
}

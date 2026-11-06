import { redirect } from "next/navigation";
import { getAdminUser } from "@/lib/auth";
import CommandHeader from "@/components/layout/CommandHeader";

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
      <CommandHeader />

      <main className="w-full px-4 py-6 sm:px-6 lg:px-8 lg:py-8 2xl:px-10">
        {children}
      </main>
    </div>
  );
}

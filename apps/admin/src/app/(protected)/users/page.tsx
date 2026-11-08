import { Users } from "lucide-react";

import { AreaCard, AreaShell } from "@/components/areas/AreaShell";
import { NewAdminForm, UsersList } from "@/components/users/UsersManager";
import { getAdminAccounts } from "@/lib/admin-users";
import { getAdminUser } from "@/lib/auth";

const fmt = new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium", timeZone: "Europe/Istanbul" });

export default async function UsersPage() {
  const [users, me] = await Promise.all([getAdminAccounts(), getAdminUser()]);
  return (
    <AreaShell icon={Users} title="Yöneticiler" description="Yönetim paneline girebilen hesaplar. Pasif yapılan hesabın açık oturumları hemen kapanır.">
      <AreaCard title="Yönetici Hesapları" hint={`${users.filter((u) => u.active).length} aktif · ${users.length} toplam`}>
        <UsersList users={users.map((u) => ({ ...u, createdAt: fmt.format(new Date(u.createdAt)), isMe: u.id === me?.id }))} />
      </AreaCard>
      <AreaCard title="Yeni Yönetici">
        <NewAdminForm />
      </AreaCard>
    </AreaShell>
  );
}

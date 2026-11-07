import { ListTree } from "lucide-react";

import { MenuItemDialog } from "@/components/menu/MenuItemDialog";
import { MenuTree } from "@/components/menu/MenuTree";
import { buildMenuTree, getAdminMenuItems } from "@/lib/menu";

export default async function MenuPage() {
  const tree = buildMenuTree(await getAdminMenuItems());

  return (
    <main className="min-w-0 space-y-7 pb-10">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-[#183350]/10 text-[#183350]">
            <ListTree className="size-6" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Menüler</h1>
            <p className="text-sm text-muted-foreground">
              Sitenin üst menüsünü düzenleyin. En fazla 2 seviye.
            </p>
          </div>
        </div>

        <MenuItemDialog
          mode="create"
          parents={tree.map((node) => ({ id: node.id, label: node.label }))}
        />
      </header>

      <MenuTree tree={tree} />
    </main>
  );
}

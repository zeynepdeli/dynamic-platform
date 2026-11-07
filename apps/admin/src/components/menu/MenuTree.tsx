"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CornerDownRight, ListTree } from "lucide-react";

import { Switch } from "@/components/ui/switch";
import { ConfirmDeleteDialog } from "@/components/common/ConfirmDeleteDialog";
import { OrderButtons, swapIds } from "@/components/common/OrderButtons";
import { MenuItemDialog } from "@/components/menu/MenuItemDialog";

import {
  deleteMenuItemAction,
  reorderMenuItemsAction,
  setMenuItemVisibleAction,
} from "@/app/actions/menu";
import type { MenuNode } from "@/lib/menu";

type MenuTreeProps = { tree: MenuNode[] };

export function MenuTree({ tree }: MenuTreeProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const parents = tree.map((node) => ({ id: node.id, label: node.label }));

  function run(action: () => Promise<{ success: boolean; error?: string }>) {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (!result.success) {
        setError(result.error ?? "İşlem başarısız oldu.");
        return;
      }
      router.refresh();
    });
  }

  function move(parentId: string | null, ids: string[], index: number, dir: -1 | 1) {
    const next = swapIds(ids, index, dir);
    if (next) run(() => reorderMenuItemsAction(parentId, next));
  }

  if (tree.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">
        <ListTree className="size-8" />
        <p>Henüz menü öğesi yok.</p>
      </div>
    );
  }

  const rootIds = tree.map((node) => node.id);

  return (
    <div className="space-y-3">
      {error && (
        <div
          role="alert"
          className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive"
        >
          {error}
        </div>
      )}

      <ol className="space-y-3" aria-busy={isPending}>
        {tree.map((node, index) => {
          const childIds = node.children.map((child) => child.id);

          return (
            <li key={node.id} className="rounded-2xl border border-border bg-card">
              <div
                className={`flex flex-wrap items-center gap-4 p-4 ${node.visible ? "" : "opacity-60"}`}
              >
                <OrderButtons
                  index={index}
                  total={tree.length}
                  disabled={isPending}
                  onMove={(dir) => move(null, rootIds, index, dir)}
                />

                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{node.label}</p>
                  <p className="truncate font-mono text-xs text-muted-foreground">
                    {node.href}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Switch
                      checked={node.visible}
                      disabled={isPending}
                      onCheckedChange={(checked) =>
                        run(() => setMenuItemVisibleAction(node.id, checked))
                      }
                      aria-label={`${node.label} görünür`}
                    />
                    {node.visible ? "Görünür" : "Gizli"}
                  </label>

                  <MenuItemDialog
                    mode="edit"
                    itemId={node.id}
                    initialValues={node.formValues}
                    parents={parents}
                    hasChildren={node.children.length > 0}
                  />

                  {node.children.length === 0 ? (
                    <ConfirmDeleteDialog
                      title="Menü öğesini sil"
                      description={
                        <>
                          <strong>{node.label}</strong> menüden kalıcı olarak
                          silinecek.
                        </>
                      }
                      onConfirm={() => deleteMenuItemAction(node.id)}
                    />
                  ) : (
                    <span
                      className="w-9 text-center text-xs text-muted-foreground"
                      title="Önce alt menüleri silin"
                    >
                      —
                    </span>
                  )}
                </div>
              </div>

              {/* Alt menüler */}
              <div className="space-y-2 border-t border-border bg-surface-muted/30 p-3 pl-6 sm:pl-14">
                {node.children.map((child, childIndex) => (
                  <div
                    key={child.id}
                    className={`flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-3 ${child.visible ? "" : "opacity-60"}`}
                  >
                    <CornerDownRight className="size-4 text-muted-foreground" />
                    <OrderButtons
                      index={childIndex}
                      total={node.children.length}
                      disabled={isPending}
                      size="sm"
                      layout="row"
                      onMove={(dir) => move(node.id, childIds, childIndex, dir)}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{child.label}</p>
                      <p className="truncate font-mono text-xs text-muted-foreground">
                        {child.href}
                      </p>
                    </div>
                    <Switch
                      size="sm"
                      checked={child.visible}
                      disabled={isPending}
                      onCheckedChange={(checked) =>
                        run(() => setMenuItemVisibleAction(child.id, checked))
                      }
                      aria-label={`${child.label} görünür`}
                    />
                    <MenuItemDialog
                      mode="edit"
                      itemId={child.id}
                      initialValues={child.formValues}
                      parents={parents}
                      hasChildren={false}
                    />
                    <ConfirmDeleteDialog
                      title="Alt menüyü sil"
                      description={
                        <>
                          <strong>{child.label}</strong> menüden kalıcı olarak
                          silinecek.
                        </>
                      }
                      onConfirm={() => deleteMenuItemAction(child.id)}
                    />
                  </div>
                ))}

                <MenuItemDialog
                  mode="create"
                  parents={parents}
                  defaultParentId={node.id}
                  triggerLabel="Alt Menü Ekle"
                />
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

/**
 * Ekleme/düzenleme penceresi (e-ticaret panelindeki gibi): liste satır satır kalır,
 * form bu pencerede açılır. İçerik yalnızca açıkken çizilir; her açılışta taze form.
 */
export function EditModal({
  open,
  title,
  description,
  onClose,
  children,
  wide = false,
}: {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className={`max-h-[90vh] overflow-y-auto p-6 sm:p-8 ${wide ? "sm:max-w-3xl" : "sm:max-w-2xl"}`}>
        <DialogHeader>
          <DialogTitle className="text-xl">{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        {open && <div className="pt-2">{children}</div>}
      </DialogContent>
    </Dialog>
  );
}

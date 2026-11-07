"use server";

import { z } from "zod";

import { invalid, sendToApi, type ActionResult } from "@/lib/admin/send";

const isUuid = (v: unknown): v is string => z.uuid().safeParse(v).success;

export async function setMessageReadAction(id: string, read: boolean): Promise<ActionResult> {
  if (!isUuid(id) || typeof read !== "boolean") return invalid();
  return sendToApi(`/admin/contact-messages/${id}`, "PATCH", { read }, "Mesaj güncellenemedi.", "/messages");
}

export async function deleteMessageAction(id: string): Promise<ActionResult> {
  if (!isUuid(id)) return invalid();
  return sendToApi(`/admin/contact-messages/${id}`, "DELETE", undefined, "Mesaj silinemedi.", "/messages");
}

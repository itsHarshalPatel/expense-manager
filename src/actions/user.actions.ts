"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { isDemoUser } from "@/lib/demo";

const ProfileSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  phone: z.string().optional(),
  paymentHandle: z.string().optional(),
});

export async function updateProfile(formData: unknown) {
  try {
    const userId = await requireAuth();
    if (isDemoUser(userId))
      return { success: false, error: "Demo account is read-only." };
    const parsed = ProfileSchema.safeParse(formData);
    if (!parsed.success)
      return { success: false, error: parsed.error.issues[0].message };

    await prisma.user.update({
      where: { id: userId },
      data: parsed.data,
    });

    revalidatePath("/profile");
    return { success: true };
  } catch (error) {
    console.error("[updateProfile]", error);
    return { success: false, error: "Failed to update profile" };
  }
}

"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { createSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export async function registerAction(prevState: any, formData: FormData) {
  try {
    const username = formData.get("username") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!username || !email || !password) {
      return "Semua field harus diisi.";
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return "Email sudah terdaftar. Silakan gunakan email lain.";
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          name: username,
          email: email,
          password: hashedPassword,
        },
      });

      const newDept = await tx.departemen.create({
        data: {
          name: `Bisnis ${username}`,
          creator_id: newUser.id,
          plan: "FREE",
        },
      });

      await tx.profile.create({
        data: {
          idUser: newUser.id,
          idDepartemen: newDept.id,
          role: "OWNER",
        },
      });
    });

    return "success";
  } catch (error) {
    console.error("Register error:", error);
    return "Terjadi kesalahan pada server saat registrasi.";
  }
}

export async function loginAction(prevState: any, formData: FormData) {
  try {
    const identifier = formData.get("identifier") as string;
    const password = formData.get("password") as string;

    if (!identifier || !password) {
      return "Email/Username dan password wajib diisi.";
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: identifier }, { name: identifier }],
      },
    });

    if (!user) {
      return "Kredensial salah. User tidak ditemukan.";
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return "Password yang Anda masukkan salah.";
    }

    await createSession(user.id);
  } catch (error) {
    console.error("Login error:", error);
    return "Terjadi kesalahan pada server saat login.";
  }

  redirect("/dashboard");
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
  redirect("/auth");
}

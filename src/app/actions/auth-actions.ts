// src/app/actions/auth-actions.ts
"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { createSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

// --- AKSI REGISTER ---
export async function registerAction(prevState: any, formData: FormData) {
  try {
    const username = formData.get("username") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    // 1. Validasi input kosong
    if (!username || !email || !password) {
      return "Semua field harus diisi.";
    }

    // 2. Cek apakah email sudah terdaftar
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return "Email sudah terdaftar. Silakan gunakan email lain.";
    }

    // 3. Hash password sebelum disimpan
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. TRANSACTION: Simpan user, departemen, dan profile sekaligus
    // Kita gunakan $transaction agar jika salah satu gagal, semua dibatalkan (aman)
    await prisma.$transaction(async (tx) => {
      // Create User
      const newUser = await tx.user.create({
        data: {
          name: username,
          email: email,
          password: hashedPassword,
        },
      });

      // Create Default Departemen untuk User ini
      const newDept = await tx.departemen.create({
        data: {
          name: `Bisnis ${username}`, // Nama perusahaan default
          creator_id: newUser.id,
          plan: "FREE",
        },
      });

      // Create Profile sebagai OWNER di departemen tersebut
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

// --- AKSI LOGIN ---
export async function loginAction(prevState: any, formData: FormData) {
  try {
    const identifier = formData.get("identifier") as string;
    const password = formData.get("password") as string;

    if (!identifier || !password) {
      return "Email/Username dan password wajib diisi.";
    }

    // Cari user berdasarkan Email ATAU Name (Username)
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: identifier }, { name: identifier }],
      },
    });

    if (!user) {
      return "Kredensial salah. User tidak ditemukan.";
    }

    // Bandingkan password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return "Password yang Anda masukkan salah.";
    }

    // Eksekusi pembuatan session
    await createSession(user.id);
  } catch (error) {
    console.error("Login error:", error);
    return "Terjadi kesalahan pada server saat login.";
  }

  // Redirect ke dashboard jika sukses
  redirect("/dashboard");
}

// --- AKSI LOGOUT ---
export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
  redirect("/auth");
}
"use client";

import { useState, useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import Image from "next/image";
import { loginAction, registerAction } from "@/app/actions/auth-actions";

function SubmitButton({
  text,
  className,
}: {
  text: string;
  className: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={`${className} flex justify-center items-center disabled:opacity-70 disabled:cursor-wait`}
    >
      {pending ? (
        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
      ) : (
        text
      )}
    </button>
  );
}

export default function AuthPage() {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  const [loginError, dispatchLogin] = useActionState(loginAction, undefined);
  const [registerState, dispatchRegister] = useActionState(
    registerAction,
    undefined,
  );

  useEffect(() => {
    if (registerState === "success" && isFlipped) {
      setIsFlipped(false); // Balikkan kartu ke mode Log In
      setShowSuccessPopup(true); // Munculkan pop-up

      // Sembunyikan pop-up otomatis setelah 4 detik
      const timer = setTimeout(() => {
        setShowSuccessPopup(false);
      }, 4000);

      return () => clearTimeout(timer); // Bersihkan timer
    }
  }, [registerState, isFlipped]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#e8f7ec] via-[#f2fdf5] to-[#d1f5de] p-4 relative overflow-hidden">
      {/* --- UI POP-UP SUKSES --- */}
      {showSuccessPopup && (
        <div className="fixed top-10 left-1/2 transform -translate-x-1/2 z-[200] bg-white border-l-4 border-[#2eb85c] px-6 py-4 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] flex items-center gap-4 transition-all duration-500 animate-[float_0.5s_ease-out]">
          <div className="bg-[#e8f7ec] p-2 rounded-full">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-[#2eb85c]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <div>
            <h4 className="text-[#0f2c4a] font-bold text-lg">Berhasil!</h4>
            <p className="text-gray-600 text-sm">
              Akun berhasil dibuat. Silakan masuk.
            </p>
          </div>
          <button
            onClick={() => setShowSuccessPopup(false)}
            className="ml-6 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      )}
      {/* --- AKHIR UI POP-UP --- */}

      <div className="absolute top-20 left-10 w-3 h-3 bg-green-300 rounded-full animate-pulse blur-[1px]"></div>
      <div className="absolute top-32 left-1/4 w-4 h-4 bg-green-200 rounded-full animate-pulse blur-[2px]"></div>
      <div className="absolute top-40 right-1/4 w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>

      <div className="fixed -bottom-20 -left-40 md:-bottom-80 md:-left-80 w-[800px] md:w-[1200px] lg:w-[1900px] max-w-none opacity-40 z-0 pointer-events-none">
        <Image
          src="/images/hero-image.png"
          alt="Ilustrasi Keuangan"
          width={1900}
          height={1200}
          className="object-contain"
        />
      </div>

      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 relative z-10">
        <div className="flex flex-col justify-center -mt-20 px-4 lg:px-10 z-20">
          <div className="mb-10">
            <h3 className="text-[#1a365d] text-xl font-semibold mb-2 drop-shadow-sm">
              Keuangan Pintar
            </h3>
            <h1 className="text-4xl lg:text-5xl xl:text-[3.5rem] font-extrabold text-[#0f2c4a] leading-tight tracking-tight drop-shadow-sm">
              Mengatur keuangan{" "}
              <span className="text-[#2eb85c]">Menggunakan AI</span>
            </h1>
          </div>
        </div>

        <div className="flex items-center justify-center sm:justify-end px-4 z-20">
          <div className="perspective w-full max-w-md">
            <div
              className={`relative w-full preserve-3d transition-transform duration-700 ease-in-out grid ${isFlipped ? "rotate-y-180" : ""}`}
            >
              {/* --- BAGIAN KARTU DEPAN (LOG IN) --- */}
              <div className="col-start-1 row-start-1 backface-hidden w-full bg-white/70 backdrop-blur-xl border border-white/80 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] rounded-[2.5rem] p-10">
                <div className="flex flex-col items-center justify-center mb-10">
                  {/* Bungkus dengan Link */}
                  <Link href="/">
                    <Image
                      src="/images/logo.png"
                      alt="Logo Ke-Pin"
                      width={200}
                      height={60}
                      className="h-14 w-auto object-contain mb-3 hover:scale-105 transition-transform cursor-pointer"
                    />
                  </Link>
                  <span className="text-[0.65rem] tracking-widest text-gray-500 font-semibold uppercase">
                    Keuangan Pintar
                  </span>
                </div>

                <h2 className="text-4xl font-bold text-[#0f2c4a] text-center mb-8">
                  Log in
                  <br />
                  Account
                </h2>

                {loginError && (
                  <div className="mb-4 p-3 bg-red-100/80 backdrop-blur-sm border border-red-200 text-red-600 text-sm rounded-xl text-center font-bold shadow-sm">
                    {loginError}
                  </div>
                )}

                <form className="space-y-5" action={dispatchLogin}>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-gray-400 group-focus-within:text-[#2eb85c] transition-colors"
                      >
                        <rect width="20" height="16" x="2" y="4" rx="2" />
                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                      </svg>
                    </div>
                    <input
                      name="identifier" // <-- Diubah agar bisa menerima Username atau Email
                      type="text"
                      placeholder="Email atau Username"
                      className="text-[#000000] block w-full pl-12 pr-4 py-4 bg-white border border-[#bbf7d0] rounded-full text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4ade80]/50 focus:border-[#4ade80] transition-all shadow-sm"
                      required
                    />
                  </div>

                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-gray-400 group-focus-within:text-[#2eb85c] transition-colors"
                      >
                        <path d="m15.5 7.5 2.3 2.3a1 1 0 0 0 1.4 0l2.1-2.1a1 1 0 0 0 0-1.4L19 4" />
                        <path d="m21 2-9.6 9.6" />
                        <circle cx="7.5" cy="15.5" r="5.5" />
                      </svg>
                    </div>
                    <input
                      name="password"
                      type={showLoginPassword ? "text" : "password"}
                      placeholder="Password"
                      className="text-[#000000] block w-full pl-12 pr-12 py-4 bg-white border border-[#bbf7d0] rounded-full text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4ade80]/50 focus:border-[#4ade80] transition-all shadow-sm"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                    >
                      {showLoginPassword ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                          <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                          <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                          <line x1="2" x2="22" y1="2" y2="22" />
                        </svg>
                      )}
                    </button>
                  </div>

                  <SubmitButton
                    text="Log in"
                    className="w-full mt-6 bg-[#4ba84f] hover:bg-[#3d8c40] text-white font-bold py-4 px-4 rounded-full text-lg transition-all duration-300 shadow-[0_8px_20px_rgba(75,168,79,0.3)] hover:shadow-[0_4px_10px_rgba(75,168,79,0.4)] hover:-translate-y-0.5"
                  />
                </form>

                <div className="mt-8 text-center text-sm text-[#1a365d]">
                  Belum punya akun?{" "}
                  <button
                    onClick={() => setIsFlipped(true)}
                    className="font-bold text-[#2eb85c] hover:underline bg-transparent border-none cursor-pointer"
                  >
                    sign up
                  </button>
                </div>
              </div>

              {/* --- BAGIAN KARTU BELAKANG (SIGN UP) --- */}
              <div className="col-start-1 row-start-1 backface-hidden rotate-y-180 w-full bg-white/70 backdrop-blur-xl border border-white/80 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] rounded-[2.5rem] p-10">
                <div className="flex flex-col items-center justify-center mb-6">
                  {/* Bungkus dengan Link */}
                  <Link href="/">
                    <Image
                      src="/images/logo.png"
                      alt="Logo Ke-Pin"
                      width={150}
                      height={50}
                      className="h-10 w-auto object-contain mb-2 hover:scale-105 transition-transform cursor-pointer"
                    />
                  </Link>
                </div>

                <h2 className="text-3xl font-bold text-[#0f2c4a] text-center mb-6">
                  Create
                  <br />
                  Account
                </h2>

                {registerState && registerState !== "success" && (
                  <div className="mb-4 p-3 bg-red-100/80 backdrop-blur-sm border border-red-200 text-red-600 text-sm rounded-xl text-center font-bold shadow-sm">
                    {registerState}
                  </div>
                )}

                <form className="space-y-4" action={dispatchRegister}>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-gray-400 group-focus-within:text-[#2eb85c] transition-colors"
                      >
                        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    </div>
                    <input
                      name="username"
                      type="text"
                      placeholder="Username"
                      className="text-[#000000] block w-full pl-12 pr-4 py-3 bg-white border border-[#bbf7d0] rounded-full text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4ade80]/50 focus:border-[#4ade80] transition-all shadow-sm"
                      required
                    />
                  </div>

                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-gray-400 group-focus-within:text-[#2eb85c] transition-colors"
                      >
                        <rect width="20" height="16" x="2" y="4" rx="2" />
                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                      </svg>
                    </div>
                    <input
                      name="email"
                      type="email"
                      placeholder="Email address"
                      className="text-[#000000] block w-full pl-12 pr-4 py-3 bg-white border border-[#bbf7d0] rounded-full text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4ade80]/50 focus:border-[#4ade80] transition-all shadow-sm"
                      required
                    />
                  </div>

                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-gray-400 group-focus-within:text-[#2eb85c] transition-colors"
                      >
                        <path d="m15.5 7.5 2.3 2.3a1 1 0 0 0 1.4 0l2.1-2.1a1 1 0 0 0 0-1.4L19 4" />
                        <path d="m21 2-9.6 9.6" />
                        <circle cx="7.5" cy="15.5" r="5.5" />
                      </svg>
                    </div>
                    <input
                      name="password"
                      type={showRegisterPassword ? "text" : "password"}
                      placeholder="Password"
                      className="text-[#000000] block w-full pl-12 pr-12 py-3 bg-white border border-[#bbf7d0] rounded-full text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4ade80]/50 focus:border-[#4ade80] transition-all shadow-sm"
                      required
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowRegisterPassword(!showRegisterPassword)
                      }
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                    >
                      {showRegisterPassword ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                          <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                          <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                          <line x1="2" x2="22" y1="2" y2="22" />
                        </svg>
                      )}
                    </button>
                  </div>

                  <SubmitButton
                    text="Sign up"
                    className="w-full mt-4 bg-[#4ba84f] hover:bg-[#3d8c40] text-white font-bold py-4 px-4 rounded-full text-lg transition-all duration-300 shadow-[0_8px_20px_rgba(75,168,79,0.3)] hover:shadow-[0_4px_10px_rgba(75,168,79,0.4)] hover:-translate-y-0.5"
                  />
                </form>

                <div className="mt-6 text-center text-sm text-[#1a365d]">
                  Sudah punya akun?{" "}
                  <button
                    onClick={() => setIsFlipped(false)}
                    className="font-bold text-[#2eb85c] hover:underline bg-transparent border-none cursor-pointer"
                  >
                    Log in
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Lock, EyeOff, Eye, RefreshCw, CheckCircle2, XCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

import { authClient } from "@/lib/auth-client";
import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!token) {
    return (
      <div className="flex min-h-[calc(100vh-70px)] items-center justify-center p-4 bg-[#f4f7f6]">
        <div className="w-full max-w-md bg-white rounded-2xl sm:rounded-[28px] shadow-[0px_8px_32px_rgba(44,134,154,0.08)] p-6 sm:p-10 text-center">
          <div className="w-20 h-20 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-8 ring-1 ring-red-200/60">
            <XCircle className="w-10 h-10 text-red-500" />
          </div>
          <h1 className="text-[24px] font-bold text-[#0f374c] mb-3">Link Tidak Valid</h1>
          <p className="text-gray-500 text-[15px] mb-8 leading-relaxed">
            Link reset password tidak valid atau sudah kedaluwarsa.
          </p>
          <Link
            href="/login"
            className="inline-block w-full py-3.5 rounded-xl bg-[#2c869a] hover:bg-[#1f5f6e] text-white font-semibold transition-all shadow-md text-[15px]"
          >
            Kembali ke Login
          </Link>
        </div>
      </div>
    );
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("Konfirmasi password tidak cocok");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("Password minimal 8 karakter");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await authClient.resetPassword({
        newPassword,
        token,
      });

      if (error) {
        toast.error(error.message || "Gagal mengatur ulang kata sandi");
      } else {
        setIsSuccess(true);
        toast.success("Kata sandi berhasil diatur ulang.");
      }
    } catch {
      toast.error("Terjadi kesalahan sistem.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex min-h-[calc(100vh-70px)] items-center justify-center p-4 bg-[#f4f7f6]">
        <div className="w-full max-w-md bg-white rounded-2xl sm:rounded-[28px] shadow-[0px_8px_32px_rgba(44,134,154,0.08)] p-6 sm:p-10 text-center animate-in fade-in zoom-in duration-300">
          <div className="w-20 h-20 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-8 ring-1 ring-emerald-200/60">
            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
          </div>
          <h1 className="text-[24px] font-bold text-[#0f374c] mb-3">Reset Berhasil!</h1>
          <p className="text-gray-500 text-[15px] mb-8 leading-relaxed">
            Kata sandi Anda telah berhasil diatur ulang. Sekarang Anda dapat masuk dengan kata sandi
            baru Anda.
          </p>
          <Link
            href="/login"
            className="inline-block w-full py-3.5 rounded-xl bg-[#2c869a] hover:bg-[#1f5f6e] text-white font-semibold transition-all shadow-md text-[15px]"
          >
            Masuk Sekarang
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-70px)] items-center justify-center p-4 bg-[#f4f7f6]">
      <div className="w-full max-w-md bg-white rounded-2xl sm:rounded-[28px] shadow-[0px_8px_32px_rgba(44,134,154,0.08)] p-6 sm:p-10 animate-in fade-in zoom-in duration-300">
        <div className="mb-8 text-center">
          <h1 className="text-xl sm:text-[28px] font-bold text-[#0f374c] mb-2 leading-tight">
            Atur Ulang Sandi
          </h1>
          <p className="text-gray-500 font-medium text-[15px]">Masukkan kata sandi baru Anda</p>
        </div>

        <form onSubmit={handleResetPassword} className="space-y-6">
          <div className="space-y-1.5">
            <Label htmlFor="password">Kata Sandi Baru</Label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <Lock className="w-5 h-5" />
              </div>
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                className="w-full bg-white rounded-xl border border-gray-200 focus-visible:ring-[#2c869a] py-6 pl-12 pr-12 text-[15px]"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
              >
                {showPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword">Konfirmasi Kata Sandi</Label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <Lock className="w-5 h-5" />
              </div>
              <Input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                className="w-full bg-white rounded-xl border border-gray-200 focus-visible:ring-[#2c869a] py-6 pl-12 text-[15px]"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-[52px] rounded-xl bg-[#2c869a] hover:bg-[#1f5f6e] text-white font-semibold text-[16px] transition-all shadow-md"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Memproses...
              </>
            ) : (
              "Simpan Kata Sandi"
            )}
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-[14px] font-medium text-gray-500 hover:text-[#2c869a] transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <>
      <Header />
      <Suspense
        fallback={
          <div className="flex min-h-[calc(100vh-70px)] items-center justify-center p-4 bg-[#f4f7f6]">
            <RefreshCw className="w-10 h-10 text-[#2c869a] animate-spin" />
          </div>
        }
      >
        <ResetPasswordContent />
      </Suspense>
    </>
  );
}

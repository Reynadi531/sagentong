"use client";

import React, { useState } from "react";
import { User, Mail, Lock, Loader2, Save, AlertCircle } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface SettingsClientProps {
  user: any;
}

export default function SettingsClient({ user }: SettingsClientProps) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);

    try {
      const { error } = await authClient.updateUser({
        name,
      });

      if (error) {
        toast.error(error.message || "Gagal memperbarui profil.");
      } else {
        toast.success("Profil berhasil diperbarui.");
      }
    } catch (err) {
      toast.error("Terjadi kesalahan sistem.");
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingEmail(true);

    try {
      const { error } = await authClient.changeEmail({
        newEmail: email,
      });

      if (error) {
        toast.error(error.message || "Gagal memperbarui email.");
      } else {
        toast.success("Permintaan perubahan email berhasil dikirim. Cek email baru Anda.");
      }
    } catch (err) {
      toast.error("Terjadi kesalahan sistem.");
    } finally {
      setIsUpdatingEmail(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("Konfirmasi kata sandi tidak cocok.");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("Kata sandi baru minimal 8 karakter.");
      return;
    }

    setIsChangingPassword(true);

    try {
      const { error } = await authClient.changePassword({
        currentPassword,
        newPassword,
        revokeOtherSessions: true,
      });

      if (error) {
        toast.error(error.message || "Gagal mengubah kata sandi.");
      } else {
        toast.success("Kata sandi berhasil diubah.");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (err) {
      toast.error("Terjadi kesalahan sistem.");
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-[800px] mx-auto w-full px-4 py-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-[30px] font-semibold text-[#2C869A] capitalize">Pengaturan Akun</h1>
        <p className="text-[14px] text-gray-500">Kelola informasi profil dan keamanan akun Anda.</p>
      </div>

      {/* Profile Information */}
      <Card className="border-none shadow-sm ring-1 ring-gray-100 rounded-2xl overflow-hidden">
        <CardHeader className="bg-gray-50/50 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#2C869A]/10 rounded-lg text-[#2C869A]">
              <User className="size-5" />
            </div>
            <div>
              <CardTitle className="text-lg">Informasi Profil</CardTitle>
              <CardDescription>Perbarui nama tampilan Anda.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleUpdateProfile} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Lengkap</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Masukkan nama lengkap"
                className="rounded-xl border-gray-200 focus:ring-[#2C869A]/20 focus:border-[#2C869A]"
              />
            </div>
            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                disabled={isUpdatingProfile || name === user.name}
                className="bg-[#2C869A] hover:bg-[#236e7f] rounded-xl px-6"
              >
                {isUpdatingProfile ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Simpan Nama
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Email Information */}
      <Card className="border-none shadow-sm ring-1 ring-gray-100 rounded-2xl overflow-hidden">
        <CardHeader className="bg-gray-50/50 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#2C869A]/10 rounded-lg text-[#2C869A]">
              <Mail className="size-5" />
            </div>
            <div>
              <CardTitle className="text-lg">Alamat Email</CardTitle>
              <CardDescription>Perbarui alamat email akun Anda.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleUpdateEmail} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@contoh.com"
                className="rounded-xl border-gray-200 focus:ring-[#2C869A]/20 focus:border-[#2C869A]"
              />
              <p className="text-[11px] text-amber-600 flex items-center gap-1.5 font-medium">
                <AlertCircle className="size-3" />
                Anda harus memverifikasi email baru setelah melakukan perubahan.
              </p>
            </div>
            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                disabled={isUpdatingEmail || email === user.email}
                className="bg-[#2C869A] hover:bg-[#236e7f] rounded-xl px-6"
              >
                {isUpdatingEmail ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Simpan Email
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card className="border-none shadow-sm ring-1 ring-gray-100 rounded-2xl overflow-hidden">
        <CardHeader className="bg-gray-50/50 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
              <Lock className="size-5" />
            </div>
            <div>
              <CardTitle className="text-lg">Keamanan Akun</CardTitle>
              <CardDescription>Ubah kata sandi untuk meningkatkan keamanan.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleChangePassword} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Kata Sandi Saat Ini</Label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="rounded-xl border-gray-200 focus:ring-[#2C869A]/20 focus:border-[#2C869A]"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">Kata Sandi Baru</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimal 8 karakter"
                  className="rounded-xl border-gray-200 focus:ring-[#2C869A]/20 focus:border-[#2C869A]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Konfirmasi Kata Sandi Baru</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi kata sandi baru"
                  className="rounded-xl border-gray-200 focus:ring-[#2C869A]/20 focus:border-[#2C869A]"
                />
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                disabled={
                  isChangingPassword || !currentPassword || !newPassword || !confirmPassword
                }
                className="bg-[#2C869A] hover:bg-[#236e7f] rounded-xl px-6"
              >
                {isChangingPassword ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Mengubah...
                  </>
                ) : (
                  <>
                    <Lock className="mr-2 h-4 w-4" />
                    Ubah Kata Sandi
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

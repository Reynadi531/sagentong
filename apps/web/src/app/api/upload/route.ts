import { auth } from "@sagentong/auth";
import { ensureBucket, uploadFile } from "@sagentong/storage";
import { headers } from "next/headers";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/jpg"]);
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(request: Request) {
  // Authenticate
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (
    session.user.role !== "perangkat_desa" &&
    session.user.role !== "superadmin" &&
    session.user.role !== "relawan"
  ) {
    return Response.json(
      { error: "Forbidden: Anda tidak memiliki izin untuk mengunggah file." },
      { status: 403 },
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return Response.json({ error: "File tidak ditemukan dalam request." }, { status: 400 });
    }

    // Validate file type
    if (!ALLOWED_TYPES.has(file.type)) {
      return Response.json(
        { error: "Format file tidak didukung. Gunakan JPG, PNG, atau JPEG." },
        { status: 400 },
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return Response.json({ error: "Ukuran file terlalu besar. Maksimal 5MB." }, { status: 400 });
    }

    // Ensure bucket exists
    await ensureBucket();

    // Upload file
    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await uploadFile(buffer, {
      filename: file.name,
      contentType: file.type,
      folder: "evidence",
    });

    return Response.json({
      key: result.key,
      filename: result.filename,
      contentType: result.contentType,
      size: result.size,
    });
  } catch (error) {
    console.error("[upload] Error:", error);
    return Response.json({ error: "Terjadi kesalahan saat mengunggah file." }, { status: 500 });
  }
}

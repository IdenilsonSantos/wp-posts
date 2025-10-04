import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  const { token } = await req.json();

  if (!token) {
    return NextResponse.json(
      { success: false, message: "Token ausente" },
      { status: 400 }
    );
  }

  (await cookies()).set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "development",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24,
  });

  return NextResponse.json({ success: true });
}

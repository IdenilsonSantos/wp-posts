import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  const cookieStore = cookies();

  (await cookieStore).set({
    name: "token",
    value: "",
    path: "/",
    expires: new Date(0),
  });

  return NextResponse.json({ success: true });
}

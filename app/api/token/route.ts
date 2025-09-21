import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "supersecret"; // keep it in env

export async function POST(req: Request) {
  const { userId, username } = await req.json();

  const token = jwt.sign({ id: userId, name: username }, SECRET, {
    expiresIn: "30d", // token expiry
  });

  return NextResponse.json({ token });
}

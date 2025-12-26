import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

export async function authenticateUser(req: NextRequest) {
    try {
        if (!process.env.JWT_SECRET) return NextResponse.json({ error: "Server settings error" }, { status: 500 });

        const token = req.cookies.get("phoenix-agentics-dashboard-auth")?.value;
        if (!token) return new NextResponse(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

        const decoded: string | jwt.JwtPayload = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded || typeof decoded === "string") {
            return new NextResponse(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
        }

        return "authenticated";
    } catch (error) {
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

export async function createSessionToken() {
    if (!process.env.JWT_SECRET) throw new Error("JWT Secret is missing");

    return jwt.sign(
        { jti: crypto.randomUUID(), authenticated: true },
        process.env.JWT_SECRET,
        { expiresIn: "31d" }
    );
}
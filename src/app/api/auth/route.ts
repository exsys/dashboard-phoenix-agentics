import { authenticateUser, createSessionToken } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import * as cookie from "cookie";

export async function GET(req: NextRequest) {
    try {
        const auth = await authenticateUser(req);
        if (auth instanceof NextResponse) return auth;

        return NextResponse.json({ ok: true }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "Invalid token" }, { status: 403 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const { password } = await req.json();
        if (!password) return NextResponse.json({ error: "Missing password" }, { status: 400 });
        if (!process.env.AUTH_PASSWORD) return NextResponse.json({ error: "Server settings error" }, { status: 500 });

        if (password != process.env.AUTH_PASSWORD) {
            return NextResponse.json({ error: "Wrong password" }, { status: 400 });
        }

        const headers = new Headers();
        const cookieValidityInDays = 31;
        const sessionToken = await createSessionToken();
        headers.append(
            "Set-Cookie",
            cookie.serialize("phoenix-agentics-dashboard-auth", sessionToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                maxAge: 60 * 60 * 24 * cookieValidityInDays,
                sameSite: "strict",
                path: "/",
            })
        );

        return new NextResponse(JSON.stringify({ ok: true }), { status: 200, headers });
    } catch (error) {
        console.log(error)
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
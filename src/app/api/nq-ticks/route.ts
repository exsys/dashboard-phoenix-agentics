import { authenticateUser } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        if (process.env.NODE_ENV === "production") {
            const auth = await authenticateUser(req);
            if (auth instanceof NextResponse) return auth;
        }

        const { searchParams } = new URL(req.url);
        const type = searchParams.get("type");
        const time_frame = searchParams.get("time_frame");

        const res = await fetch(`https://dashboard.epicaitrader.com/api/nq-ticks?type=${type}&time_frame=${time_frame}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.BEARER_TOKEN}`,
            },
        });

        if (res.status === 401) new NextResponse(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
        if (!res.ok) return NextResponse.json({ error: "Network error" }, { status: 500 });

        const data = await res.json();
        if (!data.ticks) return NextResponse.json({ error: "Network error" }, { status: 500 });

        return NextResponse.json({ ok: true, data }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
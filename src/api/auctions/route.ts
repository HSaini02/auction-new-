import { NextRequest, NextResponse } from "next/server";
import { getAdmin } from "@/lib/firebase.admin";
import { Timestamp } from "firebase-admin/firestore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// list
export async function GET() {
  try {
    const { adminDb } = getAdmin();
    const snap = await adminDb.collection("auctions").orderBy("createdAt","desc").limit(50).get();
    const items = snap.docs.map(d => ({ id:d.id, ...(d.data() as any) }));
    return NextResponse.json({ items });
  } catch (e:any) {
    return NextResponse.json({ error: e.message || "Server error" }, { status: 500 });
  }
}

// create
export async function POST(req: NextRequest) {
  try {
    const { adminDb, adminAuth } = getAdmin();

    const h = req.headers.get("authorization") || "";
    const token = h.startsWith("Bearer ") ? h.slice(7) : null;
    if (!token) return NextResponse.json({ error:"Missing Bearer token" }, { status:401 });
    const decoded = await adminAuth.verifyIdToken(token).catch(() => null);
    if (!decoded) return NextResponse.json({ error:"Invalid/expired token" }, { status:401 });

    const body = await req.json().catch(()=> ({}));
    const title = body.title ?? body.name;
    const startingPrice = Number(body.startingPrice ?? body.startingBid);
    const description = body.description ?? "";
    const endTime = body.endTime;
    if (!title || !startingPrice || !endTime) {
      return NextResponse.json({ error:"Required: title/name, startingPrice/startingBid, endTime" }, { status:400 });
    }

    const doc = await adminDb.collection("auctions").add({
      title, description, startingPrice,
      endTime: new Date(endTime).toISOString(),
      sellerId: decoded.uid,
      createdAt: Timestamp.now(),
      status: "open",
    });

    return NextResponse.json({ id: doc.id }, { status: 201 });
  } catch (e:any) {
    console.error("[/api/auctions] error:", e);
    return NextResponse.json({ error: e.message || "Server error" }, { status: 500 });
  }
}

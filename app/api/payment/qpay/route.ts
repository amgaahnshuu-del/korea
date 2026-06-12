import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth";

const QPAY_URL = "https://merchant.qpay.mn/v2";
const QPAY_USERNAME = process.env.QPAY_USERNAME || "";
const QPAY_PASSWORD = process.env.QPAY_PASSWORD || "";
const QPAY_INVOICE_CODE = process.env.QPAY_INVOICE_CODE || "";
const CALLBACK_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

async function getToken(): Promise<string> {
  const res = await fetch(`${QPAY_URL}/auth/token`, {
    method: "POST",
    headers: {
      Authorization: "Basic " + Buffer.from(`${QPAY_USERNAME}:${QPAY_PASSWORD}`).toString("base64"),
    },
  });
  const data = await res.json();
  return data.access_token;
}

export async function POST(req: NextRequest) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { jobId } = await req.json();
  if (!jobId) return NextResponse.json({ error: "jobId required" }, { status: 400 });

  try {
    const token = await getToken();

    const invoiceNo = `BOOST-${jobId}-${Date.now()}`;
    const res = await fetch(`${QPAY_URL}/invoice`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        invoice_code: QPAY_INVOICE_CODE,
        sender_invoice_no: invoiceNo,
        invoice_receiver_code: "terminal",
        invoice_description: "Ajil Korea - Boost Job (10,000₮)",
        amount: 10000,
        callback_url: `${CALLBACK_URL}/api/payment/qpay/callback?jobId=${jobId}&userId=${user.id}`,
      }),
    });

    const data = await res.json();
    return NextResponse.json({
      invoice_id: data.invoice_id,
      qr_text: data.qr_text,
      qr_image: data.qr_image,
      urls: data.urls,
    });
  } catch {
    return NextResponse.json({ error: "QPay холбогдож чадсангүй" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const invoiceId = req.nextUrl.searchParams.get("invoice_id");
  if (!invoiceId) return NextResponse.json({ error: "invoice_id required" }, { status: 400 });

  try {
    const token = await getToken();
    const res = await fetch(`${QPAY_URL}/payment/check/${invoiceId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    const paid = data.count > 0;
    return NextResponse.json({ paid });
  } catch {
    return NextResponse.json({ paid: false });
  }
}

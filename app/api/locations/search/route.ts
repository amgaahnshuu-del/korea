import { NextRequest, NextResponse } from "next/server";

type NominatimResult = {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  address?: Record<string, string | undefined>;
};

function getAcceptLanguage(locale: string | null) {
  if (locale === "ko") return "ko,en";
  if (locale === "en") return "en,ko";
  return "mn,en,ko";
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = (searchParams.get("q") ?? "").trim();
  const locale = searchParams.get("locale");
  const limit = Math.min(10, Math.max(1, Number(searchParams.get("limit") ?? "5") || 5));

  if (query.length < 2) {
    return NextResponse.json({ results: [] });
  }

  if (query.length > 120) {
    return NextResponse.json({ error: "Query is too long." }, { status: 400 });
  }

  const acceptLanguage = getAcceptLanguage(locale);
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", query);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("dedupe", "1");
  url.searchParams.set("countrycodes", "kr");
  url.searchParams.set("limit", String(limit));
  url.searchParams.set("accept-language", acceptLanguage);

  try {
    const response = await fetch(url.toString(), {
      headers: {
        "User-Agent": "Ajil Korea location search",
        "Accept-Language": acceptLanguage,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json({ error: "Failed to search locations." }, { status: 502 });
    }

    const data = (await response.json()) as NominatimResult[];
    const results = Array.isArray(data)
      ? data.map((item) => ({
          placeId: item.place_id,
          displayName: item.display_name,
          lat: item.lat,
          lon: item.lon,
          address: item.address ?? {},
        }))
      : [];

    const res = NextResponse.json({ results });
    res.headers.set("Cache-Control", "no-store");
    return res;
  } catch {
    return NextResponse.json({ error: "Failed to search locations." }, { status: 502 });
  }
}

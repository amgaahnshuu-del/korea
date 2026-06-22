import { NextRequest, NextResponse } from "next/server";

type NominatimReverseResult = {
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
  const lat = Number(searchParams.get("lat"));
  const lon = Number(searchParams.get("lon"));
  const locale = searchParams.get("locale");

  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return NextResponse.json({ error: "Invalid coordinates." }, { status: 400 });
  }

  if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    return NextResponse.json({ error: "Invalid coordinates." }, { status: 400 });
  }

  const acceptLanguage = getAcceptLanguage(locale);
  const url = new URL("https://nominatim.openstreetmap.org/reverse");
  url.searchParams.set("lat", String(lat));
  url.searchParams.set("lon", String(lon));
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("zoom", "18");
  url.searchParams.set("accept-language", acceptLanguage);

  try {
    const response = await fetch(url.toString(), {
      headers: {
        "User-Agent": "Ajil Korea location reverse search",
        "Accept-Language": acceptLanguage,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json({ error: "Failed to resolve location." }, { status: 502 });
    }

    const data = (await response.json()) as NominatimReverseResult | { error?: string };
    if (!data || typeof data !== "object" || !("display_name" in data) || !data.display_name) {
      return NextResponse.json({ error: "Location not found." }, { status: 404 });
    }

    const result: NominatimReverseResult = {
      place_id: data.place_id,
      display_name: data.display_name,
      lat: data.lat,
      lon: data.lon,
      address: data.address ?? {},
    };

    const res = NextResponse.json({ result });
    res.headers.set("Cache-Control", "no-store");
    return res;
  } catch {
    return NextResponse.json({ error: "Failed to resolve location." }, { status: 502 });
  }
}

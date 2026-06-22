"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, MapPin, Navigation2, X } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";
import { pick } from "@/lib/i18n";

type Point = {
  lat: number;
  lon: number;
};

type RouteData = {
  origin: Point;
  destination: Point;
  route: [number, number][];
  distanceMeters: number;
  durationSeconds: number;
  destinationLabel: string;
};

type JobRouteModalProps = {
  open: boolean;
  onClose: () => void;
  destinationLabel: string;
  jobTitle: string;
};

function formatDistance(locale: string, meters: number) {
  const km = meters / 1000;
  if (locale === "mn") return km >= 1 ? `${km.toFixed(1)} км` : `${Math.max(0, Math.round(meters))} м`;
  if (locale === "ko") return km >= 1 ? `${km.toFixed(1)} km` : `${Math.max(0, Math.round(meters))} m`;
  return km >= 1 ? `${km.toFixed(1)} km` : `${Math.max(0, Math.round(meters))} m`;
}

function formatDuration(locale: string, seconds: number) {
  const minutes = Math.max(1, Math.round(seconds / 60));
  if (locale === "mn") return `${minutes} минут`;
  if (locale === "ko") return `${minutes}분`;
  return `${minutes} min`;
}

function getCurrentPosition(): Promise<Point> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      reject(new Error("Geolocation is not available."));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
      },
      (error) => reject(error),
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 0,
      },
    );
  });
}

async function geocodeDestination(destinationLabel: string, locale: string): Promise<Point> {
  const res = await fetch(`/api/locations/search?q=${encodeURIComponent(destinationLabel)}&locale=${locale}&limit=5`);
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.error || "destination_lookup_failed");
  }

  const first = data.results?.[0];
  if (!first) {
    throw new Error("destination_not_found");
  }

  const lat = Number(first.lat);
  const lon = Number(first.lon);

  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    throw new Error("destination_not_found");
  }

  return { lat, lon };
}

async function loadRoute(origin: Point, destination: Point) {
  const routeUrl = new URL(`https://router.project-osrm.org/route/v1/driving/${origin.lon},${origin.lat};${destination.lon},${destination.lat}`);
  routeUrl.searchParams.set("overview", "full");
  routeUrl.searchParams.set("geometries", "geojson");
  routeUrl.searchParams.set("steps", "false");

  const res = await fetch(routeUrl.toString(), { cache: "no-store" });
  const data = await res.json();

  if (!res.ok || !data?.routes?.[0]) {
    throw new Error("route_failed");
  }

  const route = data.routes[0];
  const path = (route.geometry?.coordinates || []).map(([lon, lat]: [number, number]) => [lat, lon] as [number, number]);

  if (path.length < 2) {
    throw new Error("route_failed");
  }

  return {
    path,
    distanceMeters: Number(route.distance || 0),
    durationSeconds: Number(route.duration || 0),
  };
}

function RouteMapView({ data }: { data: RouteData }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<import("leaflet").Map | null>(null);
  const layersRef = useRef<{
    start?: import("leaflet").Layer;
    end?: import("leaflet").Layer;
    route?: import("leaflet").Layer;
  }>({});

  const start = data.origin;
  const end = data.destination;
  const path = data.route;
  const startLat = start.lat;
  const startLon = start.lon;
  const endLat = end.lat;
  const endLon = end.lon;

  useEffect(() => {
    let cancelled = false;
    let frameId = 0;

    const init = async () => {
      if (!containerRef.current) return;

      const leafletImport = await import("leaflet");
      const L = leafletImport.default ?? leafletImport;
      if (cancelled || !containerRef.current) return;

      const buildPin = (color: string) =>
        L.divIcon({
          className: "",
          html: `
            <div style="position:relative;width:26px;height:38px;transform:translateY(-5px);">
              <div style="position:absolute;left:0;right:0;top:0;width:26px;height:26px;border-radius:9999px;background:${color};border:3px solid #ffffff;box-shadow:0 10px 22px rgba(15,23,42,0.25);"></div>
              <div style="position:absolute;left:50%;top:8px;width:7px;height:7px;transform:translateX(-50%);border-radius:9999px;background:#ffffff;"></div>
              <div style="position:absolute;left:50%;bottom:0;width:0;height:0;transform:translateX(-50%);border-left:7px solid transparent;border-right:7px solid transparent;border-top:11px solid ${color};"></div>
            </div>
          `,
          iconSize: [26, 38],
          iconAnchor: [13, 34],
        });

      if (!mapRef.current) {
        const map = L.map(containerRef.current, {
          zoomControl: false,
          minZoom: 4,
          maxZoom: 19,
          worldCopyJump: true,
        });

        L.control.zoom({ position: "bottomright" }).addTo(map);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(map);

        mapRef.current = map;
      }

      const map = mapRef.current;
      if (!map) return;

      Object.values(layersRef.current).forEach((layer) => {
        if (layer) layer.remove();
      });
      layersRef.current = {};

      const startMarker = L.marker([startLat, startLon], { icon: buildPin("#2563eb") }).addTo(map);
      const endMarker = L.marker([endLat, endLon], { icon: buildPin("#22c55e") }).addTo(map);
      const routeLine = L.polyline(path, {
        color: "#22c55e",
        weight: 5,
        opacity: 0.95,
        lineJoin: "round",
        lineCap: "round",
      }).addTo(map);

      layersRef.current = {
        start: startMarker,
        end: endMarker,
        route: routeLine,
      };

      frameId = requestAnimationFrame(() => {
        if (cancelled || !mapRef.current) return;

        map.invalidateSize();
        const bounds = L.latLngBounds([
          [startLat, startLon],
          [endLat, endLon],
          ...path,
        ]);
        map.fitBounds(bounds.pad(0.22), { animate: true });
      });
    };

    void init();

    return () => {
      cancelled = true;
      if (frameId) cancelAnimationFrame(frameId);
      mapRef.current?.off();
      mapRef.current?.remove();
      mapRef.current = null;
      layersRef.current = {};
    };
  }, [startLat, startLon, endLat, endLon, path]);

  useEffect(() => {
    const handleResize = () => {
      mapRef.current?.invalidateSize();
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return <div ref={containerRef} className="absolute inset-0" />;
}

export default function JobRouteModal({ open, onClose, destinationLabel, jobTitle }: JobRouteModalProps) {
  const { locale } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState<RouteData | null>(null);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError("");
      setData(null);

      try {
        const origin = await getCurrentPosition();
        const destination = await geocodeDestination(destinationLabel, locale);
        const route = await loadRoute(origin, destination);

        if (cancelled) return;

        setData({
          origin,
          destination,
          route: route.path,
          distanceMeters: route.distanceMeters,
          durationSeconds: route.durationSeconds,
          destinationLabel,
        });
      } catch (err) {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : "";
        const geolocationCode =
          typeof err === "object" && err !== null && "code" in err
            ? Number((err as { code?: unknown }).code)
            : null;

        if (geolocationCode === 1 || message === "Geolocation is not available.") {
          setError(
            pick(locale, {
              mn: "Байршлын зөвшөөрөл өгөөгүй байна. Browser-ийн location permission-ийг асаагаад дахин оролдоно уу.",
              en: "Location access is blocked. Please allow browser location access and try again.",
              ko: "위치 권한이 차단되었습니다. 브라우저 위치 권한을 허용한 뒤 다시 시도해 주세요.",
            }),
          );
        } else if (message === "destination_not_found") {
          setError(
            pick(locale, {
              mn: "Ажлын байршлыг map дээрээс олж чадсангүй.",
              en: "Could not find the job location on the map.",
              ko: "지도에서 채용 위치를 찾지 못했습니다.",
            }),
          );
        } else {
          setError(
            pick(locale, {
              mn: "Замын мэдээлэл татаж чадсангүй. Дахин оролдоно уу.",
              en: "Unable to load the route. Please try again.",
              ko: "경로를 불러오지 못했습니다. 다시 시도해 주세요.",
            }),
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [open, destinationLabel, locale]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    if (open) {
      window.addEventListener("keydown", onKeyDown);
      return () => window.removeEventListener("keydown", onKeyDown);
    }

    return undefined;
  }, [open, onClose]);

  if (!open) return null;

  const distanceLabel = data ? formatDistance(locale, data.distanceMeters) : "";
  const durationLabel = data ? formatDuration(locale, data.durationSeconds) : "";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-6xl overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-gray-100 bg-white px-4 py-4 sm:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#22c55e]">
              {pick(locale, { mn: "Замын зураг", en: "Route Map", ko: "경로 지도" })}
            </p>
            <h3 className="mt-1 text-xl font-bold text-blue-900 sm:text-2xl">{jobTitle}</h3>
            <p className="mt-1 text-sm text-blue-900/70">
              {pick(locale, {
                mn: "Таны одоогийн байрлалаас ажлын байршил хүртэлх замыг харуулж байна.",
                en: "Showing the route from your current location to the job location.",
                ko: "현재 위치에서 채용 위치까지의 경로를 보여줍니다.",
              })}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-gray-200 p-2 text-blue-900 transition hover:bg-gray-50"
            aria-label={pick(locale, { mn: "Хаах", en: "Close", ko: "닫기" })}
          >
            <X size={18} />
          </button>
        </div>

        <div className="grid gap-4 p-4 sm:p-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="overflow-hidden rounded-3xl border border-gray-200 bg-gray-50 shadow-sm">
            <div className="relative min-h-[420px]">
              {loading ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white/90">
                  <Loader2 className="h-8 w-8 animate-spin text-[#22c55e]" />
                  <p className="text-sm font-medium text-blue-900">
                    {pick(locale, {
                      mn: "Байршил болон замыг тооцоолж байна...",
                      en: "Calculating the route...",
                      ko: "경로를 계산하는 중...",
                    })}
                  </p>
                </div>
              ) : error ? (
                <div className="absolute inset-0 flex items-center justify-center bg-white p-6">
                  <div className="max-w-md rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm leading-relaxed text-amber-800">
                    {error}
                  </div>
                </div>
              ) : data ? (
                <>
                  <RouteMapView data={data} />
                  <div className="pointer-events-none absolute inset-x-3 bottom-3 rounded-2xl bg-white/95 p-3 shadow-lg backdrop-blur">
                    <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-blue-900/70">
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#eef7f1] px-2 py-1 text-[#22c55e]">
                        <Navigation2 size={11} />
                        {pick(locale, { mn: "Ногоон маршрут", en: "Green route", ko: "초록 경로" })}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-1 text-blue-900">
                        <MapPin size={11} />
                        {pick(locale, { mn: "Таны байрлал", en: "Your location", ko: "내 위치" })}
                      </span>
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          </div>

          <div className="space-y-3">
            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-900/60">
                {pick(locale, { mn: "Эхлэл", en: "Start", ko: "출발" })}
              </p>
              <p className="mt-1 text-sm font-semibold text-blue-900">
                {pick(locale, { mn: "Таны одоогийн байршил", en: "Your current location", ko: "현재 위치" })}
              </p>
              {data && <p className="mt-1 text-xs text-blue-900/60">{data.origin.lat.toFixed(5)}, {data.origin.lon.toFixed(5)}</p>}
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-900/60">
                {pick(locale, { mn: "Зорьж буй газар", en: "Destination", ko: "목적지" })}
              </p>
              <p className="mt-1 text-sm font-semibold text-blue-900">{data ? data.destinationLabel : destinationLabel}</p>
              {data && <p className="mt-1 text-xs text-blue-900/60">{data.destination.lat.toFixed(5)}, {data.destination.lon.toFixed(5)}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-gray-200 bg-[#eef7f1] p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#22c55e]">
                  {pick(locale, { mn: "Зай", en: "Distance", ko: "거리" })}
                </p>
                <p className="mt-1 text-lg font-bold text-blue-900">{data ? distanceLabel : "—"}</p>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-[#eef7f1] p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#22c55e]">
                  {pick(locale, { mn: "Хугацаа", en: "Duration", ko: "시간" })}
                </p>
                <p className="mt-1 text-lg font-bold text-blue-900">{data ? durationLabel : "—"}</p>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-blue-900/70">
              {pick(locale, {
                mn: "Ногоон шугам нь таны одоогийн байршлаас ажлын байр хүртэлх замыг харуулна. Газрын зураг дээр ойртуулж, чирж үзэж болно.",
                en: "The green line shows the route from your current location to the job. You can zoom and drag the map.",
                ko: "초록 선은 현재 위치에서 채용 위치까지의 경로를 보여줍니다. 지도를 확대하거나 드래그할 수 있습니다.",
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

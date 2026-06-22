"use client";

import { useEffect, useRef } from "react";

type MapPoint = {
  lat: number;
  lon: number;
};

type OpenStreetMapPickerProps = {
  center: MapPoint;
  pin: MapPoint | null;
  onPick: (point: MapPoint) => void;
  className?: string;
};

type LeafletModule = typeof import("leaflet");

export default function OpenStreetMapPicker({ center, pin, onPick, className }: OpenStreetMapPickerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<import("leaflet").Map | null>(null);
  const markerRef = useRef<import("leaflet").Marker | null>(null);
  const onPickRef = useRef(onPick);
  const centerRef = useRef(center);
  const pinRef = useRef(pin);

  useEffect(() => {
    onPickRef.current = onPick;
  }, [onPick]);

  useEffect(() => {
    centerRef.current = center;
    pinRef.current = pin;
  }, [center, pin]);

  useEffect(() => {
    let cancelled = false;
    let frameId = 0;

    const initMap = async () => {
      if (!containerRef.current || mapRef.current) return;

      const leafletImport = (await import("leaflet")) as LeafletModule & { default?: LeafletModule };
      const L = leafletImport.default ?? leafletImport;

      if (cancelled || !containerRef.current || mapRef.current) return;

      const initialCenter = centerRef.current;
      const initialPin = pinRef.current;

      const pinIcon = L.divIcon({
        className: "",
        html: `
          <div style="position:relative;width:28px;height:42px;transform:translateY(-6px);">
            <div style="position:absolute;left:0;right:0;top:0;width:28px;height:28px;border-radius:9999px;background:#22c55e;border:3px solid #ffffff;box-shadow:0 12px 24px rgba(15,23,42,0.28);"></div>
            <div style="position:absolute;left:50%;top:9px;width:8px;height:8px;transform:translateX(-50%);border-radius:9999px;background:#ffffff;"></div>
            <div style="position:absolute;left:50%;bottom:0;width:0;height:0;transform:translateX(-50%);border-left:8px solid transparent;border-right:8px solid transparent;border-top:12px solid #22c55e;"></div>
          </div>
        `,
        iconSize: [28, 42],
        iconAnchor: [14, 38],
      });

      const map = L.map(containerRef.current, {
        zoomControl: false,
        minZoom: 4,
        maxZoom: 19,
        worldCopyJump: true,
      }).setView([initialCenter.lat, initialCenter.lon], 12);

      L.control.zoom({ position: "bottomright" }).addTo(map);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      const startPoint = initialPin ?? initialCenter;
      const marker = L.marker([startPoint.lat, startPoint.lon], {
        draggable: true,
        icon: pinIcon,
      }).addTo(map);

      map.on("click", (event: import("leaflet").LeafletMouseEvent) => {
        const { lat, lng } = event.latlng;
        marker.setLatLng([lat, lng]);
        onPickRef.current({ lat, lon: lng });
      });

      marker.on("dragend", () => {
        const latLng = marker.getLatLng();
        onPickRef.current({ lat: latLng.lat, lon: latLng.lng });
      });

      mapRef.current = map;
      markerRef.current = marker;

      frameId = requestAnimationFrame(() => {
        if (cancelled || !mapRef.current) return;

        map.invalidateSize();
      });
    };

    void initMap();

    return () => {
      cancelled = true;
      if (frameId) cancelAnimationFrame(frameId);
      if (mapRef.current) {
        mapRef.current.off();
        mapRef.current.remove();
      }
      mapRef.current = null;
      markerRef.current = null;
    };
  }, []);

  const targetLat = pin?.lat ?? center.lat;
  const targetLon = pin?.lon ?? center.lon;

  useEffect(() => {
    if (!mapRef.current || !markerRef.current) return;

    mapRef.current.setView([targetLat, targetLon], mapRef.current.getZoom(), { animate: true });
    markerRef.current.setLatLng([targetLat, targetLon]);
  }, [targetLat, targetLon]);

  useEffect(() => {
    const handleResize = () => {
      mapRef.current?.invalidateSize();
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return <div ref={containerRef} className={className ?? "h-full w-full"} />;
}

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useApp } from "@/state/AppContext";

interface PropertyPin {
  id: string;
  lat: number;
  lng: number;
  verdict: "green" | "yellow" | "red";
  price: string;
  hasVideo?: boolean;
}

export function PropertyMap({
  pins = [],
  className = "h-full w-full",
  onPinClick,
}: {
  pins?: PropertyPin[];
  className?: string;
  onPinClick?: (id: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const { geo, requestGeo } = useApp();

  // Init map
  useEffect(() => {
    if (!ref.current || mapRef.current) return;

    const center: [number, number] = geo ? [geo.lat, geo.lng] : [25.276987, 55.296249]; // fallback Dubai
    const map = L.map(ref.current, {
      center,
      zoom: geo ? 14 : 11,
      zoomControl: true,
      attributionControl: true,
    });

    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png",
      {
        attribution: '© OpenStreetMap · © CARTO',
        maxZoom: 19,
        subdomains: "abcd",
      }
    ).addTo(map);

    // labels overlay
    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png",
      { maxZoom: 19, subdomains: "abcd", pane: "shadowPane" }
    ).addTo(map);

    mapRef.current = map;

    if (!geo) requestGeo();

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update user position
  useEffect(() => {
    if (!mapRef.current || !geo) return;
    const map = mapRef.current;
    map.setView([geo.lat, geo.lng], Math.max(map.getZoom(), 13), { animate: true });

    if (userMarkerRef.current) userMarkerRef.current.remove();

    const icon = L.divIcon({
      className: "",
      html: `<div style="position:relative;width:18px;height:18px;">
        <div style="position:absolute;inset:0;border-radius:9999px;background:hsl(28 45% 48%);box-shadow:0 0 0 4px hsl(28 45% 48% / 0.25),0 0 0 10px hsl(28 45% 48% / 0.12);"></div>
      </div>`,
      iconSize: [18, 18],
      iconAnchor: [9, 9],
    });

    userMarkerRef.current = L.marker([geo.lat, geo.lng], { icon, zIndexOffset: 1000 }).addTo(map);
  }, [geo]);

  // Render pins
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    const layer = L.layerGroup().addTo(map);

    pins.forEach((p) => {
      const colorVar =
        p.verdict === "green"
          ? "hsl(145 55% 36%)"
          : p.verdict === "yellow"
          ? "hsl(38 85% 50%)"
          : "hsl(0 70% 50%)";

      const html = `
        <div style="display:flex;flex-direction:column;align-items:center;transform:translateY(-4px);">
          <div style="background:white;border:1px solid hsl(30 12% 88%);border-radius:9999px;padding:4px 10px;font-size:11px;font-weight:600;color:hsl(220 13% 13%);box-shadow:0 4px 12px rgba(0,0,0,0.08);display:flex;align-items:center;gap:6px;">
            ${p.hasVideo ? '<span style="display:inline-block;width:0;height:0;border-left:5px solid hsl(28 45% 48%);border-top:3px solid transparent;border-bottom:3px solid transparent;"></span>' : ""}
            <span style="display:inline-block;width:6px;height:6px;border-radius:9999px;background:${colorVar};"></span>
            ${p.price}
          </div>
          <div style="width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-top:6px solid white;margin-top:-1px;"></div>
        </div>`;

      const marker = L.marker([p.lat, p.lng], {
        icon: L.divIcon({ className: "", html, iconSize: [80, 32], iconAnchor: [40, 32] }),
      }).addTo(layer);

      if (onPinClick) marker.on("click", () => onPinClick(p.id));
    });

    return () => {
      layer.remove();
    };
  }, [pins, onPinClick]);

  return <div ref={ref} className={className} />;
}

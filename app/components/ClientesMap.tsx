"use client";
import "@/lib/fixLeafletIcons";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import type { Map as LeafletMap } from "leaflet";
import L from "leaflet";
import { useEffect } from "react";
import "leaflet/dist/leaflet.css";

type Cliente = {
  id: string;
  nombre: string;
  direccion?: string;
  comuna?: string;
  ciudad?: string;
  lat?: number;
  lng?: number;
};

/* 🔹 Ajustar el mapa automáticamente a todos los puntos */
function FitToAllMarkers({ clientes }: { clientes: Cliente[] }) {
  const map = useMap();

  useEffect(() => {
    const coords = clientes
      .filter(
        (c) =>
          typeof c.lat === "number" &&
          typeof c.lng === "number" &&
          !isNaN(c.lat) &&
          !isNaN(c.lng)
      )
      .map((c) => [c.lat!, c.lng!] as [number, number]);

    if (coords.length > 0) {
      const bounds = L.latLngBounds(coords);
      map.fitBounds(bounds, { padding: [80, 80], maxZoom: 14 });
    }
  }, [clientes, map]);

  return null;
}

export default function ClientesMap({ clientes }: { clientes: Cliente[] }) {
  const clientesConCoords = clientes.filter(
    (c) =>
      typeof c.lat === "number" &&
      typeof c.lng === "number" &&
      !isNaN(c.lat) &&
      !isNaN(c.lng)
  );

  const center: [number, number] =
    clientesConCoords.length > 0
      ? [clientesConCoords[0].lat!, clientesConCoords[0].lng!]
      : [-33.45, -70.66]; // Santiago por defecto

  return (
    <div className="h-[400px] w-full rounded-lg overflow-hidden border relative">
      <MapContainer center={center} zoom={12} className="h-full w-full">
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>'
        />
        <FitToAllMarkers clientes={clientesConCoords} />

        {clientesConCoords.map((c) => (
          <Marker key={c.id} position={[c.lat!, c.lng!]}>
            <Popup>
              <strong>{c.nombre}</strong>
              <br />
              {c.direccion && <>{c.direccion}<br /></>}
              {c.comuna && c.ciudad && (
                <>
                  {c.comuna}, {c.ciudad}
                  <br />
                </>
              )}
              <span className="text-xs text-gray-600">
                Lat: {c.lat?.toFixed(4)} / Lng: {c.lng?.toFixed(4)}
              </span>
            </Popup>
          </Marker>
        ))}

        {clientesConCoords.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 text-gray-600 font-medium">
            Sin ubicaciones registradas 📍
          </div>
        )}
      </MapContainer>
    </div>
  );
}

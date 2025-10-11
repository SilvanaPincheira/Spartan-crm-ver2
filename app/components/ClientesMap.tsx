"use client";

import "@/lib/fixLeafletIcons"; // 👈 evita íconos rotos en Vercel
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
} from "react-leaflet";
import L, { LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";

// ===== Tipos =====
type Cliente = {
  id: string;
  nombre: string;
  lat?: number;
  lng?: number;
};

interface ClientesMapProps {
  clientes: Cliente[];
  onMapClick?: (lat: number, lng: number) => void;
}

// ===== Componente auxiliar para detectar clics =====
function MapClickHandler({
  onClick,
}: {
  onClick?: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      if (onClick) onClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// ===== Componente principal =====
export default function ClientesMap({ clientes, onMapClick }: ClientesMapProps) {
  // 📍 Coordenadas de centro inicial
  const center: LatLngExpression =
    clientes.length && clientes[0].lat && clientes[0].lng
      ? [clientes[0].lat, clientes[0].lng]
      : [-33.45, -70.66]; // Santiago por defecto

  // 📌 Icono personalizado
  const icon = L.icon({
    iconUrl: "/marker-icon.png",
    shadowUrl: "/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  return (
    <div className="h-[400px] w-full rounded-lg overflow-hidden border border-gray-300 shadow-sm">
      <MapContainer
        center={center}
        zoom={13}
        scrollWheelZoom={true}
        className="h-full w-full"
      >
        {/* Capa base */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Detecta clics */}
        <MapClickHandler onClick={onMapClick} />

        {/* Marcadores de clientes */}
        {clientes
          .filter((c) => c.lat && c.lng)
          .map((c) => (
            <Marker key={c.id} position={[c.lat!, c.lng!]} icon={icon}>
              <Popup>
                <strong>{c.nombre}</strong>
                <br />
                Lat: {c.lat?.toFixed(4)} / Lng: {c.lng?.toFixed(4)}
              </Popup>
            </Marker>
          ))}
      </MapContainer>
    </div>
  );
}

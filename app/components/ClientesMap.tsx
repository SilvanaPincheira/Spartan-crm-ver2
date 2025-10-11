"use client";

// 🧭 Importar el fix ANTES que react-leaflet
import "@/lib/fixLeafletIcons";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import type { Map as LeafletMap } from "leaflet";
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

export default function ClientesMap({ clientes = [] }: { clientes: Cliente[] }) {
  // Filtra clientes con coordenadas válidas
  const clientesConCoords = clientes.filter((c) => c.lat && c.lng);

  // Centro inicial del mapa (usa el primer cliente o Santiago como fallback)
  const center: [number, number] = clientesConCoords.length
    ? [clientesConCoords[0].lat!, clientesConCoords[0].lng!]
    : [-33.45, -70.66]; // Santiago, Chile

  return (
    <div className="h-[70vh] w-full rounded-lg overflow-hidden border border-gray-300 shadow-md">
      <MapContainer center={center} zoom={6} className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {clientesConCoords.map((c) => (
          <Marker key={c.id} position={[c.lat!, c.lng!]}>
            <Popup>
              <strong>{c.nombre}</strong>
              <br />
              {c.direccion || ""}
              <br />
              {c.comuna || ""}, {c.ciudad || ""}
              <br />
              <span className="text-xs text-gray-500">
                Lat: {c.lat?.toFixed(3)} / Lng: {c.lng?.toFixed(3)}
              </span>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Si no hay coordenadas, mensaje de aviso */}
      {!clientesConCoords.length && (
        <p className="text-center text-gray-600 mt-2 italic">
          No hay clientes con ubicación registrada 📍
        </p>
      )}
    </div>
  );
}

"use client";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import type { Map as LeafletMap } from "leaflet"; // ✅ Importa el tipo correcto
import "leaflet/dist/leaflet.css";

type Cliente = {
  id: string;
  nombre: string;
  lat?: number;
  lng?: number;
};

export default function ClientesMap({ clientes }: { clientes: Cliente[] }) {
  const center: [number, number] = clientes.length
    ? [clientes[0].lat || -33.45, clientes[0].lng || -70.66]
    : [-33.45, -70.66];

  return (
    <div className="h-[400px] w-full rounded-lg overflow-hidden border">
      {/* ✅ Especifica el tipo genérico del componente para evitar el error */}
      <MapContainer
        center={center as [number, number]}
        zoom={10}
        className="h-full w-full"
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {clientes
          .filter((c) => c.lat && c.lng)
          .map((c) => (
            <Marker key={c.id} position={[c.lat!, c.lng!]}>
              <Popup>
                <strong>{c.nombre}</strong>
                <br />
                Lat: {c.lat?.toFixed(3)} / Lng: {c.lng?.toFixed(3)}
              </Popup>
            </Marker>
          ))}
      </MapContainer>
    </div>
  );
}

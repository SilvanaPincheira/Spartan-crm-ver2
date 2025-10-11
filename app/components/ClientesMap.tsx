"use client";
import "@/lib/fixLeafletIcons";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import type { Map as LeafletMap } from "leaflet";
import "leaflet/dist/leaflet.css";

type Cliente = {
  id: string;
  nombre: string;
  lat?: number;
  lng?: number;
  direccion?: string;
  comuna?: string;
  ciudad?: string;
};

export default function ClientesMap({
  clientes,
  onMapClick,
  markerNuevo,
}: {
  clientes: Cliente[];
  onMapClick?: (lat: number, lng: number) => void;
  markerNuevo?: { lat: number; lng: number };
}) {
  const center: [number, number] =
    markerNuevo
      ? [markerNuevo.lat, markerNuevo.lng]
      : clientes.length && clientes[0].lat && clientes[0].lng
      ? [clientes[0].lat, clientes[0].lng]
      : [-33.45, -70.66];

  function MapClickHandler() {
    useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;
        onMapClick?.(lat, lng);
      },
    });
    return null;
  }

  return (
    <div className="h-[400px] w-full rounded-lg overflow-hidden border">
      <MapContainer center={center} zoom={14} className="h-full w-full">
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {clientes
          .filter((c) => c.lat && c.lng)
          .map((c) => (
            <Marker key={c.id} position={[c.lat!, c.lng!]}>
              <Popup>
                <strong>{c.nombre}</strong>
                <br />
                {c.direccion}
                <br />
                {c.comuna}, {c.ciudad}
                <br />
                <small>
                  Lat: {c.lat?.toFixed(5)} / Lng: {c.lng?.toFixed(5)}
                </small>
              </Popup>
            </Marker>
          ))}
        {markerNuevo && (
          <Marker position={[markerNuevo.lat, markerNuevo.lng]}>
            <Popup>📍 Nueva ubicación seleccionada</Popup>
          </Marker>
        )}
        <MapClickHandler />
      </MapContainer>
    </div>
  );
}

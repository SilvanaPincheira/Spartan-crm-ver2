"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import dynamic from "next/dynamic";

const Map = dynamic(() => import("@/components/ClientesMap"), { ssr: false });

// Configuración Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Cliente = {
  id: string;
  nombre: string;
  rut: string;
  direccion: string;
  comuna: string;
  ciudad: string;
  lat?: number;
  lng?: number;
  created_at?: string;
};

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [form, setForm] = useState<Partial<Cliente>>({});
  const [markerNuevo, setMarkerNuevo] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(false);

  // Cargar clientes desde Supabase
  async function loadClientes() {
    const { data, error } = await supabase
      .from("crm_clientes")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) console.error("Error al cargar clientes:", error);
    else setClientes(data || []);
  }

  useEffect(() => {
    loadClientes();
  }, []);

  // Guardar nuevo cliente
  async function saveCliente(e: React.FormEvent) {
    e.preventDefault();

    if (!form.nombre || !form.rut) {
      alert("Debe ingresar Nombre y RUT del cliente");
      return;
    }

    if (!form.lat || !form.lng) {
      alert("Debe seleccionar ubicación en el mapa o presionar 'Obtener ubicación actual'");
      return;
    }

    setLoading(true);
    const { error } = await supabase.from("crm_clientes").insert([form]);
    if (error) alert("Error al guardar: " + error.message);
    else {
      alert("✅ Cliente registrado correctamente");
      setForm({});
      setMarkerNuevo(null);
      loadClientes();
    }
    setLoading(false);
  }

  // Obtener ubicación actual desde GPS
  async function getUbicacion() {
    if (!navigator.geolocation) {
      alert("⚠️ Geolocalización no soportada en este navegador.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (p) => {
        const lat = p.coords.latitude;
        const lng = p.coords.longitude;
        setForm((f) => ({ ...f, lat, lng }));
        setMarkerNuevo({ lat, lng });
        alert(`📍 Coordenadas registradas:\nLat: ${lat.toFixed(5)} / Lng: ${lng.toFixed(5)}`);
      },
      (err) => alert("Error al obtener ubicación: " + err.message),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  // Eliminar cliente
  async function deleteCliente(id: string) {
    if (!confirm("¿Eliminar este cliente?")) return;
    const { error } = await supabase.from("crm_clientes").delete().eq("id", id);
    if (error) alert("Error al eliminar: " + error.message);
    else loadClientes();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-blue-800">📍 Clientes — Gestión y Ubicación</h1>

      {/* Formulario */}
      <form
        onSubmit={saveCliente}
        className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-white p-4 rounded-lg shadow"
      >
        <input
          className="border p-2 rounded"
          placeholder="Nombre *"
          value={form.nombre || ""}
          onChange={(e) => setForm({ ...form, nombre: e.target.value })}
        />
        <input
          className="border p-2 rounded"
          placeholder="RUT *"
          value={form.rut || ""}
          onChange={(e) => setForm({ ...form, rut: e.target.value })}
        />
        <input
          className="border p-2 rounded md:col-span-3"
          placeholder="Dirección"
          value={form.direccion || ""}
          onChange={(e) => setForm({ ...form, direccion: e.target.value })}
        />
        <input
          className="border p-2 rounded"
          placeholder="Comuna"
          value={form.comuna || ""}
          onChange={(e) => setForm({ ...form, comuna: e.target.value })}
        />
        <input
          className="border p-2 rounded"
          placeholder="Ciudad"
          value={form.ciudad || ""}
          onChange={(e) => setForm({ ...form, ciudad: e.target.value })}
        />
        <button
          type="button"
          onClick={getUbicacion}
          className="bg-emerald-600 text-white rounded px-3 hover:bg-emerald-700"
        >
          📍 Obtener ubicación actual
        </button>

        <button
          type="submit"
          disabled={loading}
          className="md:col-span-3 bg-blue-700 text-white rounded py-2 hover:bg-blue-800"
        >
          {loading ? "Guardando..." : "💾 Guardar cliente"}
        </button>
      </form>

      {/* Tabla de clientes */}
      <div className="overflow-x-auto bg-white rounded shadow">
        <table className="min-w-full text-sm">
          <thead className="bg-blue-100 text-blue-900">
            <tr>
              <th className="p-2 text-left">Nombre</th>
              <th className="p-2 text-left">RUT</th>
              <th className="p-2 text-left">Dirección</th>
              <th className="p-2 text-left">Comuna</th>
              <th className="p-2 text-left">Ciudad</th>
              <th className="p-2 text-left">Lat</th>
              <th className="p-2 text-left">Lng</th>
              <th className="p-2 text-center">Acción</th>
            </tr>
          </thead>
          <tbody>
            {clientes.map((c) => (
              <tr key={c.id} className="border-t hover:bg-gray-50">
                <td className="p-2">{c.nombre}</td>
                <td className="p-2">{c.rut}</td>
                <td className="p-2">{c.direccion}</td>
                <td className="p-2">{c.comuna}</td>
                <td className="p-2">{c.ciudad}</td>
                <td className="p-2">{c.lat?.toFixed(5)}</td>
                <td className="p-2">{c.lng?.toFixed(5)}</td>
                <td className="p-2 text-center">
                  <button
                    onClick={() => deleteCliente(c.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    ✖
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mapa */}
      <div className="mt-4">
        <Map
          clientes={clientes}
          markerNuevo={markerNuevo || (form.lat && form.lng ? { lat: form.lat, lng: form.lng } : undefined)}
          onMapClick={(lat, lng) => {
            setForm((f) => ({ ...f, lat, lng }));
            setMarkerNuevo({ lat, lng });
            alert(`📍 Coordenadas seleccionadas:\nLat: ${lat.toFixed(5)} / Lng: ${lng.toFixed(5)}`);
          }}
        />
      </div>
    </div>
  );
}

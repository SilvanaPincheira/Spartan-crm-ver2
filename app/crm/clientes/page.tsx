"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { createClient } from "@supabase/supabase-js";

// 📍 Cargar el mapa de forma dinámica (sin SSR)
const Map = dynamic(() => import("@/components/ClientesMap"), { ssr: false });

// 🔧 Conexión Supabase
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
  const [loading, setLoading] = useState(false);

  // ✅ Cargar clientes desde Supabase
  async function loadClientes() {
    const { data, error } = await supabase
      .from("crm_clientes")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) console.error(error);
    else setClientes(data || []);
  }

  useEffect(() => {
    loadClientes();
  }, []);

  // ✅ Guardar cliente nuevo
  async function saveCliente(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nombre || !form.rut) {
      alert("Debe ingresar Nombre y RUT del cliente");
      return;
    }

    if (!form.lat || !form.lng) {
      alert("Debe seleccionar la ubicación en el mapa o usar GPS.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.from("crm_clientes").insert([form]);
    if (error) alert("Error al guardar: " + error.message);
    else {
      alert("✅ Cliente registrado correctamente");
      setForm({});
      loadClientes();
    }
    setLoading(false);
  }

  // ✅ Obtener ubicación GPS actual
  async function getUbicacion() {
    if (!navigator.geolocation) {
      alert("Geolocalización no soportada en este navegador");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (p) => {
        const lat = p.coords.latitude;
        const lng = p.coords.longitude;
        setForm((f) => ({ ...f, lat, lng }));
        alert(`📍 Coordenadas registradas:\nLat: ${lat.toFixed(5)} / Lng: ${lng.toFixed(5)}`);
      },
      (err) => alert("Error al obtener ubicación: " + err.message),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  // ✅ Eliminar cliente
  async function deleteCliente(id: string) {
    if (!confirm("¿Seguro que desea eliminar este cliente?")) return;
    const { error } = await supabase.from("crm_clientes").delete().eq("id", id);
    if (error) alert("Error al eliminar: " + error.message);
    else loadClientes();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-blue-800">📋 Gestión de Clientes</h1>

      {/* ===== FORMULARIO ===== */}
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
          className="border p-2 rounded"
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
          {loading ? "Guardando..." : "Guardar cliente"}
        </button>
      </form>

      {/* ===== TABLA ===== */}
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
              <th className="p-2">🗑️</th>
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
                <td className="text-center">
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

      {/* ===== MAPA ===== */}
      <div className="mt-4">
        <Map
          clientes={clientes}
          onMapClick={(lat, lng) => {
            setForm((f) => ({ ...f, lat, lng }));
            alert(
              `📍 Coordenadas registradas:\nLat: ${lat.toFixed(
                5
              )} / Lng: ${lng.toFixed(5)}`
            );
          }}
        />
      </div>
    </div>
  );
}

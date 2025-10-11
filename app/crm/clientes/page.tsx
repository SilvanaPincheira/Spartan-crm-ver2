"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import dynamic from "next/dynamic";

const Map = dynamic(() => import("@/components/ClientesMap"), { ssr: false });

// 🔧 Conexión Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Tipado de datos
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

  // =========================================
  // 🔹 CARGAR CLIENTES DESDE SUPABASE
  // =========================================
  async function loadClientes() {
    const { data, error } = await supabase
      .from("crm_clientes")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) console.error("Error cargando clientes:", error);
    else setClientes(data || []);
  }

  useEffect(() => {
    loadClientes();
  }, []);

  // =========================================
  // 🌍 GEOLOCALIZACIÓN AUTOMÁTICA POR DIRECCIÓN
  // =========================================
  async function getUbicacionAutomatica() {
    if (!form.direccion || !form.comuna || !form.ciudad) {
      alert("Debe ingresar dirección, comuna y ciudad");
      return;
    }

    const query = `${form.direccion}, ${form.comuna}, ${form.ciudad}`;
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      query
    )}`;

    try {
      const res = await fetch(url);
      const data = await res.json();

      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        setForm((f) => ({
          ...f,
          lat: parseFloat(lat),
          lng: parseFloat(lon),
        }));
        alert(`📍 Coordenadas encontradas:\nLat: ${lat}\nLng: ${lon}`);
      } else {
        alert("❌ No se encontró la dirección en el mapa.");
      }
    } catch (err) {
      console.error(err);
      alert("Error al buscar la dirección.");
    }
  }

  // =========================================
  // 💾 GUARDAR CLIENTE
  // =========================================
  async function saveCliente(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nombre || !form.rut) {
      alert("Debe ingresar Nombre y RUT del cliente");
      return;
    }

    setLoading(true);
    const { error } = await supabase.from("crm_clientes").insert([form]);

    if (error) alert("Error al guardar: " + error.message);
    else {
      alert("Cliente registrado ✅");
      setForm({});
      loadClientes();
    }
    setLoading(false);
  }

  // =========================================
  // 🗑️ ELIMINAR CLIENTE
  // =========================================
  async function deleteCliente(id: string) {
    if (!confirm("¿Eliminar este cliente?")) return;
    const { error } = await supabase.from("crm_clientes").delete().eq("id", id);
    if (error) alert("Error al eliminar: " + error.message);
    else loadClientes();
  }

  // =========================================
  // 🕓 REGISTRAR VISITA EN TERRENO
  // =========================================
  async function registrarVisita(cliente: Cliente) {
    if (!navigator.geolocation) {
      alert("El navegador no soporta geolocalización.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const latActual = pos.coords.latitude;
        const lngActual = pos.coords.longitude;

        if (!cliente.lat || !cliente.lng) {
          alert("El cliente no tiene coordenadas registradas.");
          return;
        }

        const distancia = calcularDistancia(
          cliente.lat,
          cliente.lng,
          latActual,
          lngActual
        );

        const confirmada = distancia <= 100; // ✅ dentro de 100 m del cliente

        const { error } = await supabase.from("crm_visitas").insert([
          {
            cliente_id: cliente.id,
            usuario: "ejecutivo@spartan.cl", // luego reemplazable por auth user
            lat_actual: latActual,
            lng_actual: lngActual,
            distancia_metros: distancia,
            confirmada,
          },
        ]);

        if (error) {
          console.error(error);
          alert("Error al registrar visita.");
        } else if (confirmada) {
          alert(
            `✅ Visita confirmada.\nDistancia al cliente: ${distancia.toFixed(
              2
            )} metros.`
          );
        } else {
          alert(
            `⚠️ Estás a ${distancia.toFixed(
              2
            )} metros del cliente.\nVisita no confirmada.`
          );
        }
      },
      (err) => alert("Error obteniendo ubicación: " + err.message),
      { enableHighAccuracy: true }
    );
  }

  // =========================================
  // 📏 FUNCIÓN PARA CALCULAR DISTANCIA (HAVERSINE)
  // =========================================
  function calcularDistancia(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ) {
    const R = 6371e3; // radio Tierra en metros
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) *
      Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  // =========================================
  // 🖥️ INTERFAZ
  // =========================================
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-blue-800">
        Clientes — Visitas en terreno
      </h1>

      {/* FORMULARIO */}
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
          onClick={getUbicacionAutomatica}
          className="bg-emerald-600 text-white rounded px-3 hover:bg-emerald-700"
        >
          🌍 Obtener ubicación automática
        </button>

        <button
          type="submit"
          disabled={loading}
          className="md:col-span-3 bg-blue-700 text-white rounded py-2 hover:bg-blue-800"
        >
          {loading ? "Guardando..." : "💾 Guardar cliente"}
        </button>
      </form>

      {/* TABLA DE CLIENTES */}
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
              <th className="p-2 text-center">Acciones</th>
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
                <td className="p-2 text-center flex gap-2 justify-center">
                  <button
                    onClick={() => registrarVisita(c)}
                    className="bg-emerald-500 text-white px-2 py-1 rounded hover:bg-emerald-700"
                  >
                    🕓 Registrar visita
                  </button>
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

      {/* MAPA */}
      <div className="mt-4">
        <Map clientes={clientes} />
      </div>
    </div>
  );
}

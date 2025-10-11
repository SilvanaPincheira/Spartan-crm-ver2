"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { createClient } from "@supabase/supabase-js";

// 🗺️ Mapa dinámico (solo cliente)
const Map = dynamic(() => import("@/components/ClientesMap"), { ssr: false });

// 🔗 Supabase
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

  // 📦 Cargar clientes desde Supabase
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

  // 🌍 Geocodificar dirección usando OpenStreetMap (Nominatim)
  async function getCoordsFromAddress(direccion: string, comuna?: string, ciudad?: string) {
    try {
      const fullAddress = [direccion, comuna, ciudad, "Chile"].filter(Boolean).join(", ");
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullAddress)}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        return { lat: parseFloat(lat), lng: parseFloat(lon) };
      }
      return { lat: null, lng: null };
    } catch (e) {
      console.error("Error geocodificando dirección:", e);
      return { lat: null, lng: null };
    }
  }

  // 🔹 Normalizar coordenadas manuales o GPS
  function normalizeCoords(lat?: number | string, lng?: number | string) {
    if (lat == null || lng == null) return { lat: null, lng: null };
    let la = Number(lat);
    let ln = Number(lng);
    if (Number.isNaN(la) || Number.isNaN(ln)) return { lat: null, lng: null };
    if (Math.abs(la) > 90 && Math.abs(ln) <= 90) {
      const tmp = la;
      la = ln;
      ln = tmp;
    }
    if (la < -90 || la > 90 || ln < -180 || ln > 180) return { lat: null, lng: null };
    return { lat: Number(la.toFixed(6)), lng: Number(ln.toFixed(6)) };
  }

  // 🧮 Validar RUT chileno
  function validarRut(rut: string): boolean {
    rut = rut.replace(/^0+|[^0-9kK]+/g, "").toUpperCase();
    if (rut.length < 8) return false;

    const cuerpo = rut.slice(0, -1);
    const dv = rut.slice(-1);
    let suma = 0;
    let multiplo = 2;

    for (let i = cuerpo.length - 1; i >= 0; i--) {
      suma += parseInt(cuerpo[i]) * multiplo;
      multiplo = multiplo < 7 ? multiplo + 1 : 2;
    }

    const dvEsperado = 11 - (suma % 11);
    const dvCalculado =
      dvEsperado === 11 ? "0" : dvEsperado === 10 ? "K" : dvEsperado.toString();

    return dv === dvCalculado;
  }

  // 💾 Guardar cliente
  async function saveCliente(e: React.FormEvent) {
    e.preventDefault();

    if (!form.nombre || !form.rut) {
      alert("Debe ingresar Nombre y RUT del cliente");
      return;
    }

    const rutLimpio = form.rut.replace(/\./g, "").replace("-", "").toUpperCase();
    if (!validarRut(rutLimpio)) {
      alert("❌ RUT inválido. Revise el formato o el dígito verificador.");
      return;
    }

    // Verificar duplicado
    const { data: existe } = await supabase
      .from("crm_clientes")
      .select("id")
      .eq("rut", rutLimpio)
      .maybeSingle();

    if (existe) {
      alert("⚠️ El cliente con este RUT ya existe en la base de datos.");
      return;
    }

    let { lat, lng } = normalizeCoords(form.lat, form.lng);

    // 🌎 Si no hay coordenadas, intentar obtener desde la dirección
    if ((!lat || !lng) && form.direccion) {
      const geo = await getCoordsFromAddress(form.direccion, form.comuna, form.ciudad);
      lat = geo.lat;
      lng = geo.lng;
      if (lat && lng) {
        alert(`📍 Coordenadas obtenidas desde dirección:\nLat: ${lat.toFixed(5)} / Lng: ${lng.toFixed(5)}`);
      } else {
        alert("⚠️ No se pudo ubicar la dirección automáticamente.");
      }
    }

    const payload = {
      nombre: form.nombre.trim(),
      rut: rutLimpio,
      direccion: form.direccion?.trim() ?? null,
      comuna: form.comuna?.trim() ?? null,
      ciudad: form.ciudad?.trim() ?? null,
      lat: lat ?? null,
      lng: lng ?? null,
    };

    console.log("🛰️ Insertando cliente:", payload);
    setLoading(true);
    const { error } = await supabase.from("crm_clientes").insert([payload]);
    setLoading(false);

    if (error) {
      console.error(error);
      alert("❌ Error al guardar: " + error.message);
      return;
    }

    alert("✅ Cliente registrado correctamente");
    setForm({});
    loadClientes();
  }

  // 🗑️ Eliminar cliente
  async function deleteCliente(id: string) {
    if (!confirm("¿Seguro que desea eliminar este cliente?")) return;
    const { error } = await supabase.from("crm_clientes").delete().eq("id", id);
    if (error) alert("Error al eliminar: " + error.message);
    else loadClientes();
  }

  // 📡 Obtener ubicación GPS
  async function getUbicacion() {
    if (!navigator.geolocation) {
      alert("Geolocalización no soportada");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (p) => {
        const lat = p.coords.latitude;
        const lng = p.coords.longitude;
        setForm((f) => ({ ...f, lat, lng }));
        alert(`📍 Coordenadas detectadas:\nLat: ${lat.toFixed(5)} / Lng: ${lng.toFixed(5)}`);
      },
      (err) => alert("Error al obtener ubicación: " + err.message),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-blue-800">📋 Gestión de Clientes</h1>

      {/* === FORMULARIO === */}
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

        {/* === Coordenadas === */}
        <input
          className="border p-2 rounded"
          type="text"
          inputMode="decimal"
          placeholder="Latitud"
          value={form.lat ?? ""}
          onChange={(e) =>
            setForm((f) => ({
              ...f,
              lat: Number(e.target.value.replace(",", ".")) || undefined,
            }))
          }
        />
        <input
          className="border p-2 rounded"
          type="text"
          inputMode="decimal"
          placeholder="Longitud"
          value={form.lng ?? ""}
          onChange={(e) =>
            setForm((f) => ({
              ...f,
              lng: Number(e.target.value.replace(",", ".")) || undefined,
            }))
          }
        />

        <button
          type="button"
          onClick={getUbicacion}
          className="bg-emerald-600 text-white rounded px-3 hover:bg-emerald-700"
        >
          📍 Usar ubicación actual
        </button>

        <button
          type="submit"
          disabled={loading}
          className="md:col-span-3 bg-blue-700 text-white rounded py-2 hover:bg-blue-800"
        >
          {loading ? "Guardando..." : "Guardar cliente"}
        </button>
      </form>

      {/* === TABLA === */}
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

      {/* === MAPA === */}
      <div className="mt-4">
        <Map
          clientes={clientes}
          onMapClick={(lat, lng) => {
            setForm((f) => ({ ...f, lat, lng }));
            alert(`📍 Coordenadas seleccionadas:\nLat: ${lat.toFixed(5)} / Lng: ${lng.toFixed(5)}`);
          }}
        />
      </div>
    </div>
  );
}

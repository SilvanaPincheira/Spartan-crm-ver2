import L from "leaflet";

// 🧭 Corrige las rutas de íconos rotos en Next.js/Vercel
delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: "/leaflet/marker-icon-2x.png",
  iconUrl: "/leaflet/marker-icon.png",
  shadowUrl: "/leaflet/marker-shadow.png",
});

export default L;

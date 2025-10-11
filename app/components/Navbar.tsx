export default function Navbar() {
  return (
    <header className="bg-blue-900 text-white flex justify-between items-center px-6 py-3 shadow">
      <h1 className="text-lg font-semibold tracking-wide">
        Spartan CRM v2
      </h1>
      <nav className="flex gap-6 text-sm">
        <a href="/crm/clientes" className="hover:text-emerald-400">Clientes</a>
        <a href="/crm/leads" className="hover:text-emerald-400">Leads</a>
        <a href="/crm/oportunidades" className="hover:text-emerald-400">Oportunidades</a>
        <a href="/crm/actividades" className="hover:text-emerald-400">Actividades</a>
        <a href="/crm/dashboard" className="hover:text-emerald-400">Dashboard</a>
      </nav>
    </header>
  );
}

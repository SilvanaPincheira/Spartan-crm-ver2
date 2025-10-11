export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      {/* Navbar */}
      <header className="bg-blue-900 text-white shadow-md">
        <div className="max-w-6xl mx-auto flex justify-between items-center px-4 py-3">
          <div className="flex items-center gap-3">
            <img
              src="/next.svg"
              alt="Spartan Logo"
              className="h-8 w-8 invert brightness-200"
            />
            <h1 className="text-xl font-semibold tracking-wide">
              Spartan CRM v2
            </h1>
          </div>
          <nav className="flex gap-6 text-sm">
            <a href="/crm/clientes" className="hover:text-emerald-400">
              Clientes
            </a>
            <a href="/crm/leads" className="hover:text-emerald-400">
              Leads
            </a>
            <a href="/crm/oportunidades" className="hover:text-emerald-400">
              Oportunidades
            </a>
            <a href="/crm/actividades" className="hover:text-emerald-400">
              Actividades
            </a>
            <a href="/crm/dashboard" className="hover:text-emerald-400">
              Dashboard
            </a>
          </nav>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="max-w-6xl mx-auto p-6">
        <section className="text-center py-10">
          <h2 className="text-4xl font-bold text-blue-800 mb-3">
            Bienvenido a Spartan CRM
          </h2>
          <p className="text-gray-600 mb-6">
            Gestiona tus clientes, leads, oportunidades y actividades en un solo
            lugar.
          </p>
          <div className="flex justify-center gap-3">
            <a
              href="/crm/leads"
              className="px-6 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800"
            >
              Ingresar Lead
            </a>
            <a
              href="/crm/clientes"
              className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
            >
              Ver Clientes
            </a>
          </div>
        </section>

        <section className="grid md:grid-cols-3 gap-6">
          <div className="bg-white shadow rounded-lg p-4 border-l-4 border-blue-700">
            <h3 className="text-lg font-semibold mb-2 text-blue-700">
              Leads activos
            </h3>
            <p className="text-gray-600">Registra y asigna nuevos prospectos.</p>
          </div>

          <div className="bg-white shadow rounded-lg p-4 border-l-4 border-emerald-600">
            <h3 className="text-lg font-semibold mb-2 text-emerald-600">
              Clientes
            </h3>
            <p className="text-gray-600">
              Administra clientes y su geolocalización.
            </p>
          </div>

          <div className="bg-white shadow rounded-lg p-4 border-l-4 border-gray-400">
            <h3 className="text-lg font-semibold mb-2 text-gray-700">
              Dashboard
            </h3>
            <p className="text-gray-600">
              Visualiza métricas, actividades y mapa comercial.
            </p>
          </div>
        </section>
      </main>

      <footer className="text-center text-xs text-gray-500 py-6">
        © 2025 Spartan App — Gestión Comercial Integrada
      </footer>
    </div>
  );
}

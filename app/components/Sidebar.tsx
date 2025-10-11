"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/crm/clientes", label: "Clientes" },
  { href: "/crm/leads", label: "Leads" },
  { href: "/crm/oportunidades", label: "Oportunidades" },
  { href: "/crm/actividades", label: "Actividades" },
  { href: "/crm/dashboard", label: "Dashboard" },
];

export default function Sidebar() {
  const path = usePathname();

  return (
    <aside className="bg-blue-50 border-r border-blue-100 w-52 h-screen fixed left-0 top-0 pt-20">
      <nav className="flex flex-col gap-2 px-3">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`p-2 rounded-md ${
              path === link.href
                ? "bg-blue-700 text-white"
                : "hover:bg-blue-100 text-blue-900"
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}

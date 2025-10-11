import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";

export default function CRMLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="ml-52 flex-1 bg-gray-50 p-6">{children}</main>
      </div>
    </div>
  );
}

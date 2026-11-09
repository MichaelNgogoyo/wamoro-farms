import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminPanelLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const user = await requireAdmin();
  return <div className="admin-shell"><AdminSidebar name={user.name} email={user.email} /><main className="admin-content">
    <header className="admin-topbar"><h1>Wamoro dashboard</h1><small>{user.role === "ADMIN" ? "Administrator" : "Editor"} · {user.email}</small></header>
    {children}
  </main></div>;
}

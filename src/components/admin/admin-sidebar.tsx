"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpenText, CalendarDays, ClipboardList, ImageIcon, LayoutDashboard, Leaf, Package, Settings2 } from "lucide-react";

const items = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
  { label: "Articles", href: "/admin/posts", icon: BookOpenText },
  { label: "Nursery products", href: "/admin/products", icon: Package },
  { label: "Gallery & media", href: "/admin/media", icon: ImageIcon },
  { label: "Training events", href: "/admin/events", icon: CalendarDays },
  { label: "Enquiries", href: "/admin/inquiries", icon: ClipboardList },
  { label: "Site settings", href: "/admin/settings", icon: Settings2 },
];

export function AdminSidebar({ name, email }: { name: string; email: string }) {
  const pathname = usePathname();
  return <aside className="admin-sidebar">
    <Link href="/" className="brand-lockup brand-lockup-light" aria-label="Wamoro Farms public website">
      <span className="brand-mark"><Leaf size={21} /></span><span className="brand-words"><strong>WAMORO</strong><small>FARMS</small></span>
    </Link>
    <p className="admin-label">Website management</p>
    <nav className="admin-nav" aria-label="Admin navigation">
      {items.map(({ label, href, icon: Icon }) => <Link href={href} key={href} aria-current={pathname === href ? "page" : undefined}>
        <Icon size={16} aria-hidden="true" />{label}
      </Link>)}
    </nav>
    <div className="admin-sidebar-bottom"><small>Signed in as <strong>{name || email}</strong></small><form action="/api/auth/logout" method="post"><button type="submit">Sign out</button></form></div>
  </aside>;
}

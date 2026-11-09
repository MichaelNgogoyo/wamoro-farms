import Link from "next/link";
import { redirect } from "next/navigation";
import { Leaf } from "lucide-react";
import { LoginForm } from "@/components/admin/login-form";
import { hasAdminSession } from "@/lib/auth";

export const metadata = { title: "Admin sign in | Wamoro Farms" };

export default async function AdminLoginPage() {
  if (await hasAdminSession()) redirect("/admin");
  return <main className="admin-login-page">
    <div className="admin-login-card">
      <Link href="/" className="brand-lockup"><span className="brand-mark"><Leaf size={21} /></span><span className="brand-words"><strong>WAMORO</strong><small>FARMS</small></span></Link>
      <span className="eyebrow">Secure workspace</span><h1>Welcome back.</h1><p>Sign in to manage Wamoro Farms content, nursery products, events and enquiries.</p>
      <LoginForm />
    </div>
  </main>;
}

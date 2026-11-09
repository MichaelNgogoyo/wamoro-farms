import Link from "next/link";
import { ArrowUpRight, BookOpenText, CalendarDays, ClipboardList, ImageIcon, Package } from "lucide-react";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Admin dashboard | Wamoro Farms" };

export default async function AdminDashboardPage() {
  let counts = { posts: 0, products: 0, events: 0, inquiries: 0, media: 0 };
  let connected = true;
  try {
    const [posts, products, events, bookings, messages, registrations, media] = await Promise.all([
      prisma.post.count(), prisma.product.count(), prisma.event.count(), prisma.consultationBooking.count({ where: { status: "NEW" } }),
      prisma.contactMessage.count({ where: { status: "NEW" } }), prisma.eventRegistration.count({ where: { status: "PENDING" } }), prisma.media.count(),
    ]);
    counts = { posts, products, events, inquiries: bookings + messages + registrations, media };
  } catch { connected = false; }
  return <>
    <div className="admin-main-heading"><div><span className="eyebrow">Overview</span><h2>Good day. Here is your farm desk.</h2><p>Manage what visitors see and keep track of incoming enquiries.</p></div><Link href="/" className="text-link">View public website <ArrowUpRight size={14} /></Link></div>
    {!connected && <div className="admin-note">Connect PostgreSQL and apply the database migrations to start managing live content. The public site currently shows its demonstration catalogue and guides.</div>}
    <div className="admin-stats">
      <div className="admin-stat"><div><small>Articles</small><strong>{counts.posts}</strong></div><BookOpenText size={18} /></div>
      <div className="admin-stat"><div><small>Nursery products</small><strong>{counts.products}</strong></div><Package size={18} /></div>
      <div className="admin-stat"><div><small>Training events</small><strong>{counts.events}</strong></div><CalendarDays size={18} /></div>
      <div className="admin-stat"><div><small>Open enquiries</small><strong>{counts.inquiries}</strong></div><ClipboardList size={18} /></div>
    </div>
    <div className="admin-two-col">
      <section className="admin-panel"><h3>Quick actions</h3><div className="admin-quick-links">
        <Link href="/admin/posts"><BookOpenText size={16} /> Write an article <ArrowUpRight size={14} /></Link>
        <Link href="/admin/products"><Package size={16} /> Update nursery stock <ArrowUpRight size={14} /></Link>
        <Link href="/admin/media"><ImageIcon size={16} /> Upload field photos <ArrowUpRight size={14} /></Link>
        <Link href="/admin/events"><CalendarDays size={16} /> Plan a masterclass <ArrowUpRight size={14} /></Link>
      </div></section>
      <section className="admin-panel"><h3>Keep this information current</h3><p>Review phone numbers and nursery locations before publishing a campaign. Business contact details are marked as pending owner verification in Site Settings.</p><p>M-Pesa collection remains disabled until a Till Number and integration credentials have been verified.</p><Link href="/admin/settings" className="text-link">Review site settings <ArrowUpRight size={14} /></Link></section>
    </div>
    <section className="admin-panel"><h3>Media library</h3><p>{counts.media ? `${counts.media} uploaded image${counts.media === 1 ? "" : "s"} in the media library.` : "Upload fieldwork, nursery and founder images to build out the public gallery."}</p></section>
  </>;
}

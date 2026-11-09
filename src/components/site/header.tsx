import Link from "next/link";
import { ArrowUpRight, Facebook, Instagram, Leaf, Music2, Youtube } from "lucide-react";
import { brand } from "@/lib/content";
import { getPublicSettings, getPublicSocialLinks } from "@/lib/queries";

const links = [
  ["About", "/about"],
  ["Services", "/services"],
  ["Nursery", "/nursery"],
  ["Gallery", "/gallery"],
  ["Insights", "/insights"],
  ["Training", "/training"],
] as const;

export async function Header() {
  const [settings, socials] = await Promise.all([getPublicSettings(), getPublicSocialLinks()]);
  const whatsapp = settings.whatsapp || brand.whatsapp;
  return (
    <header className="site-header">
      <div className="topline">
        <div className="container topline-inner">
          <span>Grounded in the field. Growing with purpose.</span>
          <div className="topline-actions">
            <div className="topline-socials" aria-label="Wamoro Farms social media">
              {socials.map((item) => <a key={item.label} href={item.href} target="_blank" rel="noreferrer" aria-label={item.label}>
                {item.platform === "instagram" ? <Instagram size={13} /> : item.platform === "facebook" ? <Facebook size={13} /> : item.platform === "youtube" ? <Youtube size={14} /> : <Music2 size={13} />}
              </a>)}
            </div>
            <a href={`https://wa.me/${whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer">
              Talk to our team <ArrowUpRight size={13} aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
      <div className="container nav-row">
        <Link href="/" className="brand-lockup" aria-label="Wamoro Farms home">
          <span className="brand-mark"><Leaf size={22} strokeWidth={1.7} aria-hidden="true" /></span>
          <span className="brand-words"><strong>WAMORO</strong><small>FARMS</small></span>
        </Link>
        <nav className="desktop-nav" aria-label="Main navigation">
          {links.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}
        </nav>
        <Link className="button button-dark nav-cta" href="/contact">Book a consultation <ArrowUpRight size={15} /></Link>
        <details className="mobile-menu">
          <summary aria-label="Open navigation"><span></span><span></span></summary>
          <nav aria-label="Mobile navigation">
            {links.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}
            <Link href="/contact">Book a consultation</Link>
          </nav>
        </details>
      </div>
    </header>
  );
}

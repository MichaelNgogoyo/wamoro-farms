import Link from "next/link";
import { ArrowUpRight, Leaf, MapPin, Phone } from "lucide-react";
import { brand } from "@/lib/content";
import { getPublicSettings, getPublicSocialLinks } from "@/lib/queries";

export async function Footer() {
  const [settings, socials] = await Promise.all([getPublicSettings(), getPublicSocialLinks()]);
  const whatsapp = settings.whatsapp || brand.whatsapp;
  return (
    <footer className="site-footer">
      <div className="container footer-main">
        <div className="footer-brand">
          <Link href="/" className="brand-lockup brand-lockup-light">
            <span className="brand-mark"><Leaf size={22} aria-hidden="true" /></span>
            <span className="brand-words"><strong>WAMORO</strong><small>FARMS</small></span>
          </Link>
          <p>Practical agronomy and thoughtful farm support for growers building for the long term.</p>
          <span className="footer-tagline">{brand.tagline}</span>
        </div>
        <div className="footer-column">
          <h2>Explore</h2>
          <Link href="/about">Our story</Link>
          <Link href="/services">Services</Link>
          <Link href="/nursery">Nursery</Link>
          <Link href="/gallery">Gallery</Link>
          <Link href="/insights">Farming insights</Link>
          <Link href="/training">Training</Link>
        </div>
        <div className="footer-column footer-contact">
          <h2>Get in touch</h2>
          <p><MapPin size={15} /> Nursery in Murang&apos;a & Nairobi</p>
          <p><Phone size={15} /> {settings.trainingPhone || brand.trainingPhone}</p>
          <a href={`https://wa.me/${whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer">
            WhatsApp our team <ArrowUpRight size={14} />
          </a>
          <div className="footer-socials" aria-label="Social media">
            {socials.map((social) => (
              <a key={social.label} href={social.href} target="_blank" rel="noreferrer" aria-label={social.label}>
                {social.platform === "instagram" ? "ig" : social.platform === "facebook" ? "f" : social.platform === "tiktok" ? "tk" : "yt"}
              </a>
            ))}
          </div>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} Wamoro Farms. All rights reserved.</span>
        <span>Expertise You Can Trust.</span>
      </div>
    </footer>
  );
}

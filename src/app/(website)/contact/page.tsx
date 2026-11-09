import { ArrowUpRight, MapPin, MessageCircle, Phone } from "lucide-react";
import { PageHero } from "@/components/site/page-hero";
import { InquiryForm } from "@/components/forms/inquiry-form";
import { brand } from "@/lib/content";
import { getPublicSettings } from "@/lib/queries";

export const metadata = { title: "Contact & Book a Consultation", description: "Talk to Wamoro Farms about agronomy advice, nursery seedlings or training." };

export default async function ContactPage() {
  const settings = await getPublicSettings();
  const whatsapp = settings.whatsapp || brand.whatsapp;
  return <>
    <PageHero eyebrow="Contact Wamoro Farms" title="Let’s talk about your farm." intro="Tell us what you are planning, growing or trying to solve. Our team will help you find a useful next step." />
    <section className="page-content"><div className="container form-layout">
      <aside>
        <div className="contact-details"><h2>Reach our team</h2><p>Choose the contact that best fits your enquiry. We will confirm location, availability and next steps with you.</p>
          <div className="contact-detail-row"><MessageCircle size={17} /><div><small>Primary WhatsApp</small><a href={`https://wa.me/${whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer">{whatsapp} <ArrowUpRight size={13} /></a></div></div>
          <div className="contact-detail-row"><Phone size={17} /><div><small>Training enquiries</small><strong>{settings.trainingPhone || brand.trainingPhone}</strong></div></div>
          <div className="contact-detail-row"><Phone size={17} /><div><small>Nursery enquiries</small><strong>{settings.nurseryPhones || brand.nurseryPhones.join(" / ")}</strong></div></div>
          <div className="contact-detail-row"><MapPin size={17} /><div><small>Training venue</small><strong>{settings.trainingVenue || brand.trainingVenue}</strong></div></div>
          <div className="contact-detail-row"><MapPin size={17} /><div><small>Nursery locations</small><strong>{settings.nurseryLocations || brand.nurseryLocations.join(" and ")}</strong></div></div>
          <div className="map-frame"><iframe title="Map showing Limuru near Nazareth Hospital" loading="lazy" referrerPolicy="no-referrer-when-downgrade" src="https://www.google.com/maps?q=Limuru%20opposite%20Nazareth%20Hospital%20Kenya&output=embed" /></div>
          <p className="form-note">Please contact us before travelling so we can confirm the right meeting point.</p>
        </div>
      </aside>
      <InquiryForm mode="consultation" />
    </div></section>
  </>;
}

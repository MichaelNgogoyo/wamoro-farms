import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PageHero } from "@/components/site/page-hero";
import { services } from "@/lib/content";

export const metadata = { title: "Agronomy Services", description: "Avocado consultancy, capsicum projects, farm management and training." };

export default function ServicesPage() {
  return (
    <>
      <PageHero eyebrow="What we offer" title="Good advice for the work ahead." intro="Practical agronomy and farm support, shaped around your project, your crop and the growing conditions on the ground." />
      <section className="page-content">
        <div className="container">
          <div className="section-heading"><span className="eyebrow">Wamoro services</span><h2>From a clear plan to stronger farm routines.</h2><p>Choose the support that fits your next step. We will start with a conversation about your farm and your goals.</p></div>
          <div className="service-list">
            {services.map((service) => <article className="service-list-item" key={service.number}><span>{service.number}</span><div><h2>{service.title}</h2><p>{service.text}</p></div></article>)}
          </div>
          <div className="contact-cta"><p>Have a project in mind? Tell us what you are growing.</p><Link href="/contact" className="button button-dark">Book a consultation <ArrowUpRight size={15} /></Link></div>
        </div>
      </section>
    </>
  );
}

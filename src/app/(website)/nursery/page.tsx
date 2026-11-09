import { ArrowUpRight, MapPin } from "lucide-react";
import { PageHero } from "@/components/site/page-hero";
import { NurseryCatalog } from "@/components/site/nursery-catalog";
import { brand } from "@/lib/content";
import { getPublicProducts } from "@/lib/queries";
import { siteUrl } from "@/lib/site-url";

export const metadata = { title: "Avocado Nursery", description: "Grafted Hass and Fuerte avocado seedlings from Wamoro Farms." };

export default async function NurseryPage() {
  const products = await getPublicProducts();
  const productData = products.map((product) => ({
    "@context": "https://schema.org", "@type": "Product", name: product.name, description: product.description,
    image: `${siteUrl}${product.image}`, sku: product.slug, category: product.category,
    offers: { "@type": "Offer", priceCurrency: "KES", ...(product.priceKes > 0 ? { price: product.priceKes } : {}), url: `${siteUrl}/nursery`, availability: `https://schema.org/${product.stockStatus === "OUT_OF_STOCK" ? "OutOfStock" : product.stockStatus === "LOW_STOCK" || product.stockStatus === "SEASONAL" ? "LimitedAvailability" : "InStock"}` },
  }));
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productData) }} />
      <PageHero eyebrow="Wamoro nursery" title="A healthy start for your orchard." intro="Browse our seedling catalogue and talk with the nursery team about variety, age and current availability." />
      <section className="page-content">
        <div className="container">
          <div className="section-heading"><span className="eyebrow">Plants for your farm</span><h2>Choose with care. Plant with confidence.</h2><p>We offer grafted avocado seedlings and seasonal produce. Our team can help with availability and practical planting questions.</p></div>
          <NurseryCatalog products={products} />
          <div className="contact-cta" style={{ marginTop: 48 }}>
            <p><MapPin size={16} style={{ display: "inline", verticalAlign: "-3px", marginRight: 7 }} /> Nursery locations in Murang&apos;a and Nairobi</p>
            <a className="button button-dark" href={`https://wa.me/${brand.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent("Hello Wamoro Farms, I would like to enquire about nursery stock and collection.")}`} target="_blank" rel="noreferrer">Enquire on WhatsApp <ArrowUpRight size={15} /></a>
          </div>
        </div>
      </section>
    </>
  );
}

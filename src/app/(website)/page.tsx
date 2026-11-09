import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Check, Leaf, Sprout } from "lucide-react";
import { ArticleCard } from "@/components/site/article-card";
import { ProductCard } from "@/components/site/product-card";
import { SectionHeading } from "@/components/site/section-heading";
import { brand, services } from "@/lib/content";
import { siteUrl } from "@/lib/site-url";
import { getPublicGallery, getPublicPosts, getPublicProducts, getPublicSettings, getPublicSocialLinks, getPublicVideos } from "@/lib/queries";
import { VideoWall } from "@/components/site/video-wall";

export default async function HomePage() {
  const [products, posts, settings, socials, videos, gallery] = await Promise.all([getPublicProducts(), getPublicPosts(), getPublicSettings(), getPublicSocialLinks(), getPublicVideos(), getPublicGallery()]);
  const featuredProducts = (settings.featuredProductSlug ? products.filter((item) => item.slug === settings.featuredProductSlug) : products.filter((item) => item.featured)).concat(products.filter((item) => !item.featured)).slice(0, 3);
  const featuredPosts = (settings.featuredPostSlug ? posts.filter((item) => item.slug === settings.featuredPostSlug) : posts.filter((item) => item.featured)).concat(posts.filter((item) => !item.featured)).slice(0, 3);
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "AgriculturalBusiness",
    name: brand.name,
    slogan: brand.tagline,
    url: siteUrl,
    description: "Practical agronomy, sustainable farming support, avocado expertise and nursery seedlings in Kenya.",
    areaServed: "Kenya",
    sameAs: brand.socials.map((item) => item.href),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <section className="home-hero">
        <div className="home-hero-photo"><Image src={settings.founderPortrait || "/images/farm/orchard-rows-aerial.jpg"} alt={settings.founderPortrait ? "Wamoro Farms founder in the field" : "Carefully managed rows of trees in a productive orchard"} fill loading="eager" fetchPriority="high" sizes="(max-width: 800px) 100vw, 56vw" /></div>
        <div className="container home-hero-inner">
          <div className="hero-copy">
            <span className="eyebrow eyebrow-light">Wamoro Farms · Kenya</span>
            <h1>{settings.homeHeroText || "Practical Agronomy. Sustainable Farming. Better Harvests."}</h1>
            <p>{settings.homeIntro || "Clear, field-ready support for growers building stronger avocado and capsicum projects."}</p>
            <div className="hero-actions">
              <Link href="/contact" className="button button-light">Book a consultation <ArrowUpRight size={15} /></Link>
              <Link href="/nursery" className="button button-outline">Explore the nursery <ArrowRight size={15} /></Link>
            </div>
            <div className="hero-note"><strong>Expertise You Can Trust.</strong><span>Grounded advice. Thoughtful growing.</span></div>
          </div>
        </div>
        <div className="hero-caption">Better farms start with sound decisions, made one field at a time.</div>
      </section>

      <section className="intro-strip" aria-label="How we work">
        <div className="container intro-strip-inner">
          <div className="intro-point"><span className="intro-point-num">01</span><div><strong>Rooted in practice</strong><span>Guidance shaped around real farm conditions</span></div></div>
          <div className="intro-point"><span className="intro-point-num">02</span><div><strong>Clear next steps</strong><span>Know what to do before you invest</span></div></div>
          <div className="intro-point"><span className="intro-point-num">03</span><div><strong>Built for the long term</strong><span>Better planning through each growing season</span></div></div>
        </div>
      </section>

      <section className="section">
        <div className="container two-column">
          <div className="photo-composition" aria-label="Aerial views of farm fields and avocado fruit">
            <div className="photo-main"><Image src="/images/farm/orchard-rows-aerial.jpg" alt="Aerial view of orderly tree rows in an orchard" fill sizes="(max-width: 800px) 90vw, 48vw" /></div>
            <div className="photo-small"><Image src="/images/avocados/hass-avocado-on-tree.jpg" alt="Hass avocado growing among green leaves" fill sizes="(max-width: 800px) 40vw, 22vw" /></div>
            <div className="photo-stamp"><Sprout size={18} /><span>Growing with care</span></div>
          </div>
          <div className="body-copy">
            <span className="eyebrow">The Wamoro approach</span>
            <h2>Good farming starts with practical knowledge.</h2>
            <p>Wamoro Farms brings agronomy advice closer to the decisions farmers make every day: what to plant, how to prepare, and how to care for a crop through the season.</p>
            <p>From avocado orchard planning to capsicum project support, we help growers turn questions into a clear plan of action.</p>
            <ul className="check-list">
              <li><Check size={16} /> Crop advice shaped around your farm goals</li>
              <li><Check size={16} /> Nursery seedlings with straightforward guidance</li>
              <li><Check size={16} /> Training designed for practical application</li>
            </ul>
            <Link href="/about" className="button button-dark">Get to know Wamoro <ArrowUpRight size={15} /></Link>
          </div>
        </div>
      </section>

      <section className="section section-soft">
        <div className="container">
          <SectionHeading eyebrow="What we do" title="Support for every stage of the growing journey." text="Thoughtful advice from the first farm plan through planting, crop care and harvest preparation." />
          <div className="service-grid">
            {services.slice(0, 4).map((service, index) => (
              <article className="service-card" key={service.number}>
                <span className="service-icon">{index === 0 ? <Leaf size={17} /> : index === 1 ? <Sprout size={17} /> : <span>{service.number.slice(1)}</span>}</span>
                <h3>{service.title}</h3><p>{service.text}</p>
              </article>
            ))}
          </div>
          <div className="service-grid-link"><Link className="text-link" href="/services">View all services <ArrowUpRight size={15} /></Link></div>
        </div>
      </section>

      <section className="section">
        <div className="container two-column">
          <div className="body-copy">
            <span className="eyebrow">Meet the Avocado Girl</span>
            <h2>A farmer’s journey grows through shared knowledge.</h2>
            <p>Wamoro Farms is shaped by a hands-on belief: strong agricultural knowledge should be practical, welcoming and useful in the field.</p>
            <p>Our founder works alongside growers through farm visits, training and clear conversations about what each crop needs. The aim is simple: help farmers feel more prepared to make the next decision.</p>
            <div className="founder-signoff">A local partner in your growing journey</div>
            <Link href="/about" className="button button-outline">Read our story <ArrowUpRight size={15} /></Link>
          </div>
          <div className="about-image-block">
            <Image src={settings.founderPortrait || "/images/avocados/hass-avocado-on-tree.jpg"} alt={settings.founderPortrait ? "Wamoro Farms founder" : "An avocado tree in fruit, representing the work Wamoro Farms supports"} fill sizes="(max-width: 800px) 90vw, 45vw" />
            <span>{settings.founderPortrait ? "WAMORO FARMS · FOUNDER" : "FIELD NOTES · KENYA"}</span>
          </div>
        </div>
      </section>

      <section className="section section-soft">
        <div className="container">
          <div className="section-topline">
            <SectionHeading eyebrow="From our nursery" title="Healthy starts for your next season." text="Explore grafted avocado seedlings and enquire with our team about current availability." />
            <Link className="text-link" href="/nursery">Visit the nursery <ArrowUpRight size={15} /></Link>
          </div>
          <div className="product-grid">{featuredProducts.map((product) => <ProductCard key={product.id} product={product} />)}</div>
        </div>
      </section>

      <section className="section gallery-teaser-section">
        <div className="container gallery-teaser">
          <div className="gallery-teaser-photo"><Image src={gallery[0]?.image || "/images/capsicum/green-capsicum-on-plant.jpg"} alt={gallery[0]?.alt || "Capsicum growing on a healthy plant"} fill sizes="(max-width: 800px) 100vw, 50vw" /></div>
          <div className="gallery-teaser-copy">
            <span className="eyebrow eyebrow-light">A look at the work</span>
            <h2>Every farm has a story in progress.</h2>
            <p>Explore growing spaces, crop details and the small moments of care behind a healthy harvest.</p>
            <Link href="/gallery" className="button button-outline">Explore the gallery <ArrowUpRight size={15} /></Link>
            <div className="gallery-mini-grid">
              {gallery.slice(0, 3).map((item) => <div key={item.id}><Image src={item.image} alt={item.alt} fill sizes="20vw" /></div>)}
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-topline">
            <SectionHeading eyebrow="Insights from the field" title="Useful notes for better growing." text="Straightforward guides for the questions that come up between planning and harvest." />
            <Link className="text-link" href="/insights">All insights <ArrowUpRight size={15} /></Link>
          </div>
          <div className="article-grid">{featuredPosts.map((post) => <ArticleCard key={post.id} post={post} />)}</div>
        </div>
      </section>

      <section className="section section-soft">
        <div className="container training-card">
          <div><span className="eyebrow">Learn in the field</span><h2>Good knowledge should travel from the classroom to the farm.</h2><p>Join a practical Wamoro Farms masterclass and take home useful steps for the work ahead.</p></div>
          <Link href="/training" className="button button-dark">See upcoming training <ArrowUpRight size={15} /></Link>
        </div>
      </section>

      <section className="social-band">
        <div className="container social-band-inner">
          <div><span className="eyebrow">Follow the farm</span><h2>Keep growing with us.</h2></div>
          <div className="social-links">
            {socials.map((item) => <a className="social-link" key={item.label} href={item.href} target="_blank" rel="noreferrer"><span className="social-monogram">{item.platform === "instagram" ? "ig" : item.platform === "facebook" ? "f" : item.platform === "tiktok" ? "tk" : "yt"}</span>{item.label}<ArrowUpRight size={13} /></a>)}
          </div>
        </div>
      </section>
      {videos.length > 0 && <section className="section section-soft"><div className="container"><SectionHeading eyebrow="Watch from the farm" title="Small lessons, shared openly." text="Farm updates and public videos from Wamoro Farms." /><VideoWall videos={videos} /></div></section>}
    </>
  );
}

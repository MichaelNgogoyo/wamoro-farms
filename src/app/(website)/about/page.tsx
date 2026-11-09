import Image from "next/image";
import { Check, Leaf } from "lucide-react";
import { PageHero } from "@/components/site/page-hero";
import { SectionHeading } from "@/components/site/section-heading";
import { getSiteSettings } from "@/lib/queries";

export const metadata = { title: "About Wamoro Farms", description: "Meet the people and practical values behind Wamoro Farms." };

export default async function AboutPage() {
  const settings = await getSiteSettings();
  const founderImage = settings.founderPortrait || "/images/avocados/hass-avocado-on-tree.jpg";
  return (
    <>
      <PageHero eyebrow="About Wamoro Farms" title="Rooted in knowledge. Growing with purpose." intro="We bring practical agronomy and thoughtful farm support closer to the people growing Kenya's next harvest." />
      <section className="page-content">
        <div className="container two-column">
          <div className="about-image-block"><Image src={founderImage} alt={settings.founderPortrait ? "Wamoro Farms founder" : "Avocado fruit growing on a tree"} fill sizes="(max-width: 800px) 90vw, 45vw" /><span>{settings.founderPortrait ? "WAMORO FARMS · FOUNDER" : "FIELD NOTES · KENYA"}</span></div>
          <div className="body-copy">
            <span className="eyebrow">Meet the Avocado Girl</span>
            <h2>Practical knowledge belongs in the field.</h2>
            <p>Wamoro Farms exists to make good agricultural guidance easier to access and easier to use. We work with growers who want to understand their crop, prepare well and make the next farm decision with confidence.</p>
            <p>Our work brings together avocado expertise, capsicum project support, farm management and hands-on learning. Every farm begins in its own conditions, so the advice starts with listening and looking closely.</p>
            <p>From nursery enquiries to field visits and masterclasses, we share what helps growers move forward in a thoughtful, sustainable way.</p>
            <div className="founder-signoff">Expertise You Can Trust.</div>
          </div>
        </div>
      </section>
      <section className="values-band">
        <div className="container">
          <SectionHeading eyebrow="What guides us" title="A steady hand through every season." text="Our values shape the way we share knowledge, make recommendations and work alongside growers." />
          <div className="value-grid-large">
            <article className="value-card"><span className="service-number">01 · MISSION</span><h3>Equip growers to make sound decisions.</h3><p>Share practical, crop-aware knowledge that farmers can put to work.</p></article>
            <article className="value-card"><span className="service-number">02 · VISION</span><h3>More confident, resilient farms.</h3><p>Support thoughtful agriculture that can grow with people and place.</p></article>
            <article className="value-card"><span className="service-number">03 · VALUES</span><h3>Clarity, care and integrity.</h3><p>Listen first, speak plainly and respect the land and the people who work it.</p></article>
          </div>
        </div>
      </section>
      <section className="section">
        <div className="container two-column">
          <div className="body-copy">
            <span className="eyebrow">In the community</span>
            <h2>Learning grows when farmers learn together.</h2>
            <p>Wamoro Farms creates room for growers to ask questions, compare experience and take practical skills back to their own projects.</p>
            <ul className="check-list">
              <li><Check size={16} /> Farm visits and hands-on training</li>
              <li><Check size={16} /> Crop conversations for new and experienced growers</li>
              <li><Check size={16} /> Shared learning through public media and social channels</li>
            </ul>
          </div>
          <div className="photo-composition">
            <div className="photo-main"><Image src="/images/capsicum/green-capsicum-on-plant.jpg" alt="Capsicum crop being raised with care" fill sizes="(max-width: 800px) 90vw, 48vw" /></div>
            <div className="photo-small"><Image src="/images/nursery/chilli-seedlings-in-pots.jpg" alt="Young crop seedlings in a nursery" fill sizes="(max-width: 800px) 40vw, 22vw" /></div>
            <div className="photo-stamp"><Leaf size={17} /><span>Local knowledge</span></div>
          </div>
        </div>
      </section>
    </>
  );
}

import { PageHero } from "@/components/site/page-hero";
import { GalleryGrid } from "@/components/site/gallery-grid";
import { getPublicGallery } from "@/lib/queries";

export const metadata = { title: "Farm Gallery", description: "A look at farm visits, nursery work, crop growing and training with Wamoro Farms." };

export default async function GalleryPage() {
  const items = await getPublicGallery();
  return <><PageHero eyebrow="From the field" title="The work, the crops, the growing." intro="A changing collection of moments from the farm, the nursery and the learning that happens along the way." />
    <section className="page-content"><div className="container"><div className="section-heading"><span className="eyebrow">Wamoro in pictures</span><h2>Small details. Bigger growing stories.</h2><p>Browse the gallery by crop and activity. Select a photo to view it larger.</p></div><GalleryGrid items={items} /></div></section></>;
}

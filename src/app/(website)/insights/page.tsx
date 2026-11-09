import { PageHero } from "@/components/site/page-hero";
import { InsightsList } from "@/components/site/insights-list";
import { getPublicPosts } from "@/lib/queries";

export const metadata = { title: "Farming Insights", description: "Field notes and practical growing guides from Wamoro Farms." };

export default async function InsightsPage() {
  const posts = await getPublicPosts();
  return <><PageHero eyebrow="Insights & guides" title="Practical knowledge for the next growing season." intro="Useful ideas and crop notes to help you plan, plant and care for your farm with more confidence." />
    <section className="page-content"><div className="container"><div className="section-heading"><span className="eyebrow">Read & grow</span><h2>Notes you can take back to the farm.</h2></div><InsightsList posts={posts} /></div></section></>;
}

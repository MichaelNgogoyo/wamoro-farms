export const brand = {
  name: "Wamoro Farms",
  tagline: "Expertise You Can Trust.",
  whatsapp: "+254743222895",
  trainingPhone: "0757 520 551",
  nurseryPhones: ["0790 509 684", "0724 559 286"],
  trainingVenue: "Limuru, opposite Nazareth Hospital",
  nurseryLocations: ["Murang'a", "Nairobi"],
  socials: [
    { label: "Instagram", href: "https://www.instagram.com/wamoro_farms/" },
    { label: "Facebook", href: "https://www.facebook.com/myree.carlvinder/" },
    { label: "TikTok", href: "https://www.tiktok.com/@wamoro_farms" },
  ],
};

export type ProductCardData = {
  id: string;
  name: string;
  slug: string;
  description: string;
  priceKes: number;
  ageLabel: string;
  stockStatus: "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK" | "SEASONAL";
  category: string;
  image: string;
  imageAlt: string;
  featured: boolean;
};

export const starterProducts: ProductCardData[] = [
  {
    id: "hass-seedling",
    name: "Grafted Hass Avocado",
    slug: "grafted-hass-avocado",
    description: "A carefully grafted Hass seedling, selected for healthy growth and supported with practical planting guidance.",
    priceKes: 250,
    ageLabel: "Nursery grown",
    stockStatus: "IN_STOCK",
    category: "Avocado seedlings",
    image: "/images/avocados/hass-avocado-on-tree.jpg",
    imageAlt: "Young Hass avocados growing on a tree",
    featured: true,
  },
  {
    id: "fuerte-young",
    name: "Grafted Fuerte Avocado",
    slug: "grafted-fuerte-avocado-young",
    description: "A younger Fuerte graft for growers preparing an orchard with a suitable pollination plan.",
    priceKes: 150,
    ageLabel: "2–3 months",
    stockStatus: "IN_STOCK",
    category: "Avocado seedlings",
    image: "/images/avocados/avocado-seedling.jpg",
    imageAlt: "A young avocado seedling growing in a pot",
    featured: false,
  },
  {
    id: "fuerte-mature",
    name: "Grafted Fuerte Avocado",
    slug: "grafted-fuerte-avocado-mature",
    description: "An established Fuerte seedling ready for the next stage of orchard establishment.",
    priceKes: 250,
    ageLabel: "8–9 months",
    stockStatus: "LOW_STOCK",
    category: "Avocado seedlings",
    image: "/images/avocados/avocado-seedling.jpg",
    imageAlt: "Avocado fruit growing in a healthy orchard",
    featured: true,
  },
  {
    id: "capsicum-advisory",
    name: "Capsicum Starter Pack",
    slug: "capsicum-starter-pack",
    description: "Seasonal seedling availability is confirmed by the nursery team before ordering.",
    priceKes: 0,
    ageLabel: "Seasonal availability",
    stockStatus: "SEASONAL",
    category: "Seasonal produce",
    image: "/images/capsicum/green-capsicum-on-plant.jpg",
    imageAlt: "Green capsicum growing on the plant",
    featured: false,
  },
];

export type ArticleCardData = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  date: string;
  category: string;
  cover: string;
  readingTime: string;
  featured?: boolean;
  seoTitle?: string | null;
  seoDescription?: string | null;
  content: string;
};

export const starterPosts: ArticleCardData[] = [
  {
    id: "orchard-site-checklist",
    title: "Before you plant an avocado orchard, start with the site",
    slug: "avocado-orchard-site-checklist",
    excerpt: "A practical look at drainage, wind, water and planning before the first seedling goes into the ground.",
    date: "2026-10-28",
    category: "Avocado farming",
    cover: "/images/farm/orchard-rows-aerial.jpg",
    readingTime: "5 min read",
    featured: true,
    content: `<p>A productive orchard begins with a careful look at the land. Before buying seedlings, walk the site after rain, note where water stands and where it runs, and look for signs of erosion.</p><h2>Check drainage and water</h2><p>Avocado roots need moisture, but they do not tolerate waterlogged soil. Observe the site across the season and plan reliable water access before planting. A simple soil assessment can help identify constraints early.</p><h2>Plan for wind and access</h2><p>Young trees benefit from wind protection. Think about windbreaks, vehicle access and the space needed to inspect and manage each tree as the orchard matures.</p><h2>Choose planting material carefully</h2><p>Buy clearly labelled grafted seedlings from a dependable nursery. Ask about variety, rootstock and age, and keep the planting material protected until it is ready for the field.</p><p>Good planning does not remove every risk, but it gives each seedling a stronger start. Wamoro Farms offers practical site and orchard advisory for growers at every stage.</p>`,
  },
  {
    id: "capsicum-water-management",
    title: "A steadier approach to capsicum water management",
    slug: "capsicum-water-management",
    excerpt: "Use the crop, soil and weather to guide irrigation decisions through flowering and fruit set.",
    date: "2026-10-12",
    category: "Capsicum",
    cover: "/images/capsicum/green-capsicum-on-plant.jpg",
    readingTime: "4 min read",
    content: `<p>Capsicum plants respond poorly to sharp swings between very dry and very wet soil. A consistent irrigation plan supports steady growth, flowering and fruit development.</p><h2>Observe the root zone</h2><p>Check moisture below the surface rather than judging from the topsoil alone. Sandy and heavier soils hold water differently, so irrigation intervals should fit the field and the crop stage.</p><h2>Keep records</h2><p>Note irrigation dates, rainfall and crop response. Simple records make it easier to adjust before stress affects flowering or fruit quality.</p><p>For a new greenhouse or field project, get the water source and soil assessed before investing in equipment.</p>`,
  },
  {
    id: "seedling-transplanting",
    title: "How to prepare seedlings for a confident transplant",
    slug: "prepare-seedlings-for-transplanting",
    excerpt: "A few careful checks help seedlings settle into the field with less avoidable stress.",
    date: "2026-09-20",
    category: "Nursery notes",
    cover: "/images/nursery/chilli-seedlings-in-pots.jpg",
    readingTime: "3 min read",
    content: `<p>Strong planting material still needs a good start in the field. Prepare the land, planting holes and water plan before moving seedlings from the nursery.</p><h2>Inspect before planting</h2><p>Look for healthy leaves, a firm stem and a root ball that holds together. Avoid leaving seedlings in the sun or wind while you prepare the field.</p><h2>Plant at the right depth</h2><p>Set the root ball at a similar level to how it sat in its container. Water after planting and monitor regularly as roots establish.</p><p>Ask the nursery for crop-specific planting advice, especially for grafted fruit seedlings.</p>`,
  },
];

export const galleryItems = [
  { id: "orchard", title: "Orchard planning", category: "Farm Visits", image: "/images/farm/orchard-rows-aerial.jpg", alt: "Orderly rows of trees viewed from above" },
  { id: "hass", title: "Hass on the tree", category: "Avocados", image: "/images/avocados/hass-avocado-on-tree.jpg", alt: "Hass avocado fruit growing on a branch" },
  { id: "capsicum", title: "Capsicum crop", category: "Fieldwork", image: "/images/capsicum/green-capsicum-on-plant.jpg", alt: "Green capsicum growing in leafy foliage" },
  { id: "nursery", title: "Seedlings in the nursery", category: "Nursery", image: "/images/nursery/chilli-seedlings-in-pots.jpg", alt: "Young seedlings growing in nursery pots" },
  { id: "field", title: "Growing with care", category: "Training", image: "/images/farm/orchard-rows-aerial.jpg", alt: "Aerial view across managed crop rows" },
  { id: "harvest", title: "Quality starts in the field", category: "Processing", image: "/images/avocados/hass-avocado-on-tree.jpg", alt: "Fresh avocado fruit among green leaves" },
];

export const services = [
  { number: "01", title: "Avocado consultancy", text: "Variety selection, orchard establishment, pruning and practical crop planning for your site." },
  { number: "02", title: "Capsicum projects", text: "Support with project planning, crop schedules, greenhouse routines and farm records." },
  { number: "03", title: "Soil & crop nutrition", text: "Soil diagnostics and nutrition guidance shaped around the crop and growing conditions." },
  { number: "04", title: "Farm setup & management", text: "Turn a farm idea into a clear setup plan with support through the growing season." },
  { number: "05", title: "Greenhouse advisory", text: "Practical input on greenhouse preparation, crop flow and routine management." },
  { number: "06", title: "Training & masterclasses", text: "Hands-on learning sessions for growers who want practical, field-ready skills." },
  { number: "07", title: "Market linkage advisory", text: "Plan quality, post-harvest handling and market conversations with your farm goals in mind." },
];

export const upcomingEvents = [
  {
    id: "avocado-orchard-masterclass",
    title: "Avocado Orchard Establishment Masterclass",
    summary: "A practical day on planning, planting, early orchard care and the decisions that shape a young avocado farm.",
    startsAt: new Date("2027-02-13T09:00:00+03:00"),
    location: "Limuru",
    venue: "Opposite Nazareth Hospital",
    feeKes: 2500,
    capacity: 30,
    status: "UPCOMING",
  },
];

export const initialSettings = {
  whatsapp: brand.whatsapp,
  trainingPhone: brand.trainingPhone,
  nurseryPhones: brand.nurseryPhones.join(" / "),
  trainingVenue: brand.trainingVenue,
  nurseryLocations: brand.nurseryLocations.join(" and "),
  youtubeChannelUrl: "",
  siteTitle: "Wamoro Farms | Expertise You Can Trust",
  siteDescription: "Practical agronomy, sustainable farming support and quality avocado seedlings in Kenya.",
  ownerVerification: "Pending business-owner verification",
  mpesaEnabled: false,
  founderPortrait: "",
  homeHeroText: "",
  homeIntro: "",
  featuredProductSlug: "",
  featuredPostSlug: "",
};

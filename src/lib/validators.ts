import { z } from "zod";

export const emailSchema = z.email().max(254).transform((value) => value.trim().toLowerCase());
const nameSchema = z.string().trim().min(2).max(100);
const phoneSchema = z.string().trim().min(7).max(32);
const messageSchema = z.string().trim().min(10).max(3000);

export const loginSchema = z.object({ email: emailSchema, password: z.string().min(1).max(200) });

export const contactSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  phone: phoneSchema.optional().default(""),
  subject: z.string().trim().max(120).optional().default(""),
  message: messageSchema,
  website: z.string().max(300).optional().default(""),
});

export const bookingSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  service: z.string().trim().min(2).max(120),
  preferredDate: z.string().optional().default(""),
  message: messageSchema,
  website: z.string().max(300).optional().default(""),
});

export const registrationSchema = z.object({
  eventId: z.string().min(1).max(32),
  name: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  notes: z.string().trim().max(1000).optional().default(""),
  website: z.string().max(300).optional().default(""),
});

export const slugSchema = z.string().trim().min(2).max(100).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
export const postInputSchema = z.object({
  title: z.string().trim().min(3).max(180),
  slug: slugSchema,
  excerpt: z.string().trim().min(10).max(400),
  content: z.string().min(20).max(100_000),
  status: z.enum(["DRAFT", "SCHEDULED", "PUBLISHED"]),
  featured: z.boolean().default(false),
  category: z.string().trim().min(2).max(60).default("Farm notes"),
  scheduledAt: z.string().optional().nullable(),
  coverMediaId: z.string().optional().nullable(),
  seoTitle: z.string().trim().max(180).optional().nullable(),
  seoDescription: z.string().trim().max(320).optional().nullable(),
}).refine((data) => data.status !== "SCHEDULED" || Boolean(data.scheduledAt), {
  path: ["scheduledAt"],
  message: "Choose a date and time for a scheduled article.",
});

export const productInputSchema = z.object({
  name: z.string().trim().min(3).max(140),
  slug: slugSchema,
  description: z.string().trim().min(10).max(3000),
  priceKes: z.coerce.number().int().min(0).max(10_000_000),
  ageLabel: z.string().trim().max(80).default(""),
  stockStatus: z.enum(["IN_STOCK", "LOW_STOCK", "OUT_OF_STOCK", "SEASONAL"]),
  stockQuantity: z.union([z.coerce.number().int().min(0).max(1_000_000), z.null()]).optional().default(null),
  category: z.string().trim().min(2).max(60).default("Avocado seedlings"),
  mediaId: z.string().optional().nullable(),
  featured: z.boolean().default(false),
  published: z.boolean().default(true),
});

export const eventInputSchema = z.object({
  title: z.string().trim().min(3).max(180),
  slug: slugSchema,
  summary: z.string().trim().min(10).max(400),
  description: z.string().trim().min(10).max(10_000),
  startsAt: z.iso.datetime({ offset: true }),
  endsAt: z.iso.datetime({ offset: true }).optional().nullable(),
  location: z.string().trim().min(2).max(120),
  venue: z.string().trim().max(160).default(""),
  capacity: z.union([z.coerce.number().int().min(1).max(100_000), z.null()]).optional().default(null),
  feeKes: z.coerce.number().int().min(0).max(10_000_000).default(0),
  status: z.enum(["DRAFT", "UPCOMING", "COMPLETED", "CANCELLED"]),
  featured: z.boolean().default(false),
});

export const settingsSchema = z.object({
  whatsapp: z.string().trim().min(7).max(32),
  trainingPhone: z.string().trim().min(7).max(32),
  nurseryPhones: z.string().trim().min(7).max(80),
  trainingVenue: z.string().trim().min(4).max(160),
  nurseryLocations: z.string().trim().min(3).max(160),
  youtubeChannelUrl: z.string().trim().max(300).default(""),
  siteTitle: z.string().trim().min(3).max(180),
  siteDescription: z.string().trim().min(10).max(320),
  ownerVerification: z.string().trim().max(200).default("Pending business-owner verification"),
  mpesaEnabled: z.literal(false).default(false),
  founderPortrait: z.string().trim().max(300).default(""),
  homeHeroText: z.string().trim().max(400).default(""),
  homeIntro: z.string().trim().max(1000).default(""),
  featuredProductSlug: z.string().trim().max(100).default(""),
  featuredPostSlug: z.string().trim().max(100).default(""),
});

export const mediaUpdateSchema = z.object({
  altText: z.string().trim().max(300).optional(),
  caption: z.string().trim().max(300).optional(),
  category: z.enum(["founder", "farm", "avocados", "capsicum", "nursery", "gallery", "Farm Visits", "Nursery", "Avocados", "Training", "Processing", "Community", "Fieldwork"]).optional(),
  featured: z.boolean().optional(),
  isPublic: z.boolean().optional(),
  sortOrder: z.coerce.number().int().min(0).max(1_000_000).optional(),
});

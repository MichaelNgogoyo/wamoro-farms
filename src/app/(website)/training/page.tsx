import { CalendarDays, MapPin, Users } from "lucide-react";
import { PageHero } from "@/components/site/page-hero";
import { RegistrationForm } from "@/components/forms/registration-form";
import { brand } from "@/lib/content";
import { getPublicEvents, getPublicSettings, getPublicVideos } from "@/lib/queries";
import { VideoWall } from "@/components/site/video-wall";

export const metadata = { title: "Training & Masterclasses", description: "Practical agriculture training and masterclasses with Wamoro Farms in Limuru." };

export default async function TrainingPage() {
  const [events, settings, videos] = await Promise.all([getPublicEvents(), getPublicSettings(), getPublicVideos()]);
  return <>
    <PageHero eyebrow="Training & masterclasses" title="Learn skills you can put to work." intro="Field-ready sessions for growers who want clearer crop knowledge, useful routines and confidence in the next farm decision." />
    <section className="page-content"><div className="container">
      <div className="section-heading"><span className="eyebrow">Upcoming learning</span><h2>Practical learning, shared in the field.</h2><p>Session dates, capacity and fees are set by the Wamoro team. Register your interest and we will confirm the details with you.</p></div>
      {events.length ? <div className="event-grid">{events.map((event) => {
        const startsAt = new Date(event.startsAt);
        return <article className="event-card" key={event.id}>
          <div className="event-date-box"><strong>{new Intl.DateTimeFormat("en-KE", { day: "2-digit", month: "short" }).format(startsAt)}</strong><span>{new Intl.DateTimeFormat("en-KE", { year: "numeric" }).format(startsAt)}</span></div>
          <h3>{event.title}</h3><p>{event.summary}</p>
          <div className="event-facts"><span><CalendarDays size={14} /> {new Intl.DateTimeFormat("en-KE", { hour: "numeric", minute: "2-digit" }).format(startsAt)}</span><span><MapPin size={14} /> {event.location}{event.venue ? ` · ${event.venue}` : ""}</span><span><Users size={14} /> {event.capacity ? `${event.capacity} places` : "Ask about places"}</span></div>
          <details className="registration-details"><summary className="button button-dark">Register interest</summary><div className="registration-form-wrap"><RegistrationForm eventId={event.id} eventTitle={event.title} /></div></details>
          <p className="event-fee">{event.feeKes > 0 ? `KSh ${event.feeKes.toLocaleString("en-KE")}` : "Contact us for fee details"} · Payment details confirmed after registration</p>
        </article>;
      })}</div> : <div className="empty-state">No new masterclasses have been announced. Contact the team to hear about the next date.</div>}
      <div className="event-note"><strong>Training venue:</strong> {settings.trainingVenue || brand.trainingVenue}. <strong>Training line:</strong> {settings.trainingPhone || brand.trainingPhone}. M-Pesa payment collection is not active; do not send payment before a training coordinator confirms arrangements.</div>
    </div></section>
    {videos.length > 0 && <section className="section section-soft"><div className="container"><div className="section-heading"><span className="eyebrow">Watch & learn</span><h2>More from Wamoro Farms.</h2><p>Public videos and farm updates shared by our team.</p></div><VideoWall videos={videos} /></div></section>}
  </>;
}

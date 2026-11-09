import { ArrowUpRight, Play } from "lucide-react";

export type VideoCardData = { id: string; platform: string; url: string; title: string; caption: string };

function embedTarget(item: VideoCardData) {
  try {
    const url = new URL(item.url);
    if (item.platform === "youtube" && ["youtube.com", "www.youtube.com", "youtu.be"].includes(url.hostname)) {
      const id = url.hostname === "youtu.be" ? url.pathname.slice(1) : url.searchParams.get("v") || url.pathname.split("/").filter(Boolean).at(-1);
      if (id && /^[\w-]{6,20}$/.test(id)) return { src: `https://www.youtube-nocookie.com/embed/${id}`, label: "YouTube video" };
    }
    if (item.platform === "tiktok" && ["tiktok.com", "www.tiktok.com"].includes(url.hostname)) {
      const id = url.pathname.split("/").filter(Boolean).at(-1);
      if (id && /^\d{8,}$/.test(id)) return { src: `https://www.tiktok.com/player/v1/${id}`, label: "TikTok video" };
    }
    if (item.platform === "instagram" && ["instagram.com", "www.instagram.com"].includes(url.hostname)) {
      const path = url.pathname.match(/^\/(?:p|reel|reels)\/([A-Za-z0-9_-]+)\/?$/);
      if (path) return { src: `https://www.instagram.com/p/${path[1]}/embed`, label: "Instagram post" };
    }
    if (item.platform === "facebook" && ["facebook.com", "www.facebook.com"].includes(url.hostname)) {
      return { src: `https://www.facebook.com/plugins/post.php?href=${encodeURIComponent(item.url)}&show_text=true&width=500`, label: "Facebook post" };
    }
  } catch { /* show the original public link as the fallback */ }
  return null;
}

export function VideoWall({ videos }: { videos: VideoCardData[] }) {
  if (!videos.length) return null;
  return <div className="video-grid">{videos.map((video) => {
    const embed = embedTarget(video);
    return <article className="video-card" key={video.id}>
      <div className="video-frame">{embed ? <><iframe src={embed.src} title={video.title || embed.label} loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen /><a className="video-open-original" href={video.url} target="_blank" rel="noreferrer">Open original <ArrowUpRight size={13}/></a></> : <a href={video.url} target="_blank" rel="noreferrer" className="video-fallback"><span><Play size={20} fill="currentColor" /></span><strong>Watch on {video.platform}</strong></a>}</div>
      <div className="video-caption"><h3>{video.title}</h3><p>{video.caption}</p></div>
    </article>;
  })}</div>;
}

"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { ArrowUpRight, Pencil, Trash2 } from "lucide-react";
import { RichTextEditor } from "@/components/admin/rich-text-editor";

type PostRow = {
  id: string; title: string; slug: string; excerpt: string; content: string; status: "DRAFT" | "SCHEDULED" | "PUBLISHED";
  featured: boolean; scheduledAt: string | null; publishedAt: string | null; seoTitle: string | null; seoDescription: string | null;
  coverMediaId: string | null; updatedAt: string; categories?: Array<{ category: { name: string } }>;
};
type MediaOption = { id: string; filename: string; caption: string; category: string };
type PostFormState = { title: string; slug: string; excerpt: string; content: string; status: PostRow["status"]; featured: boolean; category: string; scheduledAt: string; coverMediaId: string; seoTitle: string; seoDescription: string };
const blank: PostFormState = { title: "", slug: "", excerpt: "", content: "<p></p>", status: "DRAFT", featured: false, category: "Farm notes", scheduledAt: "", coverMediaId: "", seoTitle: "", seoDescription: "" };

function slugify(value: string) { return value.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 100); }
function localDate(value: string | null) { if (!value) return ""; const date = new Date(value); return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16); }

export function PostsManager() {
  const [posts, setPosts] = useState<PostRow[]>([]);
  const [media, setMedia] = useState<MediaOption[]>([]);
  const [form, setForm] = useState<PostFormState>(blank);
  const [editing, setEditing] = useState<string | null>(null);
  const [slugTouched, setSlugTouched] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function reload() {
    try {
      const [postResponse, mediaResponse] = await Promise.all([fetch("/api/admin/posts"), fetch("/api/admin/media")]);
      const postData = await postResponse.json(); const mediaData = await mediaResponse.json();
      if (!postResponse.ok) throw new Error(postData.error || "Could not load articles.");
      setPosts(postData.posts || []); setMedia((mediaData.media || []).filter((item: { isPublic: boolean }) => item.isPublic));
      if (!mediaResponse.ok) setError(mediaData.error || "The media list is unavailable.");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not load articles."); }
    finally { setLoading(false); }
  }
  // eslint-disable-next-line react-hooks/set-state-in-effect -- API state updates happen after reload awaits the response.
  useEffect(() => { void reload(); }, []);
  function change<K extends keyof PostFormState>(key: K, value: PostFormState[K]) { setForm((current) => ({ ...current, [key]: value })); }
  function edit(post: PostRow) {
    setEditing(post.id); setSlugTouched(true);
    setForm({ title: post.title, slug: post.slug, excerpt: post.excerpt, content: post.content, status: post.status, featured: post.featured, category: post.categories?.[0]?.category.name || "Farm notes", scheduledAt: localDate(post.scheduledAt), coverMediaId: post.coverMediaId || "", seoTitle: post.seoTitle || "", seoDescription: post.seoDescription || "" });
    setError(""); setNotice(""); window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function reset() { setEditing(null); setForm(blank); setSlugTouched(false); setError(""); setNotice(""); }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(""); setNotice("");
    const payload = { ...form, scheduledAt: form.status === "SCHEDULED" && form.scheduledAt ? new Date(form.scheduledAt).toISOString() : null, coverMediaId: form.coverMediaId || null };
    try {
      const response = await fetch(editing ? `/api/admin/posts/${editing}` : "/api/admin/posts", { method: editing ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const result = await response.json(); if (!response.ok) throw new Error(result.error || "Could not save article.");
      setNotice(editing ? "Article updated." : "Article saved."); reset(); await reload();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not save article."); }
    finally { setBusy(false); }
  }
  async function remove(post: PostRow) {
    if (!window.confirm(`Delete “${post.title}”? This cannot be undone.`)) return;
    const response = await fetch(`/api/admin/posts/${post.id}`, { method: "DELETE" });
    if (!response.ok) { const result = await response.json(); setError(result.error || "Could not delete article."); return; }
    setNotice("Article deleted."); if (editing === post.id) reset(); await reload();
  }
  return <>
    <div className="admin-main-heading"><div><span className="eyebrow">Insights & blog</span><h2>Article library</h2><p>Create clear, search-friendly guides and stories for growers.</p></div><Link href="/insights" className="text-link" target="_blank">View insights <ArrowUpRight size={14} /></Link></div>
    {notice && <div role="status" className="admin-toast">{notice}</div>}{error && <div role="alert" className="form-message form-message-error">{error}</div>}
    <section className="admin-panel">
      <h3>{editing ? "Edit article" : "Write a new article"}</h3>
      <form onSubmit={submit}>
        <div className="admin-form-grid">
          <div className="field"><label htmlFor="post-title">Title *</label><input id="post-title" value={form.title} onChange={(e) => { change("title", e.target.value); if (!slugTouched) change("slug", slugify(e.target.value)); }} required minLength={3} maxLength={180} /></div>
          <div className="field"><label htmlFor="post-slug">URL slug *</label><input id="post-slug" value={form.slug} onChange={(e) => { setSlugTouched(true); change("slug", slugify(e.target.value)); }} required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" /></div>
          <div className="field field-full"><label htmlFor="post-excerpt">Short summary *</label><textarea id="post-excerpt" value={form.excerpt} onChange={(e) => change("excerpt", e.target.value)} required minLength={10} maxLength={400} /></div>
          <div className="field"><label htmlFor="post-category">Category</label><input id="post-category" value={form.category} onChange={(e) => change("category", e.target.value)} maxLength={60} /></div>
          <div className="field"><label htmlFor="post-cover">Cover image</label><select id="post-cover" value={form.coverMediaId} onChange={(e) => change("coverMediaId", e.target.value)}><option value="">Use the default farm image</option>{media.map((item) => <option key={item.id} value={item.id}>{item.caption || item.filename} · {item.category}</option>)}</select></div>
          <div className="field"><label htmlFor="post-status">Publishing status</label><select id="post-status" value={form.status} onChange={(e) => change("status", e.target.value as PostFormState["status"])}><option value="DRAFT">Save draft</option><option value="PUBLISHED">Publish now</option><option value="SCHEDULED">Schedule</option></select></div>
          {form.status === "SCHEDULED" && <div className="field"><label htmlFor="post-schedule">Publish at</label><input id="post-schedule" type="datetime-local" value={form.scheduledAt} onChange={(e) => change("scheduledAt", e.target.value)} required /></div>}
          <div className="field"><label htmlFor="post-seo-title">SEO title</label><input id="post-seo-title" value={form.seoTitle} onChange={(e) => change("seoTitle", e.target.value)} maxLength={180} /></div>
          <div className="field"><label htmlFor="post-seo-description">SEO description</label><input id="post-seo-description" value={form.seoDescription} onChange={(e) => change("seoDescription", e.target.value)} maxLength={320} /></div>
          <div className="field"><label className="check-field"><input type="checkbox" checked={form.featured} onChange={(e) => change("featured", e.target.checked)} /> Feature this article</label></div>
        </div>
        <div className="field"><label>Article content *</label><RichTextEditor key={editing || "new"} value={form.content} onChange={(value) => change("content", value)} /></div>
        <p className="form-note">The editor supports headings, lists, links, uploaded images and YouTube embeds. Content is sanitized before it is stored.</p>
        <div className="admin-actions"><button className="button button-dark" disabled={busy}>{busy ? "Saving…" : editing ? "Update article" : "Save article"}</button>{editing && <button className="button button-outline" type="button" onClick={reset}>Cancel edit</button>}</div>
      </form>
    </section>
    <section className="admin-panel"><h3>Saved articles</h3>{loading ? <div className="admin-empty">Loading articles…</div> : posts.length ? <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Article</th><th>Category</th><th>Status</th><th>Updated</th><th>Actions</th></tr></thead><tbody>{posts.map((post) => <tr key={post.id}><td><strong>{post.title}</strong><br /><small>/insights/{post.slug}</small></td><td>{post.categories?.[0]?.category.name || "Farm notes"}</td><td><span className={`admin-status admin-status-${post.status.toLowerCase()}`}>{post.status}</span></td><td>{post.updatedAt ? new Date(post.updatedAt).toLocaleDateString("en-KE") : "—"}</td><td><div className="admin-row-actions">{post.status === "PUBLISHED" && <Link href={`/insights/${post.slug}`} target="_blank">View</Link>}<button onClick={() => edit(post)}><Pencil size={12} /> Edit</button><button onClick={() => void remove(post)}><Trash2 size={12} /> Delete</button></div></td></tr>)}</tbody></table></div> : <div className="admin-empty">No articles yet. Add a first guide above.</div>}</section>
  </>;
}

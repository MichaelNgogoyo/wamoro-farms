"use client";

import Image from "next/image";
import { useEffect, useState, type FormEvent } from "react";
import { ImagePlus, Star, Trash2 } from "lucide-react";

type MediaRow = { id: string; filename: string; originalName: string; category: string; caption: string; altText: string; featured: boolean; isPublic: boolean; sortOrder: number; url: string; sizeBytes: number };
const categories = ["founder", "farm", "avocados", "capsicum", "nursery", "Farm Visits", "Nursery", "Avocados", "Training", "Processing", "Community", "Fieldwork"];

export function MediaManager() {
  const [media,setMedia]=useState<MediaRow[]>([]);const [files,setFiles]=useState<FileList|null>(null);const [category,setCategory]=useState("Fieldwork");const [caption,setCaption]=useState("");const [altText,setAltText]=useState("");const [loading,setLoading]=useState(true);const [busy,setBusy]=useState(false);const [error,setError]=useState("");const [notice,setNotice]=useState("");
  async function reload(){try{const r=await fetch("/api/admin/media");const x=await r.json();if(!r.ok)throw new Error(x.error||"Could not load media.");setMedia(x.media||[]);}catch(cause){setError(cause instanceof Error?cause.message:"Could not load media.");}finally{setLoading(false);}}
  // eslint-disable-next-line react-hooks/set-state-in-effect -- API state updates happen after reload awaits the response.
  useEffect(()=>{void reload();},[]);
  async function submit(event:FormEvent<HTMLFormElement>){event.preventDefault();if(!files?.length){setError("Choose at least one image first.");return;}const formElement=event.currentTarget;setBusy(true);setError("");setNotice("");const data=new FormData();Array.from(files).forEach((file)=>data.append("files",file));data.append("category",category);data.append("caption",caption);data.append("altText",altText);try{const r=await fetch("/api/admin/media",{method:"POST",body:data});const x=await r.json();if(!r.ok)throw new Error(x.error||"Upload failed.");setNotice(`${x.media.length} image${x.media.length===1?"":"s"} uploaded and optimized.`);setFiles(null);formElement.reset();setCategory("Fieldwork");setCaption("");setAltText("");await reload();}catch(cause){setError(cause instanceof Error?cause.message:"Upload failed.");}finally{setBusy(false);}}
  async function update(item:MediaRow,changes:Partial<MediaRow>){const r=await fetch(`/api/admin/media/${item.id}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify(changes)});const x=await r.json();if(!r.ok){setError(x.error||"Could not update image.");return;}setNotice("Image details updated.");await reload();}
  async function remove(item:MediaRow){if(!window.confirm(`Permanently delete “${item.originalName||item.filename}”? This removes the optimized image and its stored original.`))return;const r=await fetch(`/api/admin/media/${item.id}`,{method:"DELETE"});if(!r.ok){const x=await r.json();setError(x.error||"Could not delete image.");return;}setNotice("Image deleted.");await reload();}
  return <>
    <div className="admin-main-heading"><div><span className="eyebrow">Image library</span><h2>Gallery & media</h2><p>Upload fieldwork, nursery, crop and founder images.</p></div></div>
    {notice&&<div className="admin-toast" role="status">{notice}</div>}{error&&<div className="form-message form-message-error" role="alert">{error}</div>}
    <div className="admin-two-col">
      <section className="admin-panel"><h3>Upload images</h3><p className="admin-note">JPEG, PNG, WebP and AVIF up to 10 MB each. Files are checked by content, retained as originals and converted to optimized WebP for display.</p>
        <form onSubmit={submit}>
          <label className="upload-drop" htmlFor="media-files"><span><ImagePlus size={23}/><br/><strong>{files?.length?`${files.length} file${files.length===1?"":"s"} selected`:"Choose images from your computer"}</strong><br/><small>Multiple files supported · maximum 12 at a time</small></span><input id="media-files" type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple required onChange={(e)=>setFiles(e.target.files)}/></label>
          <div className="admin-form-grid" style={{marginTop:16}}><div className="field"><label htmlFor="media-category">Category</label><select id="media-category" value={category} onChange={(e)=>setCategory(e.target.value)}>{categories.map((item)=><option key={item}>{item}</option>)}</select></div><div className="field"><label htmlFor="media-caption">Caption</label><input id="media-caption" value={caption} onChange={(e)=>setCaption(e.target.value)} maxLength={300}/></div><div className="field field-full"><label htmlFor="media-alt">Alt text</label><input id="media-alt" value={altText} onChange={(e)=>setAltText(e.target.value)} maxLength={300} placeholder="Describe what is visible for screen readers"/></div></div>
          <button className="button button-dark" disabled={busy}>{busy?"Uploading…":"Upload & optimize"}</button>
        </form>
      </section>
      <section className="admin-panel"><h3>Image management</h3><p>Mark a photo featured for use in featured content. Choose public visibility, edit the category and adjust gallery ordering.</p><div className="admin-note">Public uploads are served through an application route. Production hosting must mount the configured storage path as a persistent volume.</div></section>
    </div>
    <section className="admin-panel"><h3>Media library · {media.length}</h3>{loading?<div className="admin-empty">Loading images…</div>:media.length?<div className="media-grid">{media.map((item)=><article className="media-admin-card" key={item.id}>
      <div className="media-admin-image"><Image src={item.url} alt={item.altText||item.originalName} fill sizes="(max-width: 600px) 33vw, 20vw"/><span className="media-category-pill">{item.category}</span></div>
      <div className="media-admin-info"><strong title={item.originalName}>{item.caption||item.originalName||item.filename}</strong><small>{Math.round(item.sizeBytes/1024)} KB · {item.isPublic?"Public":"Private"}</small>
        <div className="media-edit-fields">
          <label>Caption<input key={`${item.id}-caption-${item.caption}`} defaultValue={item.caption} maxLength={300} onBlur={(e)=>{if(e.target.value!==item.caption)void update(item,{caption:e.target.value});}} /></label>
          <label>Alt text<input key={`${item.id}-alt-${item.altText}`} defaultValue={item.altText} maxLength={300} onBlur={(e)=>{if(e.target.value!==item.altText)void update(item,{altText:e.target.value});}} /></label>
          <label>Order<input key={`${item.id}-order-${item.sortOrder}`} type="number" min="0" max="1000000" defaultValue={item.sortOrder} onBlur={(e)=>{const value=Number(e.target.value);if(value!==item.sortOrder)void update(item,{sortOrder:value});}} /></label>
        </div>
        <div className="media-admin-controls"><select aria-label="Image category" value={item.category} onChange={(e)=>void update(item,{category:e.target.value})}>{categories.map((entry)=><option key={entry}>{entry}</option>)}</select><button title={item.featured?"Remove featured status":"Feature image"} aria-label={item.featured?"Remove featured status":"Feature image"} className={item.featured?"is-featured":""} onClick={()=>void update(item,{featured:!item.featured})}><Star size={14} fill={item.featured?"currentColor":"none"}/></button><button title={item.isPublic?"Make private":"Make public"} aria-label={item.isPublic?"Make private":"Make public"} onClick={()=>void update(item,{isPublic:!item.isPublic})}>{item.isPublic?"Public":"Private"}</button><button title="Delete image" aria-label="Delete image" onClick={()=>void remove(item)}><Trash2 size={14}/></button></div>
      </div>
    </article>)}</div>:<div className="admin-empty">No images have been uploaded yet. Start by adding your actual farm and founder photography.</div>}</section>
  </>;
}

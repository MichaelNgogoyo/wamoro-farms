"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Plus, Trash2 } from "lucide-react";
import { initialSettings } from "@/lib/content";

type Settings = typeof initialSettings;
type Social = { platform: "facebook"|"instagram"|"tiktok"|"youtube"; label: string; url: string; enabled: boolean };
type Video = { platform: "youtube"|"tiktok"|"facebook"|"instagram"; url: string; title: string; caption: string; featured: boolean; enabled: boolean };
type Media = { id: string; filename: string; caption: string; category: string };
const defaultSocials:Social[]=[
  {platform:"facebook",label:"Facebook",url:"https://www.facebook.com/myree.carlvinder/",enabled:true},
  {platform:"instagram",label:"Instagram",url:"https://www.instagram.com/wamoro_farms/",enabled:true},
  {platform:"tiktok",label:"TikTok",url:"https://www.tiktok.com/@wamoro_farms",enabled:true},
];
const blankVideo:Video={platform:"youtube",url:"",title:"",caption:"",featured:false,enabled:true};

export function SettingsManager() {
  const [settings,setSettings]=useState<Settings>(initialSettings);const [socials,setSocials]=useState<Social[]>(defaultSocials);const [videos,setVideos]=useState<Video[]>([]);const [media,setMedia]=useState<Media[]>([]);const [loading,setLoading]=useState(true);const [busy,setBusy]=useState(false);const [error,setError]=useState("");const [notice,setNotice]=useState("");
  async function reload(){try{const r=await fetch("/api/admin/settings");const x=await r.json();if(!r.ok)throw new Error(x.error||"Could not load settings.");setSettings({...initialSettings,...x.settings});setSocials(x.socials?.length?x.socials:defaultSocials);setVideos(x.videos||[]);setMedia(x.media||[]);}catch(cause){setError(cause instanceof Error?cause.message:"Could not load settings.");}finally{setLoading(false);}}
  // eslint-disable-next-line react-hooks/set-state-in-effect -- API state updates happen after reload awaits the response.
  useEffect(()=>{void reload();},[]);
  const set=<K extends keyof Settings>(key:K,value:Settings[K])=>setSettings((current)=>({...current,[key]:value}));
  async function submit(event:FormEvent<HTMLFormElement>){event.preventDefault();setBusy(true);setError("");setNotice("");try{const r=await fetch("/api/admin/settings",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({settings:{...settings,mpesaEnabled:false},socials,videos})});const x=await r.json();if(!r.ok)throw new Error(x.error||"Could not save settings.");setNotice("Site settings saved.");}catch(cause){setError(cause instanceof Error?cause.message:"Could not save settings.");}finally{setBusy(false);}}
  function updateSocial(index:number,key:keyof Social,value:string|boolean){setSocials((current)=>current.map((item,i)=>i===index?{...item,[key]:value}:item));}
  function updateVideo(index:number,key:keyof Video,value:string|boolean){setVideos((current)=>current.map((item,i)=>i===index?{...item,[key]:value}:item));}
  return <>
    <div className="admin-main-heading"><div><span className="eyebrow">Site configuration</span><h2>Business details & homepage</h2><p>Update public contact information, brand content, social accounts and video links.</p></div></div>
    {notice&&<div className="admin-toast" role="status">{notice}</div>}{error&&<div className="form-message form-message-error" role="alert">{error}</div>}{loading&&<div className="admin-note">Loading saved configuration…</div>}
    <form onSubmit={submit}>
      <section className="admin-panel"><h3>Business contact information</h3><div className="admin-note">These values are marked <strong>pending business-owner verification</strong>. Review them before public campaigns or booking confirmations.</div><div className="admin-form-grid">
        <div className="field"><label htmlFor="settings-whatsapp">Primary WhatsApp</label><input id="settings-whatsapp" value={settings.whatsapp} onChange={(e)=>set("whatsapp",e.target.value)}/></div>
        <div className="field"><label htmlFor="settings-training">Training phone</label><input id="settings-training" value={settings.trainingPhone} onChange={(e)=>set("trainingPhone",e.target.value)}/></div>
        <div className="field"><label htmlFor="settings-nursery-phones">Nursery phone numbers</label><input id="settings-nursery-phones" value={settings.nurseryPhones} onChange={(e)=>set("nurseryPhones",e.target.value)}/></div>
        <div className="field"><label htmlFor="settings-nursery-locations">Nursery locations</label><input id="settings-nursery-locations" value={settings.nurseryLocations} onChange={(e)=>set("nurseryLocations",e.target.value)}/></div>
        <div className="field field-full"><label htmlFor="settings-training-venue">Training venue</label><input id="settings-training-venue" value={settings.trainingVenue} onChange={(e)=>set("trainingVenue",e.target.value)}/></div>
      </div></section>
      <section className="admin-panel"><h3>Homepage & brand content</h3><div className="admin-form-grid">
        <div className="field field-full"><label htmlFor="settings-title">Site title</label><input id="settings-title" value={settings.siteTitle} onChange={(e)=>set("siteTitle",e.target.value)} maxLength={180}/></div>
        <div className="field field-full"><label htmlFor="settings-description">Site description</label><textarea id="settings-description" value={settings.siteDescription} onChange={(e)=>set("siteDescription",e.target.value)} maxLength={320}/></div>
        <div className="field field-full"><label htmlFor="settings-hero">Homepage hero text</label><textarea id="settings-hero" value={settings.homeHeroText} onChange={(e)=>set("homeHeroText",e.target.value)} maxLength={400}/></div>
        <div className="field field-full"><label htmlFor="settings-intro">Homepage introduction</label><textarea id="settings-intro" value={settings.homeIntro} onChange={(e)=>set("homeIntro",e.target.value)} maxLength={1000}/></div>
        <div className="field"><label htmlFor="settings-featured-product">Featured nursery product slug</label><input id="settings-featured-product" value={settings.featuredProductSlug} onChange={(e)=>set("featuredProductSlug",e.target.value)} maxLength={100}/></div>
        <div className="field"><label htmlFor="settings-featured-post">Featured article slug</label><input id="settings-featured-post" value={settings.featuredPostSlug} onChange={(e)=>set("featuredPostSlug",e.target.value)} maxLength={100}/></div>
        <div className="field field-full"><label htmlFor="settings-founder">Founder portrait</label><select id="settings-founder" value={settings.founderPortrait} onChange={(e)=>set("founderPortrait",e.target.value)}><option value="">No founder portrait selected</option>{media.filter((item)=>item.category.toLowerCase()==="founder").map((item)=><option key={item.id} value={`/api/media/${encodeURIComponent(item.filename)}`}>{item.caption||item.filename}</option>)}</select><small>Upload the founder’s real photo to the Founder category in Gallery & Media first.</small></div>
      </div></section>
      <section className="admin-panel"><h3>Social media links</h3><p>Only add official public Wamoro profiles. Links are validated to match each platform.</p>{socials.map((item,index)=><div className="social-admin-row" key={`${item.platform}-${index}`}>
        <div className="field"><label>Platform</label><select value={item.platform} onChange={(e)=>updateSocial(index,"platform",e.target.value)}><option value="facebook">Facebook</option><option value="instagram">Instagram</option><option value="tiktok">TikTok</option><option value="youtube">YouTube</option></select></div>
        <div className="field"><label>Label</label><input value={item.label} onChange={(e)=>updateSocial(index,"label",e.target.value)} maxLength={50}/></div>
        <div className="field social-url-field"><label>Public profile URL</label><input type="url" value={item.url} onChange={(e)=>updateSocial(index,"url",e.target.value)} maxLength={400}/></div>
        <label className="check-field"><input type="checkbox" checked={item.enabled} onChange={(e)=>updateSocial(index,"enabled",e.target.checked)}/> Enabled</label>
        <button className="icon-button" type="button" aria-label="Remove social media link" onClick={()=>setSocials((current)=>current.filter((_,i)=>i!==index))}><Trash2 size={15}/></button>
      </div>)}<button type="button" className="button button-outline" onClick={()=>setSocials((current)=>[...current,{platform:"youtube",label:"YouTube",url:"",enabled:true}])}><Plus size={14}/> Add social link</button>
      <div className="field" style={{marginTop:18}}><label htmlFor="youtube-channel">YouTube channel URL</label><input id="youtube-channel" type="url" value={settings.youtubeChannelUrl} onChange={(e)=>set("youtubeChannelUrl",e.target.value)} placeholder="https://www.youtube.com/@your-channel"/><small>Optional. Used for channel links and video guidance.</small></div></section>
      <section className="admin-panel"><h3>Videos & public posts</h3><p>YouTube and TikTok use responsive embeds. Facebook and Instagram links use an open-original fallback when embeds are restricted.</p>{videos.map((item,index)=><div className="video-admin-row" key={`${item.platform}-${index}`}>
        <div className="field"><label>Platform</label><select value={item.platform} onChange={(e)=>updateVideo(index,"platform",e.target.value)}><option value="youtube">YouTube</option><option value="tiktok">TikTok</option><option value="facebook">Facebook</option><option value="instagram">Instagram</option></select></div>
        <div className="field video-url-field"><label>Public URL</label><input type="url" value={item.url} onChange={(e)=>updateVideo(index,"url",e.target.value)} maxLength={500}/></div>
        <div className="field"><label>Title</label><input value={item.title} onChange={(e)=>updateVideo(index,"title",e.target.value)} maxLength={120}/></div>
        <div className="field"><label>Caption</label><input value={item.caption} onChange={(e)=>updateVideo(index,"caption",e.target.value)} maxLength={300}/></div>
        <label className="check-field"><input type="checkbox" checked={item.featured} onChange={(e)=>updateVideo(index,"featured",e.target.checked)}/> Featured</label>
        <button className="icon-button" type="button" aria-label="Remove video" onClick={()=>setVideos((current)=>current.filter((_,i)=>i!==index))}><Trash2 size={15}/></button>
      </div>)}<button type="button" className="button button-outline" onClick={()=>setVideos((current)=>[...current,{...blankVideo}])}><Plus size={14}/> Add video or post</button></section>
      <section className="admin-panel"><h3>Payments & owner verification</h3><div className="admin-note">{settings.ownerVerification}. M-Pesa collection is deliberately disabled until the Till Number and integration credentials have been verified.</div><label className="check-field check-field-disabled"><input type="checkbox" checked={false} disabled/> Enable M-Pesa collection</label></section>
      <button className="button button-dark" disabled={busy}>{busy?"Saving settings…":"Save site settings"}</button>
    </form>
  </>;
}

import "server-only";
import sanitizeHtml from "sanitize-html";

export function cleanArticleHtml(dirty: string) {
  return sanitizeHtml(dirty, {
    allowedTags: ["h1", "h2", "h3", "h4", "p", "strong", "b", "em", "i", "u", "s", "blockquote", "ul", "ol", "li", "a", "img", "iframe", "hr", "br", "pre", "code"],
    allowedAttributes: {
      a: ["href", "name", "target", "rel"],
      img: ["src", "alt", "title", "width", "height"],
      iframe: ["src", "title", "width", "height", "allow", "allowfullscreen", "loading"],
    },
    allowedIframeHostnames: ["youtube.com", "www.youtube.com", "www.youtube-nocookie.com", "www.tiktok.com"],
    allowedSchemes: ["http", "https", "mailto"],
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer", target: "_blank" }, true),
    },
  });
}

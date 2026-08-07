import { useEffect } from "react";
import { siteConfig } from "@/config";

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: "article" | "website";
  published?: string;
}

export function setMetaTag(name: string, content: string, isProperty = false) {
  const attr = isProperty ? "property" : "name";
  let el = document.querySelector<HTMLMetaElement>(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    if (isProperty) el.setAttribute("property", name);
    else el.setAttribute("name", name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

export default function SEO({
  title,
  description,
  image,
  url,
  type = "website",
  published,
}: SEOProps) {
  useEffect(() => {
    const fullTitle = title ? `${title} - ${siteConfig.title}` : siteConfig.title;
    document.title = fullTitle;

    setMetaTag("description", description || siteConfig.description);
    setMetaTag("og:title", fullTitle, true);
    setMetaTag("og:description", description || siteConfig.description, true);
    setMetaTag("og:type", type, true);
    setMetaTag("og:image", image || siteConfig.icon, true);
    setMetaTag("og:url", url || window.location.href, true);
    setMetaTag("og:locale", siteConfig.lang, true);
    setMetaTag("og:site_name", siteConfig.title, true);

    if (published) {
      setMetaTag("article:published_time", published, true);
    }
  }, [title, description, image, url, type, published]);

  return null;
}

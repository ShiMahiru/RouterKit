
import type { MetaFunction } from "react-router";
import { siteConfig } from "@/config";

export const meta: MetaFunction = () => {
  const title = `文章列表 - ${siteConfig.title}`;
  const url = `${siteConfig.url}/posts/`;
  return [
    { title },
    { name: "description", content: siteConfig.description },
    { property: "og:title", content: title },
    { property: "og:description", content: siteConfig.description },
    { property: "og:url", content: url },
    { property: "og:type", content: "website" },
    { property: "og:image", content: siteConfig.icon },
    { name: "twitter:card", content: "summary" },
    { tagName: "link", rel: "canonical", href: url },
    { tagName: "link", rel: "alternate", type: "application/rss+xml", title: siteConfig.title, href: `${siteConfig.url}/rss.xml` },
  ];
};

export { loader, default } from "./home";

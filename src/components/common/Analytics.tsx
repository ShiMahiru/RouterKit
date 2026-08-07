import { useEffect } from "react";
import { siteConfig } from "@/config";

export default function Analytics() {
  useEffect(() => {
    const { umamiUrl, umamiId } = siteConfig.analytics;
    if (!umamiUrl || !umamiId) return;

    const script = document.createElement("script");
    script.async = true;
    script.defer = true;
    script.src = new URL("/script.js", umamiUrl).href;
    script.setAttribute("data-website-id", umamiId);
    script.setAttribute("data-domains", new URL(siteConfig.url).hostname);

    document.head.appendChild(script);
    return () => {
      document.head.removeChild(script);
    };
  }, []);

  return null;
}

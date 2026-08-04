
import { siteConfig } from "@/config";

export const meta = () => [{ title: `文章列表 - ${siteConfig.title}` }];

export { loader, default } from "./home";

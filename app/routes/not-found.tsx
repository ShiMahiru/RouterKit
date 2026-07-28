import { Link } from "react-router";
import type { MetaFunction } from "react-router";
import { siteConfig } from "@/config";

export const meta: MetaFunction = () => [
  { title: `404 - ${siteConfig.title}` },
];

export default function NotFound() {
  return (
    <main className="pm-main">
      <div className="pm-empty" style={{ paddingTop: "80px" }}>
        <p>页面未找到</p>
        <p><Link to="/">返回首页</Link></p>
      </div>
    </main>
  );
}
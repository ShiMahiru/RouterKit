import { Link } from "react-router-dom";
import SEO from "@/components/common/SEO";

export default function NotFound() {
  return (
    <main className="pm-not-found">
      <SEO title="404" />
      <h1 className="pm-not-found-code">404</h1>
      <p className="pm-not-found-text">
        抱歉，没有找到你要访问的页面。它可能已被移动或删除，也可能是网址输入有误。
      </p>
      <Link to="/" className="pm-not-found-btn">
        返回首页
      </Link>
    </main>
  );
}

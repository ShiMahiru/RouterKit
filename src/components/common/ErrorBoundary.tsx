import { useRouteError, isRouteErrorResponse } from "react-router";

export default function ErrorBoundary() {
  const error = useRouteError();

  let message = "未知错误";
  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "页面未找到" : `服务器错误 (${error.status})`;
  } else if (error instanceof Error) {
    message = error.message;
  }

  return (
    <main className="pm-main">
      <div className="pm-empty" style={{ paddingTop: "80px" }}>
        <h2>页面加载出错</h2>
        <p style={{ marginTop: "12px", color: "var(--pm-secondary)" }}>{message}</p>
        <a
          style={{ marginTop: "20px", display: "inline-block" }}
          href="/"
        >
          返回首页
        </a>
      </div>
    </main>
  );
}
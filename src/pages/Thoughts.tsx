import { useEffect, useState } from "react";
import { siteConfig } from "@/config";
import { loadAllThoughts } from "@/lib/thoughts-loader";
import ImageViewer from "@/components/article/ImageViewer";

export default function Thoughts() {
  const [thoughts, setThoughts] = useState<
    { date: string; images: string[]; content: string }[]
  >([]);

  useEffect(() => {
    document.title = `闲言 - ${siteConfig.title}`;
  }, []);

  useEffect(() => {
    const all = loadAllThoughts();
    setThoughts(
      all.map((t) => ({
        date: t.metadata.date,
        images: t.metadata.images ?? [],
        content: t.content,
      }))
    );
  }, []);

  return (
    <main className="pm-main">
      <header className="pm-page-header">
        <h1>闲言</h1>
      </header>

      <div className="pm-moments-container">
        {thoughts.length === 0 ? (
          <div className="pm-empty">暂无内容</div>
        ) : (
          <div className="pm-moments-list">
            {thoughts.map((t, i) => (
              <article key={i} className="pm-moment-item">
                <div className="pm-moment-avatar">
                  <img src={siteConfig.icon} alt="" loading="lazy" />
                </div>
                <div className="pm-moment-body">
                  <div className="pm-moment-author">
                    {siteConfig.headerTitle}
                  </div>
                  <div className="pm-moment-text">{t.content}</div>
                  {t.images.length > 0 && (
                    <div
                      className={`pm-moment-gallery pm-moment-gallery-n${Math.min(t.images.length, 9)}`}
                    >
                      {t.images.slice(0, 9).map((img, j) => (
                        <img
                          key={j}
                          src={img}
                          alt=""
                          loading="lazy"
                          decoding="async"
                          fetchPriority="low"
                        />
                      ))}
                    </div>
                  )}
                  <div className="pm-moment-footer">
                    <time className="pm-moment-time" dateTime={t.date}>
                      <MomentTime dateStr={t.date} />
                    </time>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
      <ImageViewer gallery=".pm-moments-container" />
    </main>
  );
}

function formatAbsoluteDate(dateStr: string): string {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}年${m}月${day}日`;
}

function formatRelativeTime(dateStr: string): string {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  if (mins < 1) return "刚刚";
  if (mins < 60) return `${mins}分钟前`;
  if (hours < 24 && d.getDate() === now.getDate()) return `${hours}小时前`;
  if (hours < 48 && d.getDate() === now.getDate() - 1) return "昨天";
  return formatAbsoluteDate(dateStr);
}

function MomentTime({ dateStr }: { dateStr: string }) {
  const [text, setText] = useState(() => formatAbsoluteDate(dateStr));

  useEffect(() => {
    setText(formatRelativeTime(dateStr));
    const timer = setInterval(() => {
      setText(formatRelativeTime(dateStr));
    }, 60_000);
    return () => clearInterval(timer);
  }, [dateStr]);

  return <>{text}</>;
}

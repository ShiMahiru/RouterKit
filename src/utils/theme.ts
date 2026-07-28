/** 获取用户首选主题：优先 localStorage，其次系统偏好。SSR 安全。 */
export function getPreferredTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  const stored = localStorage.getItem('pref-theme');
  if (stored === 'light' || stored === 'dark') return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/** 获取当前 DOM 上已生效的主题（nav 内联脚本已设置 data-theme） */
export function getResolvedTheme(): 'light' | 'dark' {
  const theme = document.documentElement.dataset.theme;
  if (theme === 'dark' || theme === 'light') return theme;
  return getPreferredTheme();
}
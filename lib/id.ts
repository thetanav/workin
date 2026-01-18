export function localUserId(): string {
  if (typeof window === "undefined") return "anonymous";
  const key = "workin:userId";
  const existing = window.localStorage.getItem(key);
  if (existing) return existing;
  const created = "u_" + Math.random().toString(36).slice(2, 10);
  window.localStorage.setItem(key, created);
  return created;
}

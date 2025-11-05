export function toPublicUrl(bucket: string, pathOrUrl?: string | null) {
  if (!pathOrUrl) return null;
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  const base = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public`;
  return `${base}/${bucket}/${pathOrUrl}`;
}

export function uniqueName(original: string) {
  const ext = original.includes(".") ? original.split(".").pop() : "";
  const stem = original.replace(/\.[^.]+$/, "");
  return `${Date.now()}-${Math.random().toString(36).slice(2)}-${slug(stem)}${ext ? "." + ext : ""}`;
}

function slug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
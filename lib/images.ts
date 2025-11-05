// Bygg publik URL om vi har en storage-stig (eller returnera URL som redan är full)
export function toPublicUrl(bucket: string, pathOrUrl?: string | null) {
  if (!pathOrUrl) return null;
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl; // redan en full URL
  const base = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public`;
  return `${base}/${bucket}/${pathOrUrl}`;
}

// Liten hjälpare för unika filnamn
export function uniqueName(original: string) {
  const ext = original.includes(".") ? original.split(".").pop() : "";
  const stem = original.replace(/\.[^.]+$/, "");
  return `${Date.now()}-${Math.random().toString(36).slice(2)}-${slug(stem)}${ext ? "." + ext : ""}`;
}

function slug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
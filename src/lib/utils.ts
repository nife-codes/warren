import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { supabase } from "./supabase";

const REACTION_EMOJIS = ["🔥", "👀", "🤔", "💀", "❓"];

export async function fetchCommentCounts(caseIds: string[]): Promise<Record<string, number>> {
  if (!caseIds.length) return {};
  const { data } = await supabase
    .from("comments")
    .select("case_id, content")
    .in("case_id", caseIds);
  const counts: Record<string, number> = {};
  (data || []).forEach(c => {
    if (!REACTION_EMOJIS.includes(c.content)) {
      counts[c.case_id] = (counts[c.case_id] || 0) + 1;
    }
  });
  return counts;
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins  <  1) return "just now";
  if (mins  < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days  <  7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

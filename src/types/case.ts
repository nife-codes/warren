export type CaseType = "true-crime" | "lore" | "conspiracy" | "missing-persons" | "paranormal" | "historical" | "research" | "world-building";

export interface CaseAuthor {
  id: string;
  username: string;
  avatar: string;
  is_founder?: boolean;
}

export interface CaseItem {
  id: string;
  type: CaseType;
  title: string;
  summary: string;
  tags: string[];
  author: CaseAuthor;
  likes: number;
  saves: number;
  liked: boolean;
  saved: boolean;
  createdAt: string;
  content: Record<string, string>;
  comment_count?: number;
}

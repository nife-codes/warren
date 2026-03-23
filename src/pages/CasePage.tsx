import { Layout } from "@/components/Layout";
import { type CaseItem } from "@/types/case";
import { CaseTypeBadge } from "@/components/CaseTypeBadge";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Heart, Bookmark, Share2, ArrowLeft, Loader2, SearchX, Trash2, Send, MessageCircle, X, CornerDownRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/AuthProvider";
import { FounderBadge } from "@/components/FounderBadge";
import { cn, timeAgo } from "@/lib/utils";

type Comment = {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  highlighted_text?: string | null;
  parent_id?: string | null;
  like_count: number;
  liked: boolean;
  author: { username: string; avatar_url: string | null } | null;
};

const REACTIONS = ["🔥", "👀", "🤔", "💀", "❓"];
const isReaction = (content: string) => REACTIONS.includes(content);

// ── single comment row ────────────────────────────────────────────────────────

function CommentRow({
  comment, caseAuthorId, currentUserId, isCaseAuthor,
  onLike, onReply, onDelete, isReply = false,
}: {
  comment: Comment;
  caseAuthorId: string;
  currentUserId?: string;
  isCaseAuthor: boolean;
  onLike: (id: string, liked: boolean) => void;
  onReply: (id: string, username: string) => void;
  onDelete: (id: string) => void;
  isReply?: boolean;
}) {
  const isAuthorComment = comment.user_id === caseAuthorId;
  const canDelete = currentUserId === comment.user_id || isCaseAuthor;

  return (
    <div className={cn("group flex gap-3", isReply && "ml-8 mt-2")}>
      <img
        src={comment.author?.avatar_url || `https://api.dicebear.com/9.x/thumbs/svg?seed=${comment.user_id}`}
        alt={comment.author?.username || "user"}
        className={cn("rounded-full bg-muted shrink-0 mt-0.5", isReply ? "h-6 w-6" : "h-7 w-7")}
      />
      <div className="flex-1 min-w-0">
        {/* Name row */}
        <div className="flex items-center gap-1.5 mb-1 flex-wrap">
          <span className="text-xs font-semibold">{comment.author?.username || "Unknown"}</span>
          {isAuthorComment && (
            <span className="rounded-full bg-primary/15 border border-primary/30 px-1.5 py-px text-[9px] font-bold uppercase tracking-widest text-primary">
              Author
            </span>
          )}
          <span className="text-[10px] text-muted-foreground/40">
            {timeAgo(comment.created_at)}
          </span>
        </div>

        {/* Quoted text */}
        {comment.highlighted_text && (
          <div className="mb-1.5 border-l-2 border-primary/40 pl-3 py-0.5">
            <p className="text-[11px] italic text-muted-foreground/50 line-clamp-2">"{comment.highlighted_text}"</p>
          </div>
        )}

        {/* Content */}
        <p className="text-sm text-foreground/80 leading-relaxed">{comment.content}</p>

        {/* Actions */}
        <div className="mt-1.5 flex items-center gap-3">
          <button
            onClick={() => onLike(comment.id, comment.liked)}
            className={cn(
              "flex items-center gap-1 text-xs transition-colors",
              comment.liked ? "text-primary" : "text-muted-foreground/40 hover:text-muted-foreground"
            )}
          >
            <Heart className={cn("h-3 w-3", comment.liked && "fill-primary")} />
            {comment.like_count > 0 && comment.like_count}
          </button>

          {!isReply && (
            <button
              onClick={() => onReply(comment.id, comment.author?.username || "user")}
              className="text-xs text-muted-foreground/40 hover:text-muted-foreground transition-colors"
            >
              Reply
            </button>
          )}
        </div>
      </div>

      {canDelete && (
        <button
          onClick={() => onDelete(comment.id)}
          className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground/30 hover:text-destructive shrink-0 mt-1"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

// ── comments panel ────────────────────────────────────────────────────────────

function CommentsPanel({
  open, onClose, comments, commentsLoading,
  commentText, setCommentText, quotedText, setQuotedText,
  replyTo, setReplyTo,
  submitting, onSubmit, onLike, onDeleteComment,
  user, isAuthor, caseAuthorId, isDemo,
}: {
  open: boolean; onClose: () => void;
  comments: Comment[]; commentsLoading: boolean;
  commentText: string; setCommentText: (v: string) => void;
  quotedText: string; setQuotedText: (v: string) => void;
  replyTo: { id: string; username: string } | null;
  setReplyTo: (v: { id: string; username: string } | null) => void;
  submitting: boolean; onSubmit: () => void;
  onLike: (id: string, liked: boolean) => void;
  onDeleteComment: (id: string) => void;
  user: any; isAuthor: boolean; caseAuthorId: string; isDemo: boolean;
}) {
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (replyTo && open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [replyTo, open]);

  const topLevel  = comments.filter(c => !c.parent_id && !isReaction(c.content));
  const reactions = comments.filter(c => isReaction(c.content));

  const reactionGroups: Record<string, Comment[]> = {};
  reactions.forEach(r => {
    if (!reactionGroups[r.content]) reactionGroups[r.content] = [];
    reactionGroups[r.content].push(r);
  });

  const getReplies = (parentId: string) =>
    comments.filter(c => c.parent_id === parentId);

  return (
    <>
      {open && <div className="fixed inset-0 z-40 bg-background/50 backdrop-blur-sm" onClick={onClose} />}

      <div className={cn(
        "fixed inset-y-0 right-0 z-50 flex w-full flex-col border-l border-border bg-card sm:w-[400px]",
        "transform transition-transform duration-300 ease-in-out",
        open ? "translate-x-0" : "translate-x-full"
      )}>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4 shrink-0">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-bold">
              {topLevel.length > 0 ? `${topLevel.length} comment${topLevel.length !== 1 ? "s" : ""}` : "Comments"}
            </h2>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Reaction bar */}
        {Object.keys(reactionGroups).length > 0 && (
          <div className="flex flex-wrap gap-2 border-b border-border px-5 py-3 shrink-0">
            {Object.entries(reactionGroups).map(([emoji, rs]) => (
              <span key={emoji} className="flex items-center gap-1 rounded-full bg-muted/60 px-2.5 py-1 text-sm">
                {emoji} <span className="text-xs font-semibold text-muted-foreground">{rs.length}</span>
              </span>
            ))}
          </div>
        )}

        {/* List */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {commentsLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : topLevel.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-sm text-muted-foreground/50">No comments yet.</p>
              <p className="text-xs text-muted-foreground/30 mt-1">Highlight text to annotate, or drop a thought below.</p>
            </div>
          ) : (
            topLevel.map(c => (
              <div key={c.id}>
                <CommentRow
                  comment={c}
                  caseAuthorId={caseAuthorId}
                  currentUserId={user?.id}
                  isCaseAuthor={isAuthor}
                  onLike={onLike}
                  onReply={(id, username) => setReplyTo({ id, username })}
                  onDelete={onDeleteComment}
                />
                {getReplies(c.id).map(reply => (
                  <CommentRow
                    key={reply.id}
                    comment={reply}
                    caseAuthorId={caseAuthorId}
                    currentUserId={user?.id}
                    isCaseAuthor={isAuthor}
                    onLike={onLike}
                    onReply={() => {}}
                    onDelete={onDeleteComment}
                    isReply
                  />
                ))}
              </div>
            ))
          )}
        </div>

        {/* Input */}
        <div className="border-t border-border p-4 shrink-0 space-y-2">
          {/* Reply indicator */}
          {replyTo && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <CornerDownRight className="h-3 w-3 shrink-0" />
              <span>Replying to <span className="font-semibold text-foreground">@{replyTo.username}</span></span>
              <button onClick={() => setReplyTo(null)} className="ml-auto text-muted-foreground/50 hover:text-foreground">
                <X className="h-3 w-3" />
              </button>
            </div>
          )}

          {/* Quoted text */}
          {quotedText && (
            <div className="flex items-start gap-2 rounded-lg border-l-2 border-primary/40 bg-muted/20 px-3 py-2">
              <p className="flex-1 text-[11px] italic text-muted-foreground/60 line-clamp-2">"{quotedText}"</p>
              <button onClick={() => setQuotedText("")} className="shrink-0 text-muted-foreground/40 hover:text-foreground">
                <X className="h-3 w-3" />
              </button>
            </div>
          )}

          {user && !isDemo ? (
            <div className="flex items-end gap-2 rounded-xl border border-border bg-background px-4 py-3 focus-within:border-primary/40 transition-colors">
              <textarea
                ref={inputRef}
                rows={1}
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onSubmit(); } }}
                placeholder={replyTo ? `Reply to @${replyTo.username}...` : "Add to the investigation..."}
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/30 focus:outline-none resize-none leading-relaxed"
              />
              <button onClick={onSubmit} disabled={!commentText.trim() || submitting}
                className="shrink-0 text-primary disabled:text-muted-foreground/30 transition-colors">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </button>
            </div>
          ) : (
            <p className="text-center text-xs text-muted-foreground/50">
              <Link to="/auth" className="text-primary hover:underline">Sign in</Link> to comment
            </p>
          )}
        </div>
      </div>
    </>
  );
}

// ── main page ─────────────────────────────────────────────────────────────────

const CasePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isDemo } = useAuth();

  const [caseItem, setCaseItem]   = useState<CaseItem | null>(null);
  const [loading, setLoading]     = useState(true);
  const [liked, setLiked]         = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [saved, setSaved]         = useState(false);

  const [comments, setComments]               = useState<Comment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [commentText, setCommentText]         = useState("");
  const [submitting, setSubmitting]           = useState(false);
  const [panelOpen, setPanelOpen]             = useState(false);
  const [quotedText, setQuotedText]           = useState("");
  const [replyTo, setReplyTo]                 = useState<{ id: string; username: string } | null>(null);

  const [popup, setPopup]               = useState<{ text: string; x: number; y: number } | null>(null);
  const [deleting, setDeleting]         = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (id) { fetchCase(); fetchComments(); } }, [id]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest("[data-highlight-popup]")) setPopup(null);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const fetchCase = async () => {
    const { data, error } = await supabase
      .from("cases").select(`*, author:profiles(username, avatar_url, is_founder), like_count:case_likes(count)`).eq("id", id).single();
    if (!error && data) {
      let initLiked = false;
      let initSaved = false;
      if (user) {
        const [likeRes, saveRes] = await Promise.all([
          supabase.from("case_likes").select("case_id").eq("user_id", user.id).eq("case_id", id).maybeSingle(),
          supabase.from("case_saves").select("case_id").eq("user_id", user.id).eq("case_id", id).maybeSingle(),
        ]);
        initLiked = !!likeRes.data;
        initSaved = !!saveRes.data;
      }
      setLiked(initLiked);
      setLikeCount((data.like_count as any)?.[0]?.count || 0);
      setSaved(initSaved);
      setCaseItem({
        ...data, content: data.fields || {},
        author: {
          id: data.user_id,
          username: data.author?.username || "Unknown",
          avatar: data.author?.avatar_url || `https://api.dicebear.com/9.x/thumbs/svg?seed=${data.user_id}`,
          is_founder: data.author?.is_founder || false,
        },
        likes: 0, saves: 0, liked: initLiked, saved: initSaved,
        createdAt: timeAgo(data.created_at),
      });
    }
    setLoading(false);
  };

  const fetchComments = async () => {
    const { data: raw } = await supabase
      .from("comments")
      .select("*, author:profiles(username, avatar_url), like_count:comment_likes(count)")
      .eq("case_id", id)
      .order("created_at", { ascending: true });

    if (!raw) { setCommentsLoading(false); return; }

    let likedIds = new Set<string>();
    if (user) {
      const { data: userLikes } = await supabase
        .from("comment_likes").select("comment_id")
        .eq("user_id", user.id)
        .in("comment_id", raw.map(c => c.id));
      likedIds = new Set(userLikes?.map(l => l.comment_id));
    }

    setComments(raw.map(c => ({
      ...c,
      like_count: (c.like_count as any)?.[0]?.count || 0,
      liked: likedIds.has(c.id),
    })));
    setCommentsLoading(false);
  };

  const handleComment = async () => {
    if (!user || !commentText.trim()) return;
    setSubmitting(true);
    const { data, error } = await supabase.from("comments")
      .insert({
        case_id: id,
        user_id: user.id,
        content: commentText.trim(),
        highlighted_text: quotedText || null,
        parent_id: replyTo?.id || null,
      })
      .select("*, author:profiles(username, avatar_url)")
      .single();
    if (!error && data) {
      setComments(prev => [...prev, { ...data, like_count: 0, liked: false }]);
      setCommentText(""); setQuotedText(""); setReplyTo(null);
      const ownerId = caseItem?.author.id;
      if (ownerId && ownerId !== user.id) {
        await supabase.from("notifications").insert({ user_id: ownerId, actor_id: user.id, type: "comment", case_id: id });
      }
    }
    setSubmitting(false);
  };

  const handleLikeComment = async (commentId: string, currentlyLiked: boolean) => {
    if (!user) return;
    setComments(prev => prev.map(c => c.id === commentId
      ? { ...c, liked: !currentlyLiked, like_count: currentlyLiked ? c.like_count - 1 : c.like_count + 1 }
      : c
    ));
    if (currentlyLiked) {
      await supabase.from("comment_likes").delete().eq("comment_id", commentId).eq("user_id", user.id);
    } else {
      await supabase.from("comment_likes").insert({ comment_id: commentId, user_id: user.id });
    }
  };

  const handleReaction = async (emoji: string) => {
    if (!user || !popup) return;
    const { data } = await supabase.from("comments")
      .insert({ case_id: id, user_id: user.id, content: emoji, highlighted_text: popup.text })
      .select("*, author:profiles(username, avatar_url)").single();
    if (data) setComments(prev => [...prev, { ...data, like_count: 0, liked: false }]);
    setPopup(null);
    window.getSelection()?.removeAllRanges();
  };

  const handleQuoteComment = () => {
    if (!popup) return;
    setQuotedText(popup.text);
    setPanelOpen(true);
    setPopup(null);
    window.getSelection()?.removeAllRanges();
  };

  const handleDeleteComment = async (commentId: string) => {
    await supabase.from("comments").delete().eq("id", commentId);
    setComments(prev => prev.filter(c => c.id !== commentId && c.parent_id !== commentId));
  };

  const handleDeleteCase = async () => {
    if (!confirmDelete) { setConfirmDelete(true); return; }
    setDeleting(true);
    const { error } = await supabase.from("cases").delete().eq("id", id);
    if (error) { toast({ variant: "destructive", title: "Error", description: error.message }); setDeleting(false); }
    else { toast({ title: "Case deleted.", description: "It's gone from the warren." }); navigate("/my-warren"); }
  };

  const handleMouseUp = () => {
    setTimeout(() => {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed || !sel.toString().trim()) { setPopup(null); return; }
      if (!contentRef.current?.contains(sel.anchorNode)) { setPopup(null); return; }
      const text = sel.toString().trim().slice(0, 300);
      const rect = sel.getRangeAt(0).getBoundingClientRect();
      setPopup({ text, x: rect.left + rect.width / 2, y: rect.top });
    }, 10);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({ title: "Link copied!", description: "Share this case with fellow investigators." });
  };

  if (loading) return (
    <Layout><div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></Layout>
  );

  if (!caseItem) return (
    <Layout>
      <div className="container flex flex-col items-center justify-center py-24 text-center">
        <div className="mb-4 flex items-center justify-center w-16 h-16 rounded-full bg-muted">
          <SearchX className="h-8 w-8 text-muted-foreground" />
        </div>
        <h1 className="mb-2 text-xl font-bold">Case not found</h1>
        <p className="mb-6 text-sm text-muted-foreground">This rabbit hole doesn't exist</p>
        <Button variant="hero" asChild><Link to="/feed">Back to Feed</Link></Button>
      </div>
    </Layout>
  );

  const isAuthor = user?.id === caseItem.author.id;
  const visibleComments = comments.filter(c => !isReaction(c.content));

  return (
    <Layout>
      {/* Highlight popup */}
      {popup && (
        <div data-highlight-popup
          className="fixed z-50 flex items-center gap-1 rounded-full border border-border bg-card px-3 py-1.5 shadow-lg"
          style={{ left: popup.x, top: popup.y, transform: "translateX(-50%) translateY(calc(-100% - 10px))" }}>
          {REACTIONS.map(emoji => (
            <button key={emoji} onClick={() => handleReaction(emoji)}
              className="text-base transition-transform hover:scale-125 px-0.5">{emoji}</button>
          ))}
          <div className="mx-1 h-4 w-px bg-border" />
          <button onClick={handleQuoteComment}
            className="flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80 transition-colors px-0.5">
            <MessageCircle className="h-3.5 w-3.5" /> comment
          </button>
        </div>
      )}

      <div className="container max-w-2xl py-8">
        <Link to="/feed" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Feed
        </Link>

        <article className="animate-fade-in">
          <div className="mb-4 flex flex-wrap items-center gap-4">
            <Link to={`/user/${caseItem.author.username}`} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <img src={caseItem.author.avatar} alt={caseItem.author.username} className="h-8 w-8 rounded-full bg-muted" />
              <span className="flex items-center gap-1 text-sm font-semibold">
                {caseItem.author.username}
                {caseItem.author.is_founder && <FounderBadge size="sm" />}
              </span>
            </Link>
            <div className="ml-auto flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={async () => {
                if (!user || isDemo) { navigate("/auth"); return; }
                const next = !liked;
                setLiked(next);
                setLikeCount(c => next ? c + 1 : c - 1);
                if (next) {
                  await supabase.from("case_likes").insert({ user_id: user.id, case_id: id });
                  const ownerId = caseItem?.author.id;
                  if (ownerId && ownerId !== user.id) {
                    await supabase.from("notifications").insert({ user_id: ownerId, actor_id: user.id, type: "like", case_id: id });
                  }
                } else {
                  await supabase.from("case_likes").delete().eq("user_id", user.id).eq("case_id", id);
                }
              }} className={liked ? "text-primary" : "text-muted-foreground"}>
                <Heart className={cn("h-4 w-4", liked && "fill-primary")} />
                {likeCount || ""}
              </Button>
              <Button variant="ghost" size="sm" onClick={async () => {
                if (!user || isDemo) { navigate("/auth"); return; }
                const next = !saved;
                setSaved(next);
                if (next) {
                  await supabase.from("case_saves").insert({ user_id: user.id, case_id: id });
                } else {
                  await supabase.from("case_saves").delete().eq("user_id", user.id).eq("case_id", id);
                }
              }} className={saved ? "text-primary" : "text-muted-foreground"}>
                <Bookmark className={cn("h-4 w-4", saved && "fill-primary")} />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setPanelOpen(true)} className="text-muted-foreground gap-1.5">
                <MessageCircle className="h-4 w-4" />
                {visibleComments.length || ""}
              </Button>
              <Button variant="ghost" size="sm" onClick={handleShare} className="text-muted-foreground">
                <Share2 className="h-4 w-4" />
              </Button>
              {isAuthor && (
                <Button variant="ghost" size="sm" onClick={handleDeleteCase} disabled={deleting}
                  className={cn("transition-colors", confirmDelete ? "text-destructive hover:text-destructive" : "text-muted-foreground")}>
                  {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  {confirmDelete && !deleting && <span className="text-xs">confirm?</span>}
                </Button>
              )}
            </div>
          </div>

          <div className="mb-4 flex items-center gap-3 mt-2">
            <CaseTypeBadge type={caseItem.type} />
            <span className="text-xs text-muted-foreground">{caseItem.createdAt}</span>
          </div>

          <h1 className="mb-4 text-3xl font-extrabold leading-tight">{caseItem.title}</h1>
          <p className="mb-6 text-base leading-relaxed text-muted-foreground">{caseItem.summary}</p>

          {caseItem.tags?.length > 0 && (
            <div className="mb-6 flex flex-wrap gap-1.5">
              {caseItem.tags.map(tag => (
                <span key={tag} className="rounded-md bg-muted px-2.5 py-1 text-xs text-muted-foreground">#{tag}</span>
              ))}
            </div>
          )}

          <div className="mb-3 flex items-center gap-2 rounded-lg border border-border/50 bg-muted/20 px-4 py-2.5">
            <p className="text-xs text-muted-foreground/60">
              Select any text below to <span className="text-foreground/80 font-medium">react</span> with an emoji or <span className="text-foreground/80 font-medium">leave an annotation</span> — it'll show up in comments.
            </p>
          </div>

          <div ref={contentRef} onMouseUp={handleMouseUp}
            className="space-y-6 rounded-lg border border-border bg-card p-6 select-text">
            {Object.entries(caseItem.content).map(([key, value]) => {
              if (!value) return null;
              let people: { name: string; age: string; description: string }[] | null = null;
              if (typeof value === "string" && value.startsWith("[{")) {
                try { people = JSON.parse(value); } catch {}
              }
              const isImage = typeof value === "string" && value.startsWith("__img__:");
              const isList  = typeof value === "string" && value.includes("||");
              return (
                <div key={key}>
                  <h3 className="mb-2 text-xs font-bold uppercase tracking-widest text-primary/70">{key}</h3>
                  {isImage ? (
                    <img
                      src={(value as string).slice(8)}
                      alt={key}
                      className="rounded-lg max-h-80 w-full object-cover"
                    />
                  ) : people ? (
                    <div className="space-y-2">
                      {people.map((p, i) => (
                        <div key={i} className="rounded-lg border border-border bg-muted/20 px-4 py-3">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground shrink-0">
                              {p.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-sm font-semibold">{p.name}</span>
                            {p.age && <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">{p.age}</span>}
                          </div>
                          {p.description && <p className="text-xs leading-relaxed text-muted-foreground pl-8">{p.description}</p>}
                        </div>
                      ))}
                    </div>
                  ) : !isImage && isList ? (
                    <ul className="space-y-1.5">
                      {value.split("||").filter(Boolean).map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                          <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary/40 shrink-0" />{item}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm leading-relaxed text-foreground/80">{value}</p>
                  )}
                </div>
              );
            })}
          </div>

        </article>
      </div>

      <CommentsPanel
        open={panelOpen} onClose={() => setPanelOpen(false)}
        comments={comments} commentsLoading={commentsLoading}
        commentText={commentText} setCommentText={setCommentText}
        quotedText={quotedText} setQuotedText={setQuotedText}
        replyTo={replyTo} setReplyTo={setReplyTo}
        submitting={submitting} onSubmit={handleComment}
        onLike={handleLikeComment} onDeleteComment={handleDeleteComment}
        user={user} isAuthor={isAuthor} caseAuthorId={caseItem.author.id} isDemo={isDemo}
      />
    </Layout>
  );
};

export default CasePage;

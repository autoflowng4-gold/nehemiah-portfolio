import { useEffect, useRef, useState, type FormEvent } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { LogOut, MessageCircle, Send, ArrowLeft, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { messageSchema } from "@/lib/chat-validation";
import { usePortfolioAuth } from "./auth-provider";
import { AccountForm } from "./account-form";

export function TalkButton() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="h-11">
          <MessageCircle />
          Let's Talk
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90dvh] w-[calc(100%-2rem)] overflow-y-auto rounded-lg">
        <DialogTitle>Let's Talk</DialogTitle>
        <DialogDescription>A private conversation with Nehemiah.</DialogDescription>
        <VisitorChat />
      </DialogContent>
    </Dialog>
  );
}

function SessionBar() {
  const { user } = usePortfolioAuth();
  const [error, setError] = useState("");
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3 text-sm">
      <span className="break-all text-muted-foreground">
        {user?.user_metadata["display_name"] || "Your account"}
      </span>
      <Button
        variant="ghost"
        onClick={async () => {
          const { error } = await supabase.auth.signOut();
          if (error) setError(error.message);
        }}
      >
        <LogOut />
        Sign out
      </Button>
      {error && <p role="alert">{error}</p>}
    </div>
  );
}

export function VisitorChat() {
  const { user, loading } = usePortfolioAuth();
  const conversation = useQuery({
    queryKey: ["my-conversation", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("start_conversation");
      if (error) throw error;
      return data;
    },
  });
  if (loading) return <p role="status">Loading account…</p>;
  if (!user) return <AccountForm />;
  return (
    <div className="space-y-4">
      <SessionBar />
      {conversation.isPending ? (
        <p role="status">Loading conversation…</p>
      ) : conversation.error ? (
        <div role="alert">
          <p>Could not load your conversation.</p>
          <Button variant="outline" onClick={() => conversation.refetch()}>
            <RefreshCw />
            Retry
          </Button>
        </div>
      ) : (
        <Transcript conversationId={conversation.data} />
      )}
    </div>
  );
}

export function Transcript({ conversationId }: { conversationId: string }) {
  const { user } = usePortfolioAuth();
  const queryClient = useQueryClient();
  const [limit, setLimit] = useState(100);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [online, setOnline] = useState(true);
  const [live, setLive] = useState(false);
  const textarea = useRef<HTMLTextAreaElement>(null);
  const end = useRef<HTMLDivElement>(null);
  const messages = useQuery({
    queryKey: ["messages", conversationId, limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return data.reverse();
    },
    refetchInterval: 10000,
  });
  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    const channel = supabase
      .channel(`chat-${conversationId}-${crypto.randomUUID()}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["messages", conversationId] });
          queryClient.invalidateQueries({ queryKey: ["inbox"] });
        },
      )
      .subscribe((status) => setLive(status === "SUBSCRIBED"));
    textarea.current?.focus();
    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, [conversationId, queryClient]);
  useEffect(() => {
    end.current?.scrollIntoView({ block: "nearest" });
    if (messages.data?.length)
      supabase
        .rpc("mark_conversation_read", { _conversation_id: conversationId })
        .then(({ error }) => {
          if (error) setError("Read status could not be updated.");
        });
  }, [messages.data, conversationId]);
  async function send(event: FormEvent) {
    event.preventDefault();
    setError("");
    if (!user || sending || !online) return;
    const parsed = messageSchema.safeParse(draft);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Check your message.");
      return;
    }
    setSending(true);
    const { error } = await supabase
      .from("messages")
      .insert({ conversation_id: conversationId, sender_id: user.id, body: parsed.data });
    if (error) setError(error.message);
    else {
      setDraft("");
      await messages.refetch();
      queryClient.invalidateQueries({ queryKey: ["inbox"] });
    }
    setSending(false);
    textarea.current?.focus();
  }
  return (
    <div className="space-y-3">
      <p role="status" className="text-xs text-muted-foreground">
        {!online
          ? "Offline — your draft is kept here."
          : live
            ? "Connected"
            : "Checking for replies every 10 seconds"}
      </p>
      <div
        className="h-72 overflow-y-auto pr-2"
        aria-label="Conversation messages"
        aria-live="polite"
      >
        {messages.isPending && <p role="status">Loading messages…</p>}
        {messages.error && (
          <div role="alert">
            <p>Messages could not be loaded.</p>
            <Button variant="outline" onClick={() => messages.refetch()}>
              <RefreshCw />
              Retry
            </Button>
          </div>
        )}
        {messages.data?.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-muted-foreground">
            <MessageCircle size={28} />
            <p>Start a conversation.</p>
            <p className="text-sm">Nehemiah will reply here.</p>
          </div>
        )}
        {messages.data && messages.data.length >= limit && (
          <Button variant="ghost" onClick={() => setLimit((n) => n + 100)}>
            Load earlier messages
          </Button>
        )}
        {messages.data?.map((m) => (
          <div
            key={m.id}
            className={`mb-4 flex ${m.sender_id === user?.id ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-lg px-4 py-3 ${m.sender_id === user?.id ? "bg-primary text-primary-foreground" : "border bg-secondary text-secondary-foreground"}`}
            >
              <p className="whitespace-pre-wrap break-words text-sm">{m.body}</p>
              <p className="mt-2 text-[11px] opacity-75">
                {new Date(m.created_at).toLocaleString([], {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
                {m.sender_id === user?.id && " · Sent"}
              </p>
            </div>
          </div>
        ))}
        <div ref={end} />
      </div>
      <form onSubmit={send} className="border-t pt-3">
        <Textarea
          ref={textarea}
          aria-label="Message"
          placeholder="Your message…"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          maxLength={4000}
          className="min-h-24 resize-none"
          disabled={sending}
        />
        <div className="mt-2 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">{draft.length}/4000</span>
          <Button className="h-11" disabled={!online || sending || !draft.trim()}>
            <Send />
            {sending ? "Sending…" : "Send"}
          </Button>
        </div>
        {error && (
          <p role="alert" className="mt-2 text-sm text-destructive">
            {error}
          </p>
        )}
      </form>
    </div>
  );
}

export function OwnerInbox() {
  const { user, loading } = usePortfolioAuth();
  const [selected, setSelected] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const role = useQuery({
    queryKey: ["owner-role", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("has_role", {
        _user_id: user?.id ?? "",
        _role: "owner",
      });
      if (error) throw error;
      return data;
    },
  });
  const inbox = useQuery({
    queryKey: ["inbox", user?.id, page],
    enabled: !!user && role.data === true,
    refetchInterval: 10000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("conversations")
        .select("*, messages(body,created_at,sender_id,read_at)")
        .order("updated_at", { ascending: false })
        .range(page * 50, page * 50 + 49)
        .order("created_at", { referencedTable: "messages", ascending: false })
        .limit(1, { referencedTable: "messages" });
      if (error) throw error;
      return data;
    },
  });
  return (
    <main className="relative z-10 mx-auto min-h-screen max-w-6xl px-5 py-10">
      <Button asChild variant="ghost">
        <Link to="/">
          <ArrowLeft />
          Portfolio
        </Link>
      </Button>
      <h1 className="my-8 text-3xl">Private inbox</h1>
      {loading ? (
        <p>Loading account…</p>
      ) : !user ? (
        <div className="max-w-md">
          <AccountForm />
        </div>
      ) : (
        <>
          <SessionBar />
          {role.isPending ? (
            <p className="py-8">Checking access…</p>
          ) : role.error ? (
            <p role="alert">Could not verify access. Try refreshing.</p>
          ) : !role.data ? (
            <p className="py-8" role="alert">
              This inbox is only available to the portfolio owner.
            </p>
          ) : (
            <div className="mt-8 grid gap-8 md:grid-cols-[320px_1fr]">
              <aside>
                <h2 className="mb-4 text-lg">Conversations</h2>
                {inbox.isPending && <p>Loading conversations…</p>}
                {inbox.error && (
                  <p role="alert">
                    Inbox unavailable. <Button onClick={() => inbox.refetch()}>Retry</Button>
                  </p>
                )}
                {inbox.data?.length === 0 && (
                  <p className="text-muted-foreground">No conversations yet.</p>
                )}
                {inbox.data?.map((c) => {
                  const last = c.messages[0];
                  return (
                    <Button
                      key={c.id}
                      variant={selected === c.id ? "secondary" : "ghost"}
                      className="mb-2 h-auto w-full items-start justify-start whitespace-normal border p-4 text-left"
                      onClick={() => setSelected(c.id)}
                    >
                      <span className="min-w-0">
                        <span className="block font-semibold">
                          {c.display_name}
                          {last && last.sender_id !== user.id && !last.read_at && (
                            <span className="ml-2 text-primary">• Unread</span>
                          )}
                        </span>
                        <span className="mt-1 block truncate text-xs text-muted-foreground">
                          {last?.body || "No messages"}
                        </span>
                        <span className="mt-2 block text-xs text-muted-foreground">
                          {new Date(c.updated_at).toLocaleString()}
                        </span>
                      </span>
                    </Button>
                  );
                })}
                <div className="mt-4 flex gap-2">
                  <Button
                    variant="outline"
                    disabled={page === 0}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    disabled={(inbox.data?.length ?? 0) < 50}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              </aside>
              <section className="min-w-0">
                {selected ? (
                  <Transcript key={selected} conversationId={selected} />
                ) : (
                  <p className="py-12 text-center text-muted-foreground">Select a conversation.</p>
                )}
              </section>
            </div>
          )}
        </>
      )}
    </main>
  );
}

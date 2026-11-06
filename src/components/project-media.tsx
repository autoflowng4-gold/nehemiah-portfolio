import { useRef, useState, type ChangeEvent } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Trash2, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { usePortfolioAuth } from "./auth-provider";

type ProjectMediaRow = {
  id: string;
  project_slug: string;
  media_type: "image" | "video";
  media_url: string;
  caption: string | null;
  storage_path: string;
  created_at: string;
};

const MAX_FILE_BYTES = 50 * 1024 * 1024; // 50MB
const ACCEPTED = "image/png,image/jpeg,image/webp,image/gif,video/mp4,video/webm,video/quicktime";

function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function useProjectMedia(projectSlug: string) {
  return useQuery({
    queryKey: ["project-media", projectSlug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_media")
        .select("*")
        .eq("project_slug", projectSlug)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as ProjectMediaRow[];
    },
  });
}

export function ProjectMediaGallery({ projectName }: { projectName: string }) {
  const slug = slugify(projectName);
  const { isOwner, ownerChecked } = usePortfolioAuth();
  const media = useProjectMedia(slug);
  const queryClient = useQueryClient();
  const [error, setError] = useState("");

  async function handleDelete(item: ProjectMediaRow) {
    setError("");
    const { error: storageError } = await supabase.storage
      .from("project-media")
      .remove([item.storage_path]);
    if (storageError) {
      setError(storageError.message);
      return;
    }
    const { error: dbError } = await supabase.from("project_media").delete().eq("id", item.id);
    if (dbError) {
      setError(dbError.message);
      return;
    }
    queryClient.invalidateQueries({ queryKey: ["project-media", slug] });
  }

  if (media.isPending) return null;
  if (media.error || !media.data?.length) {
    if (!ownerChecked || !isOwner) return null;
  }

  return (
    <div className="mt-8 space-y-4">
      {media.data && media.data.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {media.data.map((item) => (
            <figure key={item.id} className="relative overflow-hidden rounded-xl border bg-muted">
              {item.media_type === "image" ? (
                <img
                  src={item.media_url}
                  alt={item.caption ?? `${projectName} media`}
                  className="aspect-video w-full object-cover"
                  loading="lazy"
                />
              ) : (
                <video
                  src={item.media_url}
                  controls
                  className="aspect-video w-full bg-black object-contain"
                  preload="metadata"
                />
              )}
              {item.caption && (
                <figcaption className="px-3 py-2 text-sm text-muted-foreground">
                  {item.caption}
                </figcaption>
              )}
              {isOwner && (
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute right-2 top-2 h-8 w-8"
                  onClick={() => handleDelete(item)}
                  aria-label="Delete media"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </figure>
          ))}
        </div>
      )}
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      {isOwner && <ProjectMediaUploadForm slug={slug} />}
    </div>
  );
}

function ProjectMediaUploadForm({ slug }: { slug: string }) {
  const { user } = usePortfolioAuth();
  const queryClient = useQueryClient();
  const fileInput = useRef<HTMLInputElement>(null);
  const [caption, setCaption] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !user) return;
    setError("");
    setNotice("");
    if (file.size > MAX_FILE_BYTES) {
      setError("File is too large. Maximum size is 50MB.");
      return;
    }
    const mediaType: "image" | "video" = file.type.startsWith("video/") ? "video" : "image";
    if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
      setError("Only image and video files are supported.");
      return;
    }
    setBusy(true);
    try {
      const ext = file.name.includes(".") ? file.name.split(".").pop() : mediaType === "video" ? "mp4" : "jpg";
      const path = `${slug}/${crypto.randomUUID()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("project-media")
        .upload(path, file, { contentType: file.type, upsert: false });
      if (uploadError) throw uploadError;
      const { data: publicUrlData } = supabase.storage.from("project-media").getPublicUrl(path);
      const { error: insertError } = await supabase.from("project_media").insert({
        project_slug: slug,
        media_type: mediaType,
        media_url: publicUrlData.publicUrl,
        caption: caption.trim() || null,
        storage_path: path,
        created_by: user.id,
      });
      if (insertError) throw insertError;
      setCaption("");
      setNotice("Uploaded.");
      queryClient.invalidateQueries({ queryKey: ["project-media", slug] });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-xl border border-dashed p-4">
      <label className="block text-sm">
        Caption (optional, applies to next upload)
        <Textarea
          value={caption}
          onChange={(event) => setCaption(event.target.value)}
          maxLength={1000}
          rows={2}
          className="mt-2"
          placeholder="Describe this image or video…"
        />
      </label>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <input
          ref={fileInput}
          type="file"
          accept={ACCEPTED}
          onChange={handleFileChange}
          className="hidden"
          id={`media-upload-${slug}`}
        />
        <Button type="button" disabled={busy} onClick={() => fileInput.current?.click()}>
          <Upload className="h-4 w-4" />
          {busy ? "Uploading…" : "Upload image or video"}
        </Button>
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
        {notice && (
          <p role="status" className="text-sm text-primary">
            {notice}
          </p>
        )}
      </div>
    </div>
  );
}

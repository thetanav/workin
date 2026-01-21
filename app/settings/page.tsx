"use client";

import * as React from "react";
import Link from "next/link";

import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, ExternalLink, Timer, XCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

function timeAgo(timestamp: number) {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function ProfileSettingsPage() {
  const user = useQuery(api.users.current);
  const myActive = useQuery(api.checkins.getMyActiveCheckin);
  const updateProfile = useMutation(api.users.updateProfile);
  const stopCheckin = useMutation(api.checkins.stop);

  const [bio, setBio] = React.useState("");
  const [links, setLinks] = React.useState("");
  const [isSaving, setIsSaving] = React.useState(false);
  const [isStopping, setIsStopping] = React.useState(false);

  React.useEffect(() => {
    if (!user) return;
    setBio(user.bio ?? "");
    setLinks(Array.isArray(user.links) ? user.links.join(", ") : "");
  }, [user]);

  async function onSave() {
    if (!user) return;
    setIsSaving(true);
    try {
      await updateProfile({
        bio: bio.trim() || undefined,
        links: links
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      });
      toast.success("Profile updated");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to save";
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  }

  async function onStopSession() {
    if (!myActive) return;
    setIsStopping(true);
    try {
      await stopCheckin();
      toast.success("Session stopped");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to stop session";
      toast.error(msg);
    } finally {
      setIsStopping(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-sm text-muted-foreground">Manage your profile.</p>
        </div>
        {user && (
          <Button asChild variant="ghost" size="sm" className="gap-2">
            <Link href={`/p/${user._id}`}>
              View Public Page
              <ExternalLink size={14} />
            </Link>
          </Button>
        )}
      </div>

      <div className="grid gap-8">
        {!user ? (
          <div className="rounded-lg border border-dashed p-8 text-center">
             <p className="text-sm text-muted-foreground">Please sign in to view your settings.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {myActive && (
              <Card className="p-4 border-primary/20 bg-primary/5">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-primary flex items-center gap-2">
                        <Timer className="h-4 w-4" />
                        Active Session
                      </h3>
                      <Badge variant="outline" className="bg-background text-xs font-normal">
                        Started {timeAgo(myActive.startedAt)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                      {myActive.note || "No note provided."}
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="gap-2 shrink-0 ml-4"
                    onClick={onStopSession}
                    disabled={isStopping}
                  >
                    {isStopping ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <XCircle className="h-4 w-4" />
                    )}
                    Stop Session
                  </Button>
                </div>
              </Card>
            )}

            <div className="flex items-center gap-4 pb-6 border-b">
                <div className="h-16 w-16 rounded-full bg-muted overflow-hidden shrink-0 border">
                  {user.imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.imageUrl} alt={user.name} className="h-full w-full object-cover" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold">{user.name}</h3>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
            </div>

            <div className="grid gap-6">
              <div className="grid gap-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us what you're building..."
                  className="min-h-[100px] resize-none"
                />
                <p className="text-[10px] text-muted-foreground">
                  Brief description for your profile.
                </p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="links">Links</Label>
                <Input
                  id="links"
                  value={links}
                  onChange={(e) => setLinks(e.target.value)}
                  placeholder="github.com/u/..., twitter.com/..."
                />
                <p className="text-[10px] text-muted-foreground">Comma separated URLs</p>
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={onSave} disabled={isSaving}>
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
"use client";

import * as React from "react";
import Link from "next/link";

import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, ExternalLink, Timer, MapPin, Radio } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

function timeAgo(timestamp: number) {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function initials(name?: string) {
  const n = (name ?? "").trim();
  if (!n) return "?";
  const parts = n.split(/\s+/).filter(Boolean);
  const a = parts[0]?.[0] ?? "";
  const b = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
  return (a + b).toUpperCase();
}

export default function ProfileSettingsPage() {
  const user = useQuery(api.users.current);
  const myActive = useQuery(api.checkins.getMyActiveCheckin);
  const updateProfile = useMutation(api.users.updateProfile);
  const stopCheckin = useMutation(api.checkins.stop);

  const [bio, setBio] = React.useState("");
  const [links, setLinks] = React.useState("");
  const [defaultVisibility, setDefaultVisibility] = React.useState("public");
  const [defaultFuzzKm, setDefaultFuzzKm] = React.useState("0");
  const [defaultStatus, setDefaultStatus] = React.useState("Open to chat");
  const [isSaving, setIsSaving] = React.useState(false);
  const [isStopping, setIsStopping] = React.useState(false);

  React.useEffect(() => {
    if (!user) return;
    setBio(user.bio ?? "");
    setLinks(Array.isArray(user.links) ? user.links.join(", ") : "");
    if (user.defaultVisibility) setDefaultVisibility(user.defaultVisibility);
    if (user.defaultFuzzKm !== undefined) setDefaultFuzzKm(String(user.defaultFuzzKm));
    if (user.defaultStatus) setDefaultStatus(user.defaultStatus);
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
        defaultVisibility,
        defaultFuzzKm: Number.isFinite(Number.parseFloat(defaultFuzzKm))
          ? Math.max(0, Number.parseFloat(defaultFuzzKm))
          : undefined,
        defaultStatus: defaultStatus.trim() || undefined,
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

  if (user === undefined) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 md:py-12 pb-24">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            <p className="text-muted-foreground mt-1">
              Manage your profile and active sessions.
            </p>
          </div>
          {user && (
            <Button
              asChild
              variant="outline"
              size="sm"
              className="gap-2 w-full sm:w-auto"
            >
              <Link href={`/p/${user.clerkId}`}>
                View Public Page
                <ExternalLink size={14} />
              </Link>
            </Button>
          )}
        </div>

        {!user ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center p-8 text-center">
              <p className="text-sm text-muted-foreground">
                Please sign in to view your settings.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {myActive && (
              <Card className="border-primary/20 bg-primary/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                  <Radio className="h-24 w-24 text-primary" />
                </div>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2 text-primary">
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                      </span>
                      Active Session
                    </CardTitle>
                    <Badge variant="secondary" className="font-mono text-xs">
                      {timeAgo(myActive.startedAt)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-4">
                    <div className="space-y-1">
                      <div className="flex items-start gap-2 text-sm font-medium">
                        <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                        <span>{myActive.placeName || "Unknown Location"}</span>
                      </div>
                      {myActive.note && (
                        <p className="text-sm text-muted-foreground pl-6">
                          &ldquo;{myActive.note}&rdquo;
                        </p>
                      )}
                    </div>

                    <div className="flex justify-end pt-2">
                      <Button
                        variant="destructive"
                        size="sm"
                        className="w-full sm:w-auto gap-2"
                        onClick={onStopSession}
                        disabled={isStopping}
                      >
                        {isStopping ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Timer className="h-4 w-4" />
                        )}
                        Stop Session
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="border-none p-0 shadow-none">
              <CardContent className="space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <Avatar className="h-12 w-12 border">
                    <AvatarImage src={user.imageUrl} alt={user.name} />
                    <AvatarFallback>{initials(user.name)}</AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <h3 className="font-medium leading-none">{user.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label>Default Status</Label>
                    <Select value={defaultStatus} onValueChange={setDefaultStatus}>
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Open to chat">Open to chat</SelectItem>
                        <SelectItem value="Deep work">Deep work</SelectItem>
                        <SelectItem value="Heads down">Heads down</SelectItem>
                        <SelectItem value="Pairing">Pairing</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Default Visibility</Label>
                    <Select value={defaultVisibility} onValueChange={setDefaultVisibility}>
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Select visibility" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="nearby">Nearby only</SelectItem>
                        <SelectItem value="private">Private</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="default-fuzz">Default Location Fuzz (km)</Label>
                    <Input
                      id="default-fuzz"
                      type="number"
                      min="0"
                      step="0.1"
                      value={defaultFuzzKm}
                      onChange={(e) => setDefaultFuzzKm(e.target.value)}
                    />
                    <p className="text-[10px] text-muted-foreground">
                      Offsets your map pin by this distance.
                    </p>
                  </div>
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
                      inputMode="url"
                    />
                    <p className="text-[10px] text-muted-foreground">
                      Comma separated URLs
                    </p>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    onClick={onSave}
                    disabled={isSaving}
                    className="w-full sm:w-auto"
                  >
                    {isSaving && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

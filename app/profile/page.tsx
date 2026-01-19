"use client";

import * as React from "react";

import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function ProfilePage() {
  const user = useQuery(api.users.current);
  const updateProfile = useMutation(api.users.updateProfile);

  const [bio, setBio] = React.useState("");
  const [links, setLinks] = React.useState("");
  const [isSaving, setIsSaving] = React.useState(false);

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
      toast.success("Profile saved");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to save";
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl p-6">
      <Card className="border-border/60 bg-card/40 p-8 backdrop-blur-sm">
        {!user ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Please sign in to view your profile.</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center gap-4 border-b border-border/40 pb-6">
              <div className="h-16 w-16 rounded-full bg-muted overflow-hidden">
                {user.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.imageUrl} alt={user.name} className="h-full w-full object-cover" />
                )}
              </div>
              <div>
                <h2 className="text-xl font-semibold">{user.name}</h2>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us what you're building..."
                  className="min-h-[100px] resize-none bg-background/50"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="links">Links</Label>
                <Input
                  id="links"
                  value={links}
                  onChange={(e) => setLinks(e.target.value)}
                  placeholder="github.com/u/..., twitter.com/..."
                  className="bg-background/50"
                />
                <p className="text-[10px] text-muted-foreground">Comma separated URLs</p>
              </div>

              <div className="pt-4 flex justify-end">
                <Button onClick={onSave} disabled={isSaving}>
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
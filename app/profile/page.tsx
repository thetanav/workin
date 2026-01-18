"use client";

import * as React from "react";

import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

import { Shell } from "@/components/app/shell";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

import { localUserId } from "@/lib/id";

export default function ProfilePage() {
  const userId = React.useMemo(() => localUserId(), []);

  const profile = useQuery(api.profiles.getByUserId, { userId }) as any;
  const upsert = useMutation(api.profiles.upsert);

  const [name, setName] = React.useState("Your name");
  const [handle, setHandle] = React.useState("builder");
  const [bio, setBio] = React.useState("");
  const [links, setLinks] = React.useState("");
  const [skills, setSkills] = React.useState("");

  React.useEffect(() => {
    if (!profile) return;
    setName(profile.name ?? "Your name");
    setHandle(profile.handle ?? "builder");
    setBio(profile.bio ?? "");
    setLinks(Array.isArray(profile.links) ? profile.links.join(", ") : "");
    setSkills(Array.isArray(profile.skills) ? profile.skills.join(", ") : "");
  }, [profile]);

  async function onSave() {
    try {
      await upsert({
        userId,
        name: name.trim() || "Anonymous",
        handle: handle.trim() || undefined,
        bio: bio.trim() || undefined,
        links: links
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        skills: skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      });
      toast.success("Profile saved");
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to save");
    }
  }

  return (
    <Shell
      title="Profile"
      subtitle="MVP: profile editing UI. Next step: persist to Convex profiles table."
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
        <Card className="border-border/60 bg-card/40 p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium">Edit</p>
              <p className="text-sm text-muted-foreground">
                Public creator profile used for trust.
              </p>
            </div>
            <Badge variant="secondary">MVP</Badge>
          </div>

          <div className="mt-5 grid gap-4">
            <div className="grid gap-2">
              <label className="text-xs text-muted-foreground">Name</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <label className="text-xs text-muted-foreground">Handle</label>
              <Input value={handle} onChange={(e) => setHandle(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <label className="text-xs text-muted-foreground">Bio</label>
              <Textarea value={bio} onChange={(e) => setBio(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <label className="text-xs text-muted-foreground">Links</label>
              <Input
                value={links}
                onChange={(e) => setLinks(e.target.value)}
                placeholder="comma separated"
              />
            </div>
            <div className="grid gap-2">
              <label className="text-xs text-muted-foreground">Skills</label>
              <Input
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="comma separated"
              />
            </div>

            <div className="flex items-center gap-2">
              <Button onClick={onSave}>Save</Button>
              <Button
                variant="secondary"
                onClick={() => toast("Public profile soon")}
              >
                Preview
              </Button>
            </div>
          </div>
        </Card>

        <Card className="border-border/60 bg-card/40 p-5">
          <p className="text-sm font-medium">Local user</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Auth not added yet. This is a local, stable id.
          </p>
          <p className="mt-4 rounded-md border border-border/60 bg-background/40 p-3 font-mono text-xs">
            {userId}
          </p>
        </Card>
      </div>
    </Shell>
  );
}

"use client";

import * as React from "react";

import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

import { Shell } from "@/components/app/shell";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function ProfilePage() {
  const profile = useQuery(api.profiles.getMe);
  const upsert = useMutation(api.profiles.upsert);

  const [name, setName] = React.useState("");
  const [handle, setHandle] = React.useState("");
  const [bio, setBio] = React.useState("");
  const [github, setGithub] = React.useState("");
  const [twitter, setTwitter] = React.useState("");
  const [links, setLinks] = React.useState("");
  const [skills, setSkills] = React.useState("");

  React.useEffect(() => {
    if (!profile) return;
    setName(profile.name ?? "");
    setHandle(profile.handle ?? "");
    setBio(profile.bio ?? "");
    setGithub(profile.github ?? "");
    setTwitter(profile.twitter ?? "");
    setLinks(Array.isArray(profile.links) ? profile.links.join(", ") : "");
    setSkills(Array.isArray(profile.skills) ? profile.skills.join(", ") : "");
  }, [profile]);

  async function onSave() {
    if (!profile) {
      toast.error("Please sign in to save profile");
      return;
    }
    try {
      await upsert({
        userId: profile.userId!,
        name: name.trim() || "Anonymous",
        handle: handle.trim() || undefined,
        bio: bio.trim() || undefined,
        github: github.trim() || undefined,
        twitter: twitter.trim() || undefined,
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
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to save";
      toast.error(msg);
    }
  }

  return (
    <Shell
      title="Profile"
      subtitle="Manage your public builder profile."
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
            {/* <Badge variant="secondary">MVP</Badge> */}
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
            <div className="grid grid-cols-2 gap-4">
               <div className="grid gap-2">
                <label className="text-xs text-muted-foreground">GitHub</label>
                <Input value={github} onChange={(e) => setGithub(e.target.value)} placeholder="username" />
               </div>
               <div className="grid gap-2">
                <label className="text-xs text-muted-foreground">X / Twitter</label>
                <Input value={twitter} onChange={(e) => setTwitter(e.target.value)} placeholder="username" />
               </div>
            </div>
            <div className="grid gap-2">
              <label className="text-xs text-muted-foreground">Other Links</label>
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
              <Button onClick={onSave} disabled={!profile}>Save</Button>
            </div>
          </div>
        </Card>

        {profile && (
            <Card className="border-border/60 bg-card/40 p-5">
            <p className="text-sm font-medium">Your ID</p>
            <p className="mt-1 text-sm text-muted-foreground">
                Internal user ID.
            </p>
            <p className="mt-4 rounded-md border border-border/60 bg-background/40 p-3 font-mono text-xs">
                {profile.userId}
            </p>
            </Card>
        )}
      </div>
    </Shell>
  );
}

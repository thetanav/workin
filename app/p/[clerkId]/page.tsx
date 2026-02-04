"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ExternalLink, Github, Mail, Globe } from "lucide-react";

export default function UserProfile({
  params,
}: {
  params: Promise<{ clerkId: string }>;
}) {
  const { clerkId } = React.use(params);

  const user = useQuery(api.users.getByClerkId, { clerkId });

  const isLoading = user === undefined;
  const notFound = user === null;

  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center">
        <span className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center gap-4">
        <p className="text-xl font-medium text-muted-foreground">
          User not found
        </p>
        <Button asChild variant="secondary">
          <Link href="/">Return Home</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex items-center justify-center p-4">
      <Card className="overflow-hidden border-border/50 bg-card/60 w-full max-w-xl">
        <CardContent className="relative pt-0 pb-8 px-8">
          <Avatar className="h-32 w-32">
            <AvatarImage src={user.imageUrl} alt={user.name} />
            <AvatarFallback className="text-3xl rounded-2xl">
              {user.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="pt-10 space-y-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight display-font">
                {user.name}
              </h1>
              {user.email && (
                <p className="text-muted-foreground flex items-center gap-2 mt-1">
                  <Mail size={14} />
                  {user.email}
                </p>
              )}
            </div>

            {user.bio && (
              <div className="prose prose-sm dark:prose-invert max-w-none text-foreground/90">
                <p className="whitespace-pre-wrap leading-relaxed">
                  {user.bio}
                </p>
              </div>
            )}

            {user.links && user.links.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {user.links.map((link, i) => {
                  const url = link.startsWith("http")
                    ? link
                    : `https://${link}`;
                  const isGithub = link.includes("github.com");
                  return (
                    <Button
                      key={i}
                      variant="secondary"
                      size="sm"
                      asChild
                      className="gap-2 rounded-full px-4 h-8 bg-secondary/50 hover:bg-secondary"
                    >
                      <a href={url} target="_blank" rel="noopener noreferrer">
                        {isGithub ? <Github size={14} /> : <Globe size={14} />}
                        <span className="font-normal">
                          {new URL(url).hostname}
                        </span>
                        <ExternalLink size={12} className="opacity-50" />
                      </a>
                    </Button>
                  );
                })}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import * as React from "react";
import { useMutation } from "convex/react";
import { Authenticated, Unauthenticated } from "convex/react";
import { SignInButton, UserButton } from "@clerk/nextjs";

import { api } from "@/convex/_generated/api";

function StoreUserOnAuth() {
  const store = useMutation(api.profiles.store);
  const didRun = React.useRef(false);

  React.useEffect(() => {
    if (didRun.current) return;
    didRun.current = true;

    store().catch((err) => {
      console.error("profiles.store failed", err);
    });
  }, [store]);

  return null;
}

export default function AuthComp() {
  return (
    <>
      <Authenticated>
        <StoreUserOnAuth />
        <UserButton />
      </Authenticated>
      <Unauthenticated>
        <SignInButton />
      </Unauthenticated>
    </>
  );
}

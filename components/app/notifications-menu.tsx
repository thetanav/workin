"use client";

import * as React from "react";
import { Bell } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Id } from "@/convex/_generated/dataModel";

export function NotificationsMenu() {
  const notifications = useQuery(api.notifications.getMyNotifications);
  const markAsRead = useMutation(api.notifications.markAsRead);
  const clearAll = useMutation(api.notifications.clearAll);

  const unreadCount = notifications?.length ?? 0;

  const handleMarkAsRead = async (id: Id<"notifications">) => {
    try {
      await markAsRead({ notificationId: id });
    } catch (error) {
      console.error(error);
      toast.error("Failed to mark as read");
    }
  };

  const handleClearAll = async () => {
    try {
      await clearAll();
      toast.success("All notifications cleared");
    } catch (error) {
      console.error(error);
      toast.error("Failed to clear notifications");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-600 ring-2 ring-background" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto px-2 text-xs"
              onClick={handleClearAll}
            >
              Clear all
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications === undefined ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            Loading...
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            No new notifications
          </div>
        ) : (
          notifications.map((n) => (
            <DropdownMenuItem
              key={n._id}
              className="flex items-start gap-3 p-3 cursor-pointer"
              onSelect={(e) => {
                e.preventDefault();
                handleMarkAsRead(n._id);
              }}
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={n.imagePayloadUrl} />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium leading-none">
                  {n.type === "say-hello"
                    ? "Someone said Hello! 👋"
                    : "New notification"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(n.createdAt).toLocaleTimeString()}
                </p>
              </div>
              <div className="ml-auto h-2 w-2 rounded-full bg-blue-500" />
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  CheckCheck,
  AlertTriangle,
  AlertCircle,
  Info,
  ExternalLink,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  NotificationRecord,
  NotificationSeverity,
} from "@/lib/types/notification";
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "@/lib/services/notification-service";

export function NotificationCenter() {
  const router = useRouter();
  const [isOpen, setIsOpen] = React.useState(false);
  const [notifications, setNotifications] = React.useState<
    NotificationRecord[]
  >([]);
  const [filterTab, setFilterTab] = React.useState<"ALL" | "UNREAD">("ALL");

  const loadNotifications = React.useCallback(async () => {
    const list = await getNotifications();
    setNotifications(list);
  }, []);

  React.useEffect(() => {
    loadNotifications();
  }, [loadNotifications, isOpen]);

  const unreadCount = React.useMemo(() => {
    return notifications.filter((n) => n.status === "UNREAD").length;
  }, [notifications]);

  const displayedNotifications = React.useMemo(() => {
    if (filterTab === "UNREAD") {
      return notifications.filter((n) => n.status === "UNREAD");
    }
    return notifications;
  }, [notifications, filterTab]);

  const handleNotificationClick = async (notif: NotificationRecord) => {
    if (notif.status === "UNREAD") {
      await markNotificationAsRead(notif.id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, status: "READ" } : n)),
      );
    }
    if (notif.actionUrl) {
      setIsOpen(false);
      router.push(notif.actionUrl);
    }
  };

  const handleMarkAllRead = async () => {
    await markAllNotificationsAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, status: "READ" })));
  };

  const getSeverityIcon = (severity: NotificationSeverity) => {
    switch (severity) {
      case "CRITICAL":
        return (
          <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
        );
      case "WARNING":
        return (
          <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
        );
      case "INFO":
      default:
        return <Info className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />;
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="subtle"
          size="sm"
          className="relative h-8 w-8 p-0 rounded-md text-neutral-600 hover:text-neutral-900 cursor-pointer"
          title="Pusat Notifikasi Operasional"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white shadow-xs animate-pulse">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-80 sm:w-96 p-0 shadow-lg border border-neutral-200 rounded-lg overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2.5 bg-neutral-50/80 border-b border-neutral-200/80">
          <div className="flex items-center gap-2">
            <span className="font-bold text-xs text-neutral-900">
              Notifikasi Sistem
            </span>
            {unreadCount > 0 && (
              <span className="text-[10px] bg-rose-100 text-rose-800 font-bold px-1.5 py-0.2 rounded-full">
                {unreadCount} Baru
              </span>
            )}
          </div>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllRead}
              className="text-[11px] text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 cursor-pointer transition-colors"
            >
              <CheckCheck className="h-3 w-3" />
              Tandai Semua Dibaca
            </button>
          )}
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-1 px-3 py-1.5 bg-neutral-100/60 border-b border-neutral-200 text-xs">
          <button
            type="button"
            onClick={() => setFilterTab("ALL")}
            className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
              filterTab === "ALL"
                ? "bg-white text-neutral-900 shadow-2xs"
                : "text-neutral-500 hover:text-neutral-900"
            }`}
          >
            Semua ({notifications.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterTab("UNREAD")}
            className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
              filterTab === "UNREAD"
                ? "bg-white text-neutral-900 shadow-2xs"
                : "text-neutral-500 hover:text-neutral-900"
            }`}
          >
            Belum Dibaca ({unreadCount})
          </button>
        </div>

        {/* Notification List */}
        <div className="max-h-80 overflow-y-auto divide-y divide-neutral-100">
          {displayedNotifications.length === 0 ? (
            <div className="p-6 text-center text-xs text-neutral-400">
              Tidak ada notifikasi {filterTab === "UNREAD" ? "baru" : ""}.
            </div>
          ) : (
            displayedNotifications.map((notif) => {
              const isUnread = notif.status === "UNREAD";
              return (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`p-3 flex items-start gap-2.5 transition-colors cursor-pointer ${
                    isUnread
                      ? "bg-blue-50/40 hover:bg-blue-50/70"
                      : "bg-white hover:bg-neutral-50"
                  }`}
                >
                  {getSeverityIcon(notif.severity)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h4
                        className={`text-xs truncate ${
                          isUnread
                            ? "font-bold text-neutral-900"
                            : "font-medium text-neutral-700"
                        }`}
                      >
                        {notif.title}
                      </h4>
                      {isUnread && (
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-600 shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] text-neutral-600 line-clamp-2 mt-0.5">
                      {notif.message}
                    </p>
                    <div className="flex items-center justify-between mt-1 text-[10px] text-neutral-400">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(notif.createdAt).toLocaleTimeString("id-ID", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      {notif.actionUrl && (
                        <span className="flex items-center gap-0.5 text-blue-600 font-medium hover:underline">
                          Lihat Detail
                          <ExternalLink className="h-2.5 w-2.5" />
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-2 border-t border-neutral-200 bg-neutral-50/60 text-center">
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              router.push("/admin/audit-logs");
            }}
            className="text-[11px] text-neutral-600 hover:text-neutral-900 font-medium cursor-pointer"
          >
            Lihat Audit Trail & Log Sistem &rarr;
          </button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

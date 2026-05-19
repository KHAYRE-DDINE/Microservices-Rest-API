"use client";

import { useEffect, useRef, useState } from "react";
import { Bell, Check, CreditCard, Loader2, XCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";

type Notification = {
  id: string | number;
  title: string;
  message: string;
  status?: string;
  timestamp?: string;
  createdAt?: string;
};

type StompFrame = {
  command: string;
  headers: Record<string, string>;
  body: string;
};

const maxNotifications = 50;

function getWebSocketUrl() {
  if (process.env.NEXT_PUBLIC_PAYMENT_WS_URL) return process.env.NEXT_PUBLIC_PAYMENT_WS_URL;
  if (typeof window === "undefined") return "ws://localhost:8084/ws/notifications-native";
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  return `${protocol}//${window.location.hostname}:8084/ws/notifications-native`;
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [connected, setConnected] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const clientRef = useRef<WebSocket | null>(null);
  const reconnectRef = useRef<number | null>(null);
  const bufferRef = useRef("");

  useEffect(() => {
    // Fetch historical notifications
    async function fetchNotifications() {
      try {
        const response = await fetch("/api/backend/payment/api/notifications/admin");
        if (response.ok) {
          const data = await response.json();
          setNotifications(data.map((n: any) => ({
            ...n,
            timestamp: n.createdAt
          })));
        }
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      }
    }

    void fetchNotifications();

    let stopped = false;

    function sendFrame(command: string, headers: Record<string, string> = {}, body = "") {
      const socket = clientRef.current;
      if (!socket || socket.readyState !== WebSocket.OPEN) return;
      const headerLines = Object.entries(headers).map(([key, value]) => `${key}:${value}`);
      socket.send(`${command}\n${headerLines.join("\n")}\n\n${body}\0`);
    }

    function handleFrame(frame: StompFrame) {
      if (frame.command === "CONNECTED") {
        setConnected(true);
        sendFrame("SUBSCRIBE", { id: "payments", destination: "/topic/payments" });
        sendFrame("SUBSCRIBE", { id: "admin-alerts", destination: "/topic/admin/alerts" });
        return;
      }

      if (frame.command !== "MESSAGE" || !frame.body) return;

      try {
        const payload = JSON.parse(frame.body);
        const isAlert = Boolean(payload.type);
        const notification: Notification = {
          id: `${payload.paymentId ?? "event"}-${payload.timestamp ?? Date.now()}-${Math.random()}`,
          title: isAlert ? "Payment Alert" : `Payment #${payload.paymentId ?? ""}`,
          message: payload.message ?? payload.reason ?? "Payment notification received",
          status: payload.status ?? payload.type,
          timestamp: payload.timestamp,
        };

        setNotifications((current) => [notification, ...current].slice(0, maxNotifications));
        setUnread((current) => current + 1);
        toast(isAlert ? "Payment alert received" : "Payment notification received", {
          description: notification.message,
        });
      } catch {
        toast.error("Received an unreadable payment notification");
      }
    }

    function parseFrames(chunk: string) {
      bufferRef.current += chunk;
      const rawFrames = bufferRef.current.split("\0");
      bufferRef.current = rawFrames.pop() ?? "";

      rawFrames.forEach((rawFrame) => {
        const frameText = rawFrame.trimStart();
        if (!frameText) return;
        const [head, ...bodyParts] = frameText.split("\n\n");
        const [command, ...headerLines] = head.split("\n");
        const headers = Object.fromEntries(
          headerLines
            .filter(Boolean)
            .map((line) => {
              const separator = line.indexOf(":");
              return separator === -1 ? [line, ""] : [line.slice(0, separator), line.slice(separator + 1)];
            }),
        );
        handleFrame({ command, headers, body: bodyParts.join("\n\n") });
      });
    }

    function connect() {
      const socket = new WebSocket(getWebSocketUrl());
      clientRef.current = socket;

      socket.onopen = () => {
        sendFrame("CONNECT", {
          "accept-version": "1.2",
          "heart-beat": "10000,10000",
        });
      };

      socket.onmessage = (event) => {
        if (typeof event.data === "string") parseFrames(event.data);
      };

      socket.onclose = () => {
        setConnected(false);
        if (!stopped) reconnectRef.current = window.setTimeout(connect, 3000);
      };

      socket.onerror = () => {
        setConnected(false);
      };
    }

    connect();

    return () => {
      stopped = true;
      if (reconnectRef.current) window.clearTimeout(reconnectRef.current);
      sendFrame("DISCONNECT");
      clientRef.current?.close();
    };
  }, []);

  function toggleOpen() {
    setOpen((current) => !current);
    setUnread(0);
  }

  async function deleteNotification(id: string | number) {
    try {
      // If it's a number, it's a persisted notification
      if (typeof id === "number") {
        const response = await fetch(`/api/backend/payment/api/notifications/${id}`, {
          method: "DELETE",
        });
        if (!response.ok) throw new Error("Delete failed");
      }
      
      setNotifications((current) => current.filter((n) => n.id !== id));
      toast.success("Notification deleted");
    } catch {
      toast.error("Failed to delete notification");
    }
  }

  return (
    <div className="relative">
      <button onClick={toggleOpen} className="relative flex h-10 w-10 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900" title="Notifications">
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute right-1 top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-xs font-bold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-50 w-96 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
            <div>
              <h2 className="text-sm font-bold text-gray-900">Notifications</h2>
              <p className="text-xs text-gray-500">{connected ? "WebSocket connected" : "Connecting to payment service"}</p>
            </div>
            {connected ? <Check className="h-5 w-5 text-green-600" /> : <Loader2 className="h-5 w-5 animate-spin text-gray-400" />}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-6 py-10 text-center text-gray-500">
                <CreditCard className="mb-2 h-8 w-8 opacity-50" />
                <p className="text-sm">No payment notifications yet.</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div key={notification.id} className="group border-b border-gray-100 px-4 py-3 last:border-0 hover:bg-gray-50">
                  <div className="flex items-start gap-3">
                    <div className={`mt-1 rounded-md p-1.5 ${notification.status === "FAILED" || notification.status === "PAYMENT_FAILED" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                      {notification.status === "FAILED" || notification.status === "PAYMENT_FAILED" ? <XCircle className="h-4 w-4" /> : <CreditCard className="h-4 w-4" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between">
                        <p className="text-sm font-semibold text-gray-900">{notification.title}</p>
                        <button 
                          onClick={() => deleteNotification(notification.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-600 transition"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="mt-1 text-sm text-gray-600">{notification.message}</p>
                      {notification.timestamp && <p className="mt-1 text-xs text-gray-400">{new Date(notification.timestamp).toLocaleString()}</p>}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

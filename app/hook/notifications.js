'use client';

import { useEffect, useState } from 'react';

export function useNotifications(isAuthenticated, initialNotifications = []) {
  const [notifications, setNotifications] = useState(initialNotifications);

  // Update state when initial notifications are loaded
  useEffect(() => {
    setNotifications(initialNotifications);
  }, [initialNotifications]);

  useEffect(() => {
    if (!isAuthenticated) return;

    console.log("🚀 Connecting WebSocket...");

    const socket = new WebSocket(
      'ws://localhost:8000/ws/notifications/'
    );

    socket.onopen = () => {
      console.log('✅ WebSocket Connected!');
    };

    socket.onmessage = (event) => {
      console.log("🔥 RAW WEBSOCKET:", event.data);

      try {
        const raw = JSON.parse(event.data);

        console.log("🔥 ACTION:", raw.action);
        console.log("🔥 CONTENT:", raw.content);

        if (raw.action === "create") {
          setNotifications((prev) => [
            raw.content,
            ...prev
          ]);
        }

        else if (raw.action === "update") {
          setNotifications((prev) =>
            prev.map((item) =>
              item.id === raw.content.id
                ? raw.content
                : item
            )
          );
        }

        else if (raw.action === "delete") {
          setNotifications((prev) =>
            prev.filter(
              (item) => item.id !== raw.content.id
            )
          );
        }

      } catch (error) {
        console.error(
          "❌ WebSocket JSON error:",
          error
        );
      }
    };

    socket.onclose = (event) => {
      console.log(
        `🔌 WS Connection Closed. Code: ${event.code}, Reason: ${event.reason || 'None'
        }`
      );
    };

    socket.onerror = (error) => {
      console.error(
        '❌ WebSocket error:',
        error
      );
    };

    return () => socket.close();

  }, [isAuthenticated]);

  return {
    notifications
  };
}
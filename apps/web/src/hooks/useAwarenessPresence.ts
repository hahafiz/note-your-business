import { useEffect, useState } from "react";
import { WebsocketProvider } from "y-websocket";

export interface PresenceUser {
  clientId: number;
  name: string;
  color?: string;
}

export function useAwarenessPresence(provider: WebsocketProvider | null) {
  const [activeUsers, setActiveUsers] = useState<PresenceUser[]>([]);

  useEffect(() => {
    if (!provider) return;

    const awareness = provider.awareness;

    awareness.setLocalStateField("user", {
      name: `User ${awareness.clientID.toString().slice(0, 4)}`,
      color: "#" + Math.floor(Math.random() * 16777215).toString(16),
    });

    const handleAwarenessChange = () => {
      const states = awareness.getStates();
      const users: PresenceUser[] = [];

      states.forEach((state, clientId) => {
        if (state.user) {
          users.push({
            clientId,
            name: state.user.name,
            color: state.user.color,
          });
        }
      });

      setActiveUsers(users);
    };

    awareness.on("change", handleAwarenessChange);
    handleAwarenessChange(); // initial map evaluation

    return () => {
      awareness.off("change", handleAwarenessChange);
    };
  }, [provider]);

  return { activeUsers };
}

import { useEffect, useState } from "react";
import { WebsocketProvider } from "y-websocket";

export interface PresenceUser {
  clientId: number;
  name: string;
  color?: string;
}

export interface CurrentUser {
  name: string;
}

export function useAwarenessPresence(
  provider: WebsocketProvider | null,
  currentUser: string | null | undefined,
) {
  const [activeUsers, setActiveUsers] = useState<PresenceUser[]>([]);

  useEffect(() => {
    if (!provider || !currentUser) return;

    const awareness = provider.awareness;

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
  }, [provider, currentUser]);

  return { activeUsers };
}

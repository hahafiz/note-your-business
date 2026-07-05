// LIFETIME MANAGEMENT OF Y.Doc and WebSocketProvider

import { useEffect, useMemo, useState } from "react";
import { WebsocketProvider } from "y-websocket";
import * as Y from "yjs";

export interface UseYjsProviderResult {
  doc: Y.Doc;
  provider: WebsocketProvider | null;
}

export function useYjsProvider(id: string | undefined): UseYjsProviderResult {
  const [provider, setProvider] = useState<WebsocketProvider | null>(null);

  // create doc one (survives re-renders)
  const doc = useMemo(() => new Y.Doc(), []);

  useEffect(() => {
    if (!id) return;

    const wsUrl = import.meta.env.VITE_WS_URL || "ws://localhost:1234";
    const wsProvider = new WebsocketProvider(wsUrl, id, doc);

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setProvider(wsProvider);

    return () => {
      wsProvider.disconnect();
      setProvider(null);
    };
  }, [id, doc]);

  return { doc, provider };
}

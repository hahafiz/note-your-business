import { createServer } from "http";
import { WebSocketServer } from "ws";
import { setupWSConnection } from "y-websocket/bin/utils";

const port = process.env.PORT ? parseInt(process.env.PORT) : 1234;

const server = createServer((req, res) => {
  if (req.url === "/healthz") {
    res.writeHead(200);
    res.end("ok");
  }
});

// create the standard websocket server
const wss = new WebSocketServer({ server });

wss.on("connection", (ws, req) => {
  try {
    // extract the room name from the URL path
    const roomName = req.url?.slice(1) || "default-room";

    // let y-websocket handle document sync
    setupWSConnection(ws as any, req, { docName: roomName });
    console.log(`User connected to room ${roomName}`);
  } catch (err) {
    console.error("Failed to setup WS connection: ", err);
    ws.close();
  }
});

server.listen(port, () => {
  console.log(`y-websocket server is running on port ${port}`);
});

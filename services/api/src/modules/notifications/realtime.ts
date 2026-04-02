import { Response } from 'express';

type SseEventPayload = Record<string, unknown>;

type SseClient = {
  res: Response;
  heartbeat: NodeJS.Timeout;
};

class NotificationSseHub {
  private clientsByUser = new Map<string, Set<SseClient>>();

  private write(client: SseClient, event: string, payload: SseEventPayload) {
    if (client.res.writableEnded || client.res.destroyed) {
      return;
    }

    client.res.write(`event: ${event}\n`);
    client.res.write(`data: ${JSON.stringify(payload)}\n\n`);
  }

  private cleanup(userId: string, client: SseClient) {
    clearInterval(client.heartbeat);

    const bucket = this.clientsByUser.get(userId);
    if (!bucket) return;

    bucket.delete(client);
    if (bucket.size === 0) {
      this.clientsByUser.delete(userId);
    }
  }

  addClient(userId: string, res: Response) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders?.();

    const heartbeat = setInterval(() => {
      try {
        res.write(`event: ping\n`);
        res.write(`data: {"ts":"${new Date().toISOString()}"}\n\n`);
      } catch {
        // Connection cleanup is handled by close/error listeners.
      }
    }, 25_000);

    const client: SseClient = { res, heartbeat };
    const bucket = this.clientsByUser.get(userId) || new Set<SseClient>();
    bucket.add(client);
    this.clientsByUser.set(userId, bucket);

    this.write(client, 'connected', {
      ok: true,
      ts: new Date().toISOString(),
    });

    res.on('close', () => this.cleanup(userId, client));
    res.on('error', () => this.cleanup(userId, client));
  }

  emitToUser(userId: string, event: string, payload: SseEventPayload) {
    const bucket = this.clientsByUser.get(userId);
    if (!bucket || bucket.size === 0) return;

    for (const client of bucket) {
      if (client.res.writableEnded || client.res.destroyed) {
        this.cleanup(userId, client);
        continue;
      }

      try {
        this.write(client, event, payload);
      } catch {
        this.cleanup(userId, client);
      }
    }
  }
}

export const notificationSseHub = new NotificationSseHub();

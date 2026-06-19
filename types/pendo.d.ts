interface Window {
  pendo?: {
    track: (eventName: string, properties?: Record<string, unknown>) => void;
    trackAgent: (eventType: string, metadata: object) => void;
  };
}

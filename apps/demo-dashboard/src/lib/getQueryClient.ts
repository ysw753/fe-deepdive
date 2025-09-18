import { QueryClient } from '@tanstack/react-query';

let client: QueryClient | null = null;

export default function getQueryClient() {
  if (!client) {
    client = new QueryClient();
  }
  return client;
}

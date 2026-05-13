import { api } from './api';

export const pushApi = {
  getVapidPublicKey: async () => {
    const response = await api.get<{ publicKey: string | null }>('/push/vapid-public-key');
    return response.data;
  },

  subscribeUser: async (subscription: any) => {
    const response = await api.post('/push/subscribe', subscription);
    return response.data;
  },
};

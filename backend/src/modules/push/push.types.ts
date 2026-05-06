export interface SubscribeDto {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface SendPushDto {
  title: string;
  body: string;
  url?: string;
}

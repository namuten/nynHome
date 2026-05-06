import webpush from 'web-push';

webpush.setVapidDetails(
  `mailto:${process.env.ADMIN_EMAIL ?? 'admin@crochub.dev'}`,
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!,
);

export { webpush };

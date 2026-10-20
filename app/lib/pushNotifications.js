const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  return Uint8Array.from(rawData, (char) => char.charCodeAt(0));
}

export async function enableAdminPushNotifications(adminApi) {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    throw new Error("Push notifications are not supported by this browser.");
  }

  if (!VAPID_PUBLIC_KEY) {
    throw new Error("The public VAPID key is not configured.");
  }

  if (!window.isSecureContext) {
    throw new Error("Push notifications require HTTPS or localhost.");
  }

  const permission = await Notification.requestPermission();

  if (permission !== "granted") {
    throw new Error("Browser notification permission was not granted.");
  }

  const registration = await navigator.serviceWorker.register("/sw.js");
  await navigator.serviceWorker.ready;

  let subscription = await registration.pushManager.getSubscription();

  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });
  }

  const json = subscription.toJSON();

  await adminApi.post("http://localhost:8000/api/notifications/admin/push-subscription/", {
    endpoint: json.endpoint,
    p256dh: json.keys?.p256dh,
    auth: json.keys?.auth,
    user_agent: navigator.userAgent,
  });

  return subscription;
}

export async function disableAdminPushNotifications(adminApi) {
  const registration = await navigator.serviceWorker.getRegistration("/sw.js");

  if (!registration) return;

  const subscription = await registration.pushManager.getSubscription();

  if (!subscription) return;

  await adminApi.delete("http://localhost:8000/api/notifications/admin/push-subscription/", {
    data: { endpoint: subscription.endpoint },
  });

  await subscription.unsubscribe();
}
import api from "../api/api";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

const CUSTOMER_SUBSCRIPTION_URL =
  "/api/notifications/customer/push-subscription/";

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const output = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; i += 1) {
    output[i] = rawData.charCodeAt(i);
  }

  return output;
}

export async function enableCustomerPushNotifications() {
  if (
    !("serviceWorker" in navigator) ||
    !("PushManager" in window) ||
    !("Notification" in window)
  ) {
    throw new Error(
      "Your browser does not support push notifications."
    );
  }

  if (!window.isSecureContext) {
    throw new Error(
      "Push notifications require HTTPS or localhost."
    );
  }

  if (!VAPID_PUBLIC_KEY) {
    throw new Error(
      "The public VAPID key is missing. Configure NEXT_PUBLIC_VAPID_PUBLIC_KEY."
    );
  }

  let permission = Notification.permission;

  if (permission !== "granted") {
    permission = await Notification.requestPermission();
  }

  if (permission !== "granted") {
    throw new Error(
      "Notification permission was not granted. Allow notifications in your browser settings."
    );
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

  const subscriptionData = subscription.toJSON();

  if (!subscriptionData.endpoint ||
      !subscriptionData.keys?.p256dh ||
      !subscriptionData.keys?.auth) {
    throw new Error(
      "The browser returned an incomplete push subscription."
    );
  }

  // Save the subscription for the currently authenticated customer.
  // The backend will reject a subscription already owned by another account.
  await api.post(CUSTOMER_SUBSCRIPTION_URL, {
    endpoint: subscriptionData.endpoint,
    p256dh: subscriptionData.keys.p256dh,
    auth: subscriptionData.keys.auth,
    user_agent: navigator.userAgent,
  });

  return subscription;
}

/**
 * Browser Push & Notification Helper
 * Asks for user notification permission and triggers browser/desktop push popups
 * when important user events (likes, comments, outfit reminders) occur.
 */

export const requestNotificationPermission = async () => {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return false;
  }
  if (Notification.permission === "granted") {
    return true;
  }
  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  }
  return false;
};

export const showBrowserNotification = (title, message, options = {}) => {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return;
  }
  if (Notification.permission === "granted") {
    try {
      new Notification(title, {
        body: message,
        icon: "/favicon.ico",
        badge: "/favicon.ico",
        tag: options.tag || "stylemate-notification",
        ...options,
      });
    } catch (err) {
      console.log("Browser notification popup error:", err);
    }
  }
};

import { useCallback, useContext } from "react";
import { NotificationContext } from "../contexts/notification";
import { AlertColor } from "@mui/material/Alert";

export interface SendNotificationOptions {
  severity: AlertColor,
  message: string,
  duration: number
}

export const useNotification = () => {
  const {
    severity,
    setSeverity,
    message,
    setMessage,
    duration,
    setDuration,
    notificationOpened,
    setNotificationOpened
  } = useContext(NotificationContext);

  const sendNotification = useCallback(({ severity, message, duration }: SendNotificationOptions) => {
    setNotificationOpened(true);
    setSeverity(severity);
    setMessage(message);
    setDuration(duration);
  }, [setDuration, setMessage, setNotificationOpened, setSeverity]);

  const closeNotification = useCallback(() => {
    setNotificationOpened(false);
  }, [setNotificationOpened]);

  return {
    notificationOpened,
    severity,
    message,
    duration,
    sendNotification,
    closeNotification
  };
};
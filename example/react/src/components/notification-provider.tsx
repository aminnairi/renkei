import { ReactNode, useMemo, useState } from "react";
import { NotificationContext } from "../contexts/notification";
import { AlertColor } from "@mui/material/Alert";

export interface NotificationProviderProps {
  children: ReactNode
}

export const NotificationProvider = ({ children }: NotificationProviderProps) => {
  const [severity, setSeverity] = useState<AlertColor>("success");
  const [message, setMessage] = useState("");
  const [duration, setDuration] = useState(5000);
  const [notificationOpened, setNotificationOpened] = useState(false);

  const value = useMemo(() => {
    return {
      notificationOpened,
      setNotificationOpened,
      severity,
      setSeverity,
      message,
      setMessage,
      duration,
      setDuration
    };
  }, [duration, message, notificationOpened, severity]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
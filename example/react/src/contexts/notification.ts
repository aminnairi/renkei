import { AlertColor } from "@mui/material/Alert";
import { createContext, Dispatch, SetStateAction } from "react";

export interface NotificationContextInterface {
  notificationOpened: boolean,
  setNotificationOpened: Dispatch<SetStateAction<boolean>>,
  severity: AlertColor,
  setSeverity: Dispatch<SetStateAction<AlertColor>>
  message: string,
  setMessage: Dispatch<SetStateAction<string>>
  duration: number
  setDuration: Dispatch<SetStateAction<number>>
}

export const NotificationContext = createContext<NotificationContextInterface>({
  notificationOpened: false,
  setNotificationOpened: () => {},
  severity: "success",
  setSeverity: () => {},
  message: "",
  setMessage: () => {},
  duration: 5000,
  setDuration: () => {}
});
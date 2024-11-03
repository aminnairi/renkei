import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import { useNotification } from "../hooks/notification";

export const Notification = () => {
  const { severity, duration, message, notificationOpened, closeNotification } = useNotification();

  return (
    <Snackbar open={notificationOpened} onClose={closeNotification} autoHideDuration={duration}>
      <Alert severity={severity} variant="filled">
        {message}
      </Alert>
    </Snackbar>
  );
};
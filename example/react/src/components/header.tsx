import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";

export const Header = () => {
  return (
    <AppBar>
      <Toolbar>
        <Typography variant="h4">
          Renkei
        </Typography>
      </Toolbar>
    </AppBar>
  );
};
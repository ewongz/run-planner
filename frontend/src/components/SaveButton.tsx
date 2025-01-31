import React from "react";
import { IconButton } from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";

interface SaveButtonProps {
  onSave: () => void;
}

const SaveButton: React.FC<SaveButtonProps> = ({ onSave }) => {
  return (
    <IconButton color="primary" onClick={onSave} disableRipple>
      <SaveIcon fontSize="large"/>
    </IconButton>
  );
};

export default SaveButton;

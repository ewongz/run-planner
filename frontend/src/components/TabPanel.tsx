import React from "react";
import Box from '@mui/material/Box';

interface TabPanelProps {
    children?: React.ReactNode;
    index: any;
    value: any;
  }
  
export function TabPanel(props: TabPanelProps) {
const { children, value, index, ...other } = props;
return (
    <div
    role="tabpanel"
    hidden={value !== index}
    id={`simple-tabpanel-${index}`}
    aria-labelledby={`simple-tab-${index}`}
    {...other}
    >
    {value === index && (
        <Box
        component="form"
        sx={{ m: 8,
              p: 2,
              display: "flex",
              alignItems: "flex-start",
              minHeight: "100vh"
                // width: "25ch",
            }}
        >
        {children}
        </Box>
    )}
    </div>
);
}
//@ts-check
import React from "react";
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

interface WorkoutPace {
    "Percentage of Pace": number;
    "Designation": string;
    "Pace": string;
  }
  
  interface PaceTableProps {
    workoutPaces: WorkoutPace[];
  }

function PaceTable({ workoutPaces }: PaceTableProps){
    return (
        <TableContainer component={Paper}>
        <Table sx={{ maxWidth:650 }} size="small">
          {workoutPaces.length > 0 && (<TableHead>
            <TableRow>
              <TableCell align="left">Percentage of Pace</TableCell>
              <TableCell align="left">Designation</TableCell>
              <TableCell align="left">Pace</TableCell>
            </TableRow>
          </TableHead>)}
          <TableBody>
            {workoutPaces.map((row: WorkoutPace) => (
              <TableRow
                key={row["Percentage of Pace"]}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell align="left">
                  {`${row["Percentage of Pace"]}%`}
                </TableCell>
                <TableCell align="left">{row["Designation"]}</TableCell>
                <TableCell align="left">{row["Pace"]}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      )
  }
  
export default PaceTable;
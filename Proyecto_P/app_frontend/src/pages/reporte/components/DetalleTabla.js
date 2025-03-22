import React from 'react';
import { Typography, Table, TableBody, TableCell, TableRow, TableContainer, Paper, Divider, TableHead } from '@mui/material';

const DetalleTabla = ({ title, data, columns }) => {
  if (!data || data.length === 0) return null;

  return (
    <>
      <Typography variant="h6" color="secondary" gutterBottom>
        {title}
      </Typography>
      <TableContainer component={Paper} sx={{ mb: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              {columns.map((col, index) => (
                <TableCell key={index} align={col.align || 'left'}sx={{ color: 'white' }}  >
                  {col.label || col.field}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((item, idx) => (
              <TableRow key={idx}>
                {columns.map((col, i) => (
                  <TableCell key={i} align={col.align || 'left'}>
                    {item[col.field] !== undefined && item[col.field] !== null
                      ? item[col.field]
                      : 'Desconocido'}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Divider sx={{ my: 2 }} />
    </>
  );
};

export default DetalleTabla;

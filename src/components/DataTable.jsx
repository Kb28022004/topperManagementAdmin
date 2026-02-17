import React, { memo } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    TablePagination,
    Box,
    Typography,
    LinearProgress
} from '@mui/material';

const DataTable = ({
    columns,
    data,
    isLoading,
    isFetching,
    pagination,
    onPageChange,
    onRowsPerPageChange,
    noDataMessage = "No data found",
    noDataIcon: NoDataIcon,
    sx = {}
}) => {
    return (
        <Box sx={{ width: '100%', ...sx }}>
            {isFetching && !isLoading && (
                <LinearProgress sx={{ mb: 1, bgcolor: '#2c3039', '& .MuiLinearProgress-bar': { bgcolor: '#448aff' } }} />
            )}

            <TableContainer component={Paper} sx={{ bgcolor: "#1e2129", color: "white", borderRadius: 3, border: '1px solid #2c3039' }}>
                <Table sx={{ minWidth: 650 }}>
                    <TableHead sx={{ bgcolor: "#2c3039" }}>
                        <TableRow>
                            {columns.map((column) => (
                                <TableCell
                                    key={column.id}
                                    sx={{
                                        fontWeight: "bold",
                                        color: "#8b9bb4",
                                        borderBottom: "1px solid #3d4250"
                                    }}
                                >
                                    {column.label}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={columns.length} sx={{ py: 10, textAlign: 'center' }}>
                                    <LinearProgress sx={{ width: '50%', mx: 'auto', bgcolor: '#2c3039', '& .MuiLinearProgress-bar': { bgcolor: '#448aff' } }} />
                                    <Typography sx={{ mt: 2, color: '#8b9bb4' }}>Loading data...</Typography>
                                </TableCell>
                            </TableRow>
                        ) : !data || data.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={columns.length} sx={{ py: 10, textAlign: 'center' }}>
                                    <Box sx={{ opacity: 0.5, mb: 2 }}>
                                        {NoDataIcon && <NoDataIcon sx={{ fontSize: 60, color: '#448aff' }} />}
                                    </Box>
                                    <Typography sx={{ color: '#8b9bb4' }}>{noDataMessage}</Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            data.map((row, index) => (
                                <TableRow
                                    key={row._id || index}
                                    sx={{
                                        "&:last-child td, &:last-child th": { border: 0 },
                                        "& td, & th": { borderBottom: "1px solid #2c3039", color: "white" }
                                    }}
                                >
                                    {columns.map((column) => (
                                        <TableCell key={column.id}>
                                            {column.render ? column.render(row) : row[column.id]}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {pagination && (
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={pagination.total || 0}
                    rowsPerPage={pagination.limit || 10}
                    page={(pagination.page || 1) - 1}
                    onPageChange={(e, newPage) => onPageChange(newPage + 1)}
                    onRowsPerPageChange={(e) => onRowsPerPageChange(parseInt(e.target.value, 10))}
                    sx={{
                        color: "#8b9bb4",
                        ".MuiTablePagination-selectIcon": { color: "#8b9bb4" },
                        ".MuiTablePagination-actions": { color: "#8b9bb4" }
                    }}
                />
            )}
        </Box>
    );
};

export default memo(DataTable);

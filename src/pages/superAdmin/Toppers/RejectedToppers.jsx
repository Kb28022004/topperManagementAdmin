import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
    Box,
    Typography,
    Paper,
    Stack,
    TextField,
    Chip,
    Button,
    Tooltip
} from "@mui/material";
import { useGetPendingToppersQuery } from "../../../feature/api/adminApi";
import DataTable from "../../../components/DataTable";
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

const RejectedToppers = () => {
    const token = useMemo(() => localStorage.getItem("authToken"), []);
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    const [filters, setFilters] = useState({
        expertiseClass: "",
        stream: "",
        board: ""
    });

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 500);
        return () => clearTimeout(timer);
    }, [search]);

    const { data, isLoading, isFetching } = useGetPendingToppersQuery({
        token,
        page,
        limit: rowsPerPage,
        search: debouncedSearch,
        ...filters,
        status: "REJECTED"
    }, { skip: !token });

    const columns = useMemo(() => [
        { id: 'name', label: 'Name', render: (row) => `${row.firstName} ${row.lastName}` },
        { id: 'expertiseClass', label: 'Class' },
        { id: 'stream', label: 'Stream', render: (row) => row.stream || "N/A" },
        {
            id: 'avg',
            label: 'Avg (%)',
            render: (row) => row.subjectMarks?.length > 0
                ? (row.subjectMarks.reduce((a, b) => a + b.marks, 0) / row.subjectMarks.length).toFixed(1) + "%"
                : "N/A"
        },
        { id: 'phone', label: 'Phone', render: (row) => row.userId?.phone || "N/A" },
        {
            id: 'reason',
            label: 'Rejection Reason',
            render: (row) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" sx={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {row.adminRemark || "No reason provided"}
                    </Typography>
                    {row.adminRemark && (
                        <Tooltip title={row.adminRemark}>
                            <InfoOutlinedIcon sx={{ fontSize: 16, color: '#8b9bb4', cursor: 'pointer' }} />
                        </Tooltip>
                    )}
                </Box>
            )
        },
        {
            id: 'status',
            label: 'Status',
            render: (row) => (
                <Chip label={row.status} size="small" sx={{ bgcolor: '#f5656520', color: '#f56565', borderRadius: 1 }} />
            )
        }
    ], []);

    const handleFilterChange = useCallback((e) => {
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
        setPage(1);
    }, []);

    const handlePageChange = useCallback((newPage) => setPage(newPage), []);
    const handleRowsPerPageChange = useCallback((newLimit) => setRowsPerPage(newLimit), []);

    return (
        <Box sx={{ p: 4, bgcolor: "#14171d", minHeight: "100vh" }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" sx={{ color: "white", fontWeight: "bold", mb: 1 }}>
                    Rejected Toppers
                </Typography>
                <Typography variant="body1" sx={{ color: "#8b9bb4" }}>
                    Toppers who did not meet the academic criteria ({data?.pagination?.total || 0}).
                </Typography>
            </Box>

            <Paper elevation={0} sx={{ p: 3, bgcolor: "#1e2129", borderRadius: 3, mb: 3, border: '1px solid #2c3039' }}>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                    <TextField
                        label="Search by Name"
                        variant="outlined"
                        size="small"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        sx={{
                            bgcolor: "#2c3039", borderRadius: 1, input: { color: "white" },
                            label: { color: "#8b9bb4" }, "& .MuiOutlinedInput-root fieldset": { borderColor: "#3d4250" },
                            flexGrow: 1
                        }}
                    />
                    <select
                        name="expertiseClass"
                        value={filters.expertiseClass}
                        onChange={handleFilterChange}
                        style={{ padding: "10px", backgroundColor: "#2c3039", color: "white", border: "1px solid #3d4250", borderRadius: "4px" }}
                    >
                        <option value="">All Classes</option>
                        <option value="10">Class 10</option>
                        <option value="12">Class 12</option>
                    </select>
                </Stack>
            </Paper>

            <DataTable
                columns={columns}
                data={data?.data}
                isLoading={isLoading}
                isFetching={isFetching}
                pagination={data?.pagination}
                onPageChange={handlePageChange}
                onRowsPerPageChange={handleRowsPerPageChange}
                noDataMessage="No rejected toppers found"
                noDataIcon={CancelOutlinedIcon}
            />
        </Box>
    );
};

export default RejectedToppers;

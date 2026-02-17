import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
    Box,
    Typography,
    Paper,
    Stack,
    TextField,
    Chip,
    Button
} from "@mui/material";
import { useGetPendingToppersQuery } from "../../../feature/api/adminApi";
import DataTable from "../../../components/DataTable";
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

const ApprovedToppers = () => {
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
        status: "APPROVED"
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
        {
            id: 'marksheet',
            label: 'Marksheet',
            render: (row) => row.marksheetUrl ? (
                <Button component="a" href={row.marksheetUrl} target="_blank" variant="outlined" size="small">
                    View PDF
                </Button>
            ) : "N/A"
        },
        { id: 'phone', label: 'Phone', render: (row) => row.userId?.phone || "N/A" },
        {
            id: 'status',
            label: 'Status',
            render: (row) => (
                <Chip label={row.status} size="small" sx={{ bgcolor: '#48bb7820', color: '#48bb78', borderRadius: 1 }} />
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
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h4" sx={{ color: "white", fontWeight: "bold", mb: 1 }}>
                        Approved Toppers
                    </Typography>
                    <Typography variant="body1" sx={{ color: "#8b9bb4" }}>
                        Managing {data?.pagination?.total || 0} verified toppers.
                    </Typography>
                </Box>
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
                noDataMessage="No approved toppers found"
                noDataIcon={CheckCircleOutlineIcon}
            />
        </Box>
    );
};

export default ApprovedToppers;

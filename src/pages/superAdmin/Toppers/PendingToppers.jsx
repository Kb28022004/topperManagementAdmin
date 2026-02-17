import React, { useEffect, useMemo, useCallback } from "react";
import {
    Box,
    Typography,
    Paper,
    Button,
    Stack,
    CircularProgress,
    TextField,
    IconButton
} from "@mui/material";
import {
    useGetPendingToppersQuery,
    useApproveTopperMutation,
    useRejectTopperMutation
} from "../../../feature/api/adminApi";
import toast from "react-hot-toast";
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import RefreshIcon from '@mui/icons-material/Refresh';
import ConfirmationModal from "../../../components/ConfirmationModal";
import DataTable from "../../../components/DataTable";

const PendingToppers = () => {
    const token = useMemo(() => localStorage.getItem("authToken"), []);

    useEffect(() => {
        if (!token) {
            window.location.href = "/send-otp";
        }
    }, [token]);

    const [page, setPage] = React.useState(1);
    const [rowsPerPage, setRowsPerPage] = React.useState(10);
    const [search, setSearch] = React.useState("");
    const [filters, setFilters] = React.useState({
        expertiseClass: "",
        stream: ""
    });

    const [modalConfig, setModalConfig] = React.useState({
        open: false,
        type: '',
        id: null,
        title: '',
        message: '',
        confirmText: '',
        confirmColor: 'primary',
        showReasonField: false
    });

    const [debouncedSearch, setDebouncedSearch] = React.useState(search);
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    const { data, isLoading, isFetching, error: getError, refetch } = useGetPendingToppersQuery({
        token,
        page,
        limit: rowsPerPage,
        search: debouncedSearch,
        expertiseClass: filters.expertiseClass,
        stream: filters.stream,
        status: "PENDING"
    }, { skip: !token });

    const [approveTopper, {
        data: approveData,
        isLoading: isApproving,
        isSuccess: isApproveSuccess,
        isError: isApproveError,
        error: approveError
    }] = useApproveTopperMutation();

    const [rejectTopper, {
        data: rejectData,
        isLoading: isRejecting,
        isSuccess: isRejectSuccess,
        isError: isRejectError,
        error: rejectError
    }] = useRejectTopperMutation();

    const handleApprove = useCallback((id) => {
        setModalConfig({
            open: true,
            type: 'approve',
            id,
            title: 'Approve Topper',
            message: 'Are you sure you want to approve this topper? They will be verified and allowed to sell notes.',
            confirmText: 'Approve',
            confirmColor: 'primary',
            showReasonField: false
        });
    }, []);

    const handleReject = useCallback((id) => {
        setModalConfig({
            open: true,
            type: 'reject',
            id,
            title: 'Reject Topper',
            message: 'Please provide a reason for rejecting this topper profile.',
            confirmText: 'Reject',
            confirmColor: 'error',
            showReasonField: true
        });
    }, []);

    const handleConfirmAction = useCallback(async (reason) => {
        const { type, id } = modalConfig;
        try {
            if (type === 'approve') {
                await approveTopper({ id, token }).unwrap();
            } else {
                await rejectTopper({ id, reason, token }).unwrap();
            }
            setModalConfig(prev => ({ ...prev, open: false }));
        } catch (error) {
            console.log(error);
        }
    }, [modalConfig, approveTopper, rejectTopper, token]);

    const handleFilterChange = useCallback((e) => {
        setFilters(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
        setPage(1);
    }, []);

    const handleCloseModal = useCallback(() => setModalConfig(prev => ({ ...prev, open: false })), []);

    useEffect(() => {
        if (isApproveError && approveError) {
            toast.error(approveError?.data?.message || "Failed to approve topper");
        }
        if (isApproveSuccess) {
            toast.success(approveData?.message || "Topper approved successfully");
            refetch();
        }
    }, [isApproveError, approveError, isApproveSuccess, approveData, refetch]);

    useEffect(() => {
        if (isRejectError && rejectError) {
            toast.error(rejectError?.data?.message || "Failed to reject topper");
        }
        if (isRejectSuccess) {
            toast.success(rejectData?.message || "Topper rejected successfully");
            refetch();
        }
    }, [isRejectError, rejectError, isRejectSuccess, rejectData, refetch]);

    const columns = useMemo(() => [
        { id: 'name', label: 'Name', render: (row) => `${row.firstName} ${row.lastName}` },
        { id: 'expertiseClass', label: 'Class' },
        { id: 'stream', label: 'Stream', render: (row) => row.stream || "N/A" },
        {
            id: 'marks',
            label: 'Subjects & Marks',
            render: (row) => (
                <Stack spacing={0.5}>
                    {row.subjectMarks?.map((sub, index) => (
                        <Box key={index} sx={{ display: 'flex', gap: 1.5, fontSize: '0.82rem' }}>
                            <Box component="span" sx={{ color: '#8b9bb4', minWidth: '70px' }}>{sub.subject}:</Box>
                            <Box component="span" sx={{ fontWeight: 'bold', color: 'white' }}>{sub.marks}</Box>
                        </Box>
                    ))}
                </Stack>
            )
        },
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
                <Button
                    href={row.marksheetUrl} target="_blank" variant="outlined" size="small"
                    sx={{ textTransform: 'none', borderColor: '#448aff', color: '#448aff' }}
                >
                    View PDF
                </Button>
            ) : "N/A"
        },
        { id: 'phone', label: 'Phone', render: (row) => row.userId?.phone || "N/A" },
        {
            id: 'actions',
            label: 'Actions',
            render: (row) => (
                <Stack direction="row" spacing={1}>
                    <Button
                        variant="contained" size="small"
                        onClick={() => handleApprove(row._id)}
                        disabled={isApproving || isRejecting}
                        sx={{ textTransform: 'none', borderRadius: 2, bgcolor: '#448aff' }}
                    >
                        Approve
                    </Button>
                    <Button
                        variant="outlined" size="small" color="error"
                        onClick={() => handleReject(row._id)}
                        disabled={isApproving || isRejecting}
                        sx={{ textTransform: 'none', borderRadius: 2 }}
                    >
                        Reject
                    </Button>
                </Stack>
            )
        }
    ], [handleApprove, handleReject, isApproving, isRejecting]);

    if (isLoading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4, minHeight: "100vh", bgcolor: "#14171d", alignItems: "center" }}>
                <CircularProgress />
            </Box>
        );
    }

    if (getError) {
        return (
            <Box sx={{ p: 4, minHeight: "100vh", bgcolor: "#14171d" }}>
                <Typography color="error">Error loading pending toppers: {getError.message}</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 4, bgcolor: "#14171d", minHeight: "100vh" }}>
            <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                    <Typography variant="h4" sx={{ color: "white", fontWeight: "bold", mb: 1 }}>
                        Pending Toppers
                    </Typography>
                    <Typography variant="body1" sx={{ color: "#8b9bb4" }}>
                        Review academic criteria and approve topper applications.
                    </Typography>
                </Box>
                <IconButton
                    onClick={() => refetch()}
                    disabled={isFetching}
                    sx={{ color: "white", bgcolor: "rgba(255,255,255,0.05)", "&:hover": { bgcolor: "rgba(255,255,255,0.1)" } }}
                >
                    <RefreshIcon sx={{ animation: isFetching ? "spin 1s linear infinite" : "none", "@keyframes spin": { "0%": { transform: "rotate(0deg)" }, "100%": { transform: "rotate(360deg)" } } }} />
                </IconButton>
            </Box>

            <Paper elevation={0} sx={{ p: 3, bgcolor: "#1e2129", borderRadius: 3, mb: 3, border: '1px solid #2c3039' }}>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
                    <TextField
                        label="Search by Name" variant="outlined" size="small"
                        value={search} onChange={(e) => setSearch(e.target.value)}
                        sx={{
                            bgcolor: "#2c3039", borderRadius: 1,
                            input: { color: "white" }, label: { color: "#8b9bb4" },
                            "& .MuiOutlinedInput-root fieldset": { borderColor: "#3d4250" },
                            flexGrow: 1
                        }}
                    />
                    <select
                        name="expertiseClass" value={filters.expertiseClass} onChange={handleFilterChange}
                        style={{ padding: "10px", backgroundColor: "#2c3039", color: "white", border: "1px solid #3d4250", borderRadius: "4px", outline: "none" }}
                    >
                        <option value="">All Classes</option>
                        <option value="10">Class 10</option>
                        <option value="12">Class 12</option>
                    </select>
                    <select
                        name="stream" value={filters.stream} onChange={handleFilterChange}
                        style={{ padding: "10px", backgroundColor: "#2c3039", color: "white", border: "1px solid #3d4250", borderRadius: "4px", outline: "none" }}
                    >
                        <option value="">All Streams</option>
                        <option value="Science">Science</option>
                        <option value="Commerce">Commerce</option>
                        <option value="Arts">Arts</option>
                    </select>
                </Stack>
            </Paper>

            <DataTable
                columns={columns}
                data={data?.data}
                isLoading={isLoading}
                isFetching={isFetching}
                pagination={data?.pagination}
                onPageChange={setPage}
                onRowsPerPageChange={setRowsPerPage}
                noDataMessage="No pending topper applications"
                noDataIcon={AssignmentTurnedInIcon}
            />

            <ConfirmationModal
                open={modalConfig.open}
                onClose={handleCloseModal}
                onConfirm={handleConfirmAction}
                title={modalConfig.title}
                message={modalConfig.message}
                confirmText={modalConfig.confirmText}
                confirmColor={modalConfig.confirmColor}
                showReasonField={modalConfig.showReasonField}
                isLoading={isApproving || isRejecting}
            />
        </Box>
    );
};

export default PendingToppers;

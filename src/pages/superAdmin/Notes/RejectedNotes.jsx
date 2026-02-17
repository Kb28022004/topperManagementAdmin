import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
    Box,
    Typography,
    Paper,
    Button,
    Chip,
    CircularProgress,
    Stack,
    IconButton,
    TextField
} from "@mui/material";
import {
    useGetPendingNotesQuery,
    useApproveNoteMutation
} from "../../../feature/api/adminApi";
import toast from "react-hot-toast";
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import RefreshIcon from '@mui/icons-material/Refresh';
import ConfirmationModal from "../../../components/ConfirmationModal";
import DataTable from "../../../components/DataTable";

const RejectedNotes = () => {
    const navigate = useNavigate();
    const token = useMemo(() => localStorage.getItem("authToken"), []);

    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 500);
        return () => clearTimeout(timer);
    }, [search]);

    const { data: notes, isLoading, isFetching, refetch } = useGetPendingNotesQuery(
        { token, status: 'REJECTED', search: debouncedSearch },
        { skip: !token }
    );

    const [approveNote, {
        data: approveData,
        isLoading: isApproving,
        isSuccess: isApproveSuccess,
        isError: isApproveError,
        error: approveError
    }] = useApproveNoteMutation();

    const [modalConfig, setModalConfig] = useState({
        open: false,
        id: null,
        title: '',
        message: '',
        confirmText: '',
        confirmColor: 'primary'
    });

    const handleApprove = useCallback((id) => {
        setModalConfig({
            open: true,
            id,
            title: 'Approve Rejected Note',
            message: 'Are you sure you want to approve this previously rejected note? It will be published for students.',
            confirmText: 'Approve',
            confirmColor: 'primary'
        });
    }, []);

    const handleConfirmAction = useCallback(async () => {
        const { id } = modalConfig;
        try {
            await approveNote({ id, token }).unwrap();
            setModalConfig(prev => ({ ...prev, open: false }));
        } catch (err) {
            console.log(err);
        }
    }, [modalConfig, approveNote, token]);

    const handleCloseModal = useCallback(() => setModalConfig(prev => ({ ...prev, open: false })), []);

    useEffect(() => {
        if (isApproveError && approveError) {
            toast.error(approveError?.data?.message || "Failed to approve note");
        }
        if (isApproveSuccess) {
            toast.success(approveData?.message || "Note approved successfully");
            refetch();
        }
    }, [isApproveError, approveError, isApproveSuccess, approveData, refetch]);

    const columns = useMemo(() => [
        { id: 'title', label: 'Title' },
        { id: 'subject', label: 'Subject' },
        { id: 'class', label: 'Class', render: (row) => row.class || "N/A" },
        { id: 'price', label: 'Price', render: (row) => row.price ? `₹${row.price}` : "Free" },
        { id: 'topper', label: 'Topper', render: (row) => `${row.topperId?.firstName || 'Unknown'} ${row.topperId?.lastName || ''}` },
        {
            id: 'status',
            label: 'Status',
            render: (row) => (
                <Chip label="Rejected" size="small" sx={{ bgcolor: '#ff525220', color: '#ff5252', borderRadius: 1 }} />
            )
        },
        {
            id: 'actions',
            label: 'Actions',
            render: (row) => (
                <Stack direction="row" spacing={1}>
                    <Button
                        variant="contained" size="small"
                        onClick={() => navigate(`/superAdmin/notes/review/${row._id}`)}
                        sx={{ textTransform: 'none', borderRadius: 2, bgcolor: '#ff914d' }}
                    >
                        View
                    </Button>
                    <Button
                        variant="contained" size="small"
                        onClick={() => handleApprove(row._id)}
                        disabled={isApproving}
                        sx={{ textTransform: 'none', borderRadius: 2, bgcolor: '#448aff' }}
                    >
                        Approve
                    </Button>
                </Stack>
            )
        }
    ], [navigate, handleApprove, isApproving]);

    return (
        <Box sx={{ p: 4, bgcolor: "#14171d", minHeight: "100vh" }}>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h4" sx={{ color: "white", fontWeight: "bold", mb: 1 }}>
                        Rejected Notes
                    </Typography>
                    <Typography variant="body1" sx={{ color: "#8b9bb4" }}>
                        View all study materials that were rejected.
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

            <Paper elevation={0} sx={{ p: 2, bgcolor: "#1e2129", borderRadius: 3, mb: 3, border: '1px solid #2c3039' }}>
                <TextField
                    fullWidth
                    placeholder="Search by title or subject..."
                    variant="outlined"
                    size="small"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    sx={{
                        bgcolor: "#2c3039", borderRadius: 1,
                        input: { color: "white" },
                        "& .MuiOutlinedInput-root fieldset": { borderColor: "#3d4250" },
                    }}
                />
            </Paper>

            <DataTable
                columns={columns}
                data={notes?.data}
                isLoading={isLoading}
                isFetching={isFetching}
                noDataMessage="No rejected study notes found"
                noDataIcon={CancelOutlinedIcon}
            />

            <ConfirmationModal
                open={modalConfig.open}
                onClose={handleCloseModal}
                onConfirm={handleConfirmAction}
                title={modalConfig.title}
                message={modalConfig.message}
                confirmText={modalConfig.confirmText}
                confirmColor={modalConfig.confirmColor}
                isLoading={isApproving}
            />
        </Box>
    );
};

export default RejectedNotes;

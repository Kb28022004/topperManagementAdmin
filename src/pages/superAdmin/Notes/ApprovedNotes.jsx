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
    useRejectNoteMutation
} from "../../../feature/api/adminApi";
import toast from "react-hot-toast";
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import RefreshIcon from '@mui/icons-material/Refresh';
import ConfirmationModal from "../../../components/ConfirmationModal";
import DataTable from "../../../components/DataTable";

const ApprovedNotes = () => {
    const navigate = useNavigate();
    const token = useMemo(() => localStorage.getItem("authToken"), []);

    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 500);
        return () => clearTimeout(timer);
    }, [search]);

    const { data: notes, isLoading, isFetching, refetch } = useGetPendingNotesQuery(
        { token, status: 'PUBLISHED', search: debouncedSearch },
        { skip: !token }
    );

    const [rejectNote, {
        data: rejectData,
        isLoading: isRejecting,
        isSuccess: isRejectSuccess,
        isError: isRejectError,
        error: rejectError
    }] = useRejectNoteMutation();

    const [modalConfig, setModalConfig] = useState({
        open: false,
        id: null,
        title: '',
        message: '',
        confirmText: '',
        confirmColor: 'primary',
        showReasonField: false
    });

    const handleReject = useCallback((id) => {
        setModalConfig({
            open: true,
            id,
            title: 'Reject Approved Note',
            message: 'Are you sure you want to unpublish and reject this note?',
            confirmText: 'Reject',
            confirmColor: 'error',
            showReasonField: true
        });
    }, []);

    const handleConfirmAction = useCallback(async (reason) => {
        const { id } = modalConfig;
        try {
            await rejectNote({ id, reason, token }).unwrap();
            setModalConfig(prev => ({ ...prev, open: false }));
        } catch (err) {
            console.log(err);
        }
    }, [modalConfig, rejectNote, token]);

    const handleCloseModal = useCallback(() => setModalConfig(prev => ({ ...prev, open: false })), []);

    useEffect(() => {
        if (isRejectError && rejectError) {
            toast.error(rejectError?.data?.message || "Failed to reject note");
        }
        if (isRejectSuccess) {
            toast.success(rejectData?.message || "Note rejected successfully");
            refetch();
        }
    }, [isRejectError, rejectError, isRejectSuccess, rejectData, refetch]);

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
                <Chip label="Published" size="small" sx={{ bgcolor: '#00e67620', color: '#00e676', borderRadius: 1 }} />
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
                        variant="outlined" size="small" color="error"
                        onClick={() => handleReject(row._id)}
                        disabled={isRejecting}
                        sx={{ textTransform: 'none', borderRadius: 2 }}
                    >
                        Unpublish
                    </Button>
                </Stack>
            )
        }
    ], [navigate, handleReject, isRejecting]);

    return (
        <Box sx={{ p: 4, bgcolor: "#14171d", minHeight: "100vh" }}>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h4" sx={{ color: "white", fontWeight: "bold", mb: 1 }}>
                        Approved Notes
                    </Typography>
                    <Typography variant="body1" sx={{ color: "#8b9bb4" }}>
                        View and manage all published study materials.
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
                noDataMessage="No approved study notes found"
                noDataIcon={CheckCircleOutlineIcon}
            />

            <ConfirmationModal
                open={modalConfig.open}
                onClose={handleCloseModal}
                onConfirm={handleConfirmAction}
                title={modalConfig.title}
                message={modalConfig.message}
                confirmText={modalConfig.confirmText}
                confirmColor={modalConfig.confirmColor}
                showReasonField={true}
                isLoading={isRejecting}
            />
        </Box>
    );
};

export default ApprovedNotes;

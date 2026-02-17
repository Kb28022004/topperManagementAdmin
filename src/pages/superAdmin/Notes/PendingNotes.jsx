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
    IconButton
} from "@mui/material";
import {
    useGetPendingNotesQuery,
    useApproveNoteMutation,
    useRejectNoteMutation
} from "../../../feature/api/adminApi";
import toast from "react-hot-toast";
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import RefreshIcon from '@mui/icons-material/Refresh';
import ConfirmationModal from "../../../components/ConfirmationModal";
import DataTable from "../../../components/DataTable";

const PendingNotes = () => {
    const navigate = useNavigate();
    const token = useMemo(() => localStorage.getItem("authToken"), []);

    const { data: notes, isLoading, isFetching, error, refetch } = useGetPendingNotesQuery({ token, status: 'UNDER_REVIEW' }, { skip: !token });

    const [approveNote, {
        data: approveData,
        isLoading: isApproving,
        isSuccess: isApproveSuccess,
        isError: isApproveError,
        error: approveError
    }] = useApproveNoteMutation();

    const [rejectNote, {
        data: rejectData,
        isLoading: isRejecting,
        isSuccess: isRejectSuccess,
        isError: isRejectError,
        error: rejectError
    }] = useRejectNoteMutation();

    const [modalConfig, setModalConfig] = useState({
        open: false,
        type: '',
        id: null,
        title: '',
        message: '',
        confirmText: '',
        confirmColor: 'primary',
        showReasonField: false
    });

    const handleApprove = useCallback((id) => {
        setModalConfig({
            open: true,
            type: 'approve',
            id,
            title: 'Approve Note',
            message: 'Are you sure you want to approve this note? It will be published for students to buy.',
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
            title: 'Reject Note',
            message: 'Please provide a reason for rejecting this note.',
            confirmText: 'Reject',
            confirmColor: 'error',
            showReasonField: true
        });
    }, []);

    const handleConfirmAction = useCallback(async (reason) => {
        const { type, id } = modalConfig;
        try {
            if (type === 'approve') {
                await approveNote({ id, token }).unwrap();
            } else {
                await rejectNote({ id, reason, token }).unwrap();
            }
            setModalConfig(prev => ({ ...prev, open: false }));
        } catch (err) {
            console.log(err);
        }
    }, [modalConfig, approveNote, rejectNote, token]);

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
                <Chip label={row.status} size="small" sx={{ bgcolor: '#ff914d20', color: '#ff914d', borderRadius: 1 }} />
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
                        Review
                    </Button>
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

    return (
        <Box sx={{ p: 4, bgcolor: "#14171d", minHeight: "100vh" }}>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h4" sx={{ color: "white", fontWeight: "bold", mb: 1 }}>
                        Pending Notes
                    </Typography>
                    <Typography variant="body1" sx={{ color: "#8b9bb4" }}>
                        Review and publish study materials uploaded by toppers.
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

            <DataTable
                columns={columns}
                data={notes?.data}
                isLoading={isLoading}
                isFetching={isFetching}
                noDataMessage="No pending study notes found"
                noDataIcon={DescriptionOutlinedIcon}
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

export default PendingNotes;

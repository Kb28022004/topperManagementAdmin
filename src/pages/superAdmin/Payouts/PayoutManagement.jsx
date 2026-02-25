import React, { useEffect, useMemo, useCallback, useState } from "react";
import {
    Box,
    Typography,
    Paper,
    Button,
    Stack,
    CircularProgress,
    IconButton,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField
} from "@mui/material";
import {
    useGetPayoutRequestsQuery,
    useUpdatePayoutStatusMutation
} from "../../../feature/api/adminApi";
import toast from "react-hot-toast";
import RefreshIcon from '@mui/icons-material/Refresh';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import DataTable from "../../../components/DataTable";

const PayoutManagement = () => {
    const token = useMemo(() => localStorage.getItem("authToken"), []);

    useEffect(() => {
        if (!token) {
            window.location.href = "/send-otp";
        }
    }, [token]);

    const [statusFilter, setStatusFilter] = useState("PENDING");
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [processModal, setProcessModal] = useState({
        open: false,
        payout: null,
        type: 'approve', // 'approve' or 'reject'
        transactionId: '',
        adminRemarks: ''
    });

    const { data, isLoading, isFetching, error, refetch } = useGetPayoutRequestsQuery({
        token,
        status: statusFilter,
        page,
        limit: rowsPerPage
    }, { skip: !token });

    const [updateStatus, { isLoading: isUpdating }] = useUpdatePayoutStatusMutation();

    const handleOpenProcess = (payout, type) => {
        setProcessModal({
            open: true,
            payout,
            type,
            transactionId: '',
            adminRemarks: ''
        });
    };

    const handleConfirmProcess = async () => {
        const { payout, type, transactionId, adminRemarks } = processModal;
        if (type === 'approve' && !transactionId) {
            toast.error("Transaction ID is required for approval");
            return;
        }

        try {
            await updateStatus({
                id: payout._id,
                status: type === 'approve' ? 'PAID' : 'REJECTED',
                transactionId,
                adminRemarks,
                token
            }).unwrap();

            toast.success(`Payout ${type === 'approve' ? 'approved' : 'rejected'} successfully`);
            setProcessModal({ ...processModal, open: false });
            refetch();
        } catch (err) {
            toast.error(err?.data?.message || "Failed to update payout status");
        }
    };

    const columns = useMemo(() => [
        {
            id: 'topper',
            label: 'Topper Info',
            render: (row) => (
                <Stack>
                    <Typography variant="body2" sx={{ color: 'white', fontWeight: 'bold' }}>Topper ID: {row.topperId?._id || 'N/A'}</Typography>
                    <Typography variant="caption" sx={{ color: '#8b9bb4' }}>Phone: {row.topperId?.phone || 'N/A'}</Typography>
                </Stack>
            )
        },
        {
            id: 'amount',
            label: 'Amount',
            render: (row) => (
                <Typography sx={{ color: '#00B1FC', fontWeight: 'bold' }}>₹{row.amount}</Typography>
            )
        },
        {
            id: 'method',
            label: 'Method',
            render: (row) => (
                <Chip
                    label={row.paymentMethod}
                    size="small"
                    sx={{ bgcolor: row.paymentMethod === 'UPI' ? '#6366F120' : '#A855F720', color: row.paymentMethod === 'UPI' ? '#6366F1' : '#A855F7' }}
                />
            )
        },
        {
            id: 'details',
            label: 'Payment Details',
            render: (row) => (
                <Box sx={{ fontSize: '0.8rem', color: '#8b9bb4' }}>
                    {row.paymentMethod === 'UPI' ? (
                        <Typography variant="caption">UPI ID: {row.payoutDetails?.upiId}</Typography>
                    ) : (
                        <Stack>
                            <Typography variant="caption">A/C: {row.payoutDetails?.accountNumber}</Typography>
                            <Typography variant="caption">IFSC: {row.payoutDetails?.ifscCode}</Typography>
                            <Typography variant="caption">Name: {row.payoutDetails?.accountHolderName}</Typography>
                        </Stack>
                    )}
                </Box>
            )
        },
        {
            id: 'date',
            label: 'Requested On',
            render: (row) => new Date(row.createdAt).toLocaleDateString()
        },
        {
            id: 'status',
            label: 'Status',
            render: (row) => {
                const colors = {
                    'PAID': { bg: '#10B98120', text: '#10B981' },
                    'PENDING': { bg: '#F59E0B20', text: '#F59E0B' },
                    'REJECTED': { bg: '#EF444420', text: '#EF4444' },
                };
                const config = colors[row.status] || colors.PENDING;
                return <Chip label={row.status} size="small" sx={{ bgcolor: config.bg, color: config.text }} />;
            }
        },
        {
            id: 'actions',
            label: 'Actions',
            render: (row) => row.status === 'PENDING' ? (
                <Stack direction="row" spacing={1}>
                    <Button
                        variant="contained" size="small"
                        onClick={() => handleOpenProcess(row, 'approve')}
                        sx={{ textTransform: 'none', bgcolor: '#10B981', '&:hover': { bgcolor: '#059669' } }}
                    >
                        Mark Paid
                    </Button>
                    <Button
                        variant="outlined" size="small" color="error"
                        onClick={() => handleOpenProcess(row, 'reject')}
                        sx={{ textTransform: 'none' }}
                    >
                        Reject
                    </Button>
                </Stack>
            ) : (
                <Typography variant="caption" sx={{ color: '#64748B' }}>
                    {row.transactionId ? `Txn: ${row.transactionId}` : 'Processed'}
                </Typography>
            )
        }
    ], []);

    const handleStatusChange = (newStatus) => {
        setStatusFilter(newStatus);
        setPage(1);
    };

    return (
        <Box sx={{ p: 4, bgcolor: "#14171d", minHeight: "100vh" }}>
            <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                    <Typography variant="h4" sx={{ color: "white", fontWeight: "bold", mb: 1 }}>
                        Payout Management
                    </Typography>
                    <Typography variant="body1" sx={{ color: "#8b9bb4" }}>
                        Process withdrawal requests from toppers.
                    </Typography>
                </Box>
                <IconButton
                    onClick={() => refetch()}
                    disabled={isFetching}
                    sx={{ color: "white", bgcolor: "rgba(255,255,255,0.05)", "&:hover": { bgcolor: "rgba(255,255,255,0.1)" } }}
                >
                    <RefreshIcon sx={{ animation: isFetching ? "spin 1s linear infinite" : "none" }} />
                </IconButton>
            </Box>

            <Paper elevation={0} sx={{ p: 2, bgcolor: "#1e2129", borderRadius: 3, mb: 3, border: '1px solid #2c3039' }}>
                <Stack direction="row" spacing={1}>
                    {['PENDING', 'PAID', 'REJECTED'].map((s) => (
                        <Button
                            key={s}
                            variant={statusFilter === s ? "contained" : "outlined"}
                            onClick={() => handleStatusChange(s)}
                            size="small"
                            sx={{
                                textTransform: 'none',
                                borderRadius: 2,
                                bgcolor: statusFilter === s ? '#00B1FC' : 'transparent',
                                borderColor: '#334155'
                            }}
                        >
                            {s}
                        </Button>
                    ))}
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
                noDataMessage={`No ${statusFilter.toLowerCase()} payout requests`}
                noDataIcon={CurrencyRupeeIcon}
            />

            {/* Process Modal */}
            <Dialog
                open={processModal.open}
                onClose={() => setProcessModal({ ...processModal, open: false })}
                PaperProps={{
                    sx: { bgcolor: '#1e2129', color: 'white', borderRadius: 3, minWidth: 400 }
                }}
            >
                <DialogTitle sx={{ fontWeight: 'bold' }}>
                    {processModal.type === 'approve' ? 'Process Payout' : 'Reject Payout Request'}
                </DialogTitle>
                <DialogContent>
                    <Stack spacing={3} sx={{ mt: 1 }}>
                        <Typography variant="body2" sx={{ color: '#8b9bb4' }}>
                            Topper Request: <Box component="span" sx={{ color: 'white', fontWeight: 'bold' }}>₹{processModal.payout?.amount}</Box>
                        </Typography>

                        {processModal.type === 'approve' && (
                            <TextField
                                fullWidth
                                label="Transaction ID / Reference No"
                                value={processModal.transactionId}
                                onChange={(e) => setProcessModal({ ...processModal, transactionId: e.target.value })}
                                sx={{
                                    bgcolor: "#2c3039", borderRadius: 1,
                                    input: { color: "white" }, label: { color: "#8b9bb4" },
                                    "& .MuiOutlinedInput-root fieldset": { borderColor: "#3d4250" },
                                }}
                            />
                        )}

                        <TextField
                            fullWidth
                            multiline
                            rows={3}
                            label="Admin Remarks"
                            value={processModal.adminRemarks}
                            onChange={(e) => setProcessModal({ ...processModal, adminRemarks: e.target.value })}
                            sx={{
                                bgcolor: "#2c3039", borderRadius: 1,
                                input: { color: "white" }, label: { color: "#8b9bb4" },
                                "& .MuiOutlinedInput-root fieldset": { borderColor: "#3d4250" },
                            }}
                        />
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button
                        onClick={() => setProcessModal({ ...processModal, open: false })}
                        sx={{ color: '#8b9bb4' }}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleConfirmProcess}
                        disabled={isUpdating}
                        sx={{
                            bgcolor: processModal.type === 'approve' ? '#10B981' : '#EF4444',
                            '&:hover': { bgcolor: processModal.type === 'approve' ? '#059669' : '#DC2626' }
                        }}
                    >
                        {isUpdating ? <CircularProgress size={20} /> : (processModal.type === 'approve' ? 'Confirm Payment' : 'Confirm Rejection')}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default PayoutManagement;

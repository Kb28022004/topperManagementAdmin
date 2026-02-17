import React, { useMemo, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Box,
    Typography,
    Paper,
    Button,
    Grid,
    Stack,
    CircularProgress,
    Divider,
    IconButton,
    TextField,
    Chip
} from "@mui/material";
import {
    usePreviewNoteQuery,
    useApproveNoteMutation,
    useRejectNoteMutation
} from "../../../feature/api/adminApi";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import toast from "react-hot-toast";
import ConfirmationModal from "../../../components/ConfirmationModal";

const ReviewNote = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const token = useMemo(() => localStorage.getItem("authToken"), []);
    const { data: noteData, isLoading, error } = usePreviewNoteQuery({ id, token }, { skip: !id || !token });

    const [approveNote, { isLoading: isApproving }] = useApproveNoteMutation();
    const [rejectNote, { isLoading: isRejecting }] = useRejectNoteMutation();

    const [modalConfig, setModalConfig] = useState({
        open: false,
        type: '',
        title: '',
        message: '',
        confirmText: '',
        confirmColor: 'primary',
        showReasonField: false
    });

    const handleApprove = () => {
        setModalConfig({
            open: true,
            type: 'approve',
            title: 'Approve Note',
            message: 'Are you sure you want to approve this note? It will be published for students to buy.',
            confirmText: 'Approve',
            confirmColor: 'primary',
            showReasonField: false
        });
    };

    const handleReject = () => {
        setModalConfig({
            open: true,
            type: 'reject',
            title: 'Reject Note',
            message: 'Please provide a reason for rejecting this note.',
            confirmText: 'Reject',
            confirmColor: 'error',
            showReasonField: true
        });
    };

    const handleConfirmAction = async (reason) => {
        try {
            if (modalConfig.type === 'approve') {
                await approveNote({ id, token }).unwrap();
                toast.success("Note approved successfully");
            } else {
                await rejectNote({ id, reason, token }).unwrap();
                toast.success("Note rejected successfully");
            }
            setModalConfig(prev => ({ ...prev, open: false }));
            navigate("/superAdmin/notes/pending");
        } catch (err) {
            toast.error(err?.data?.message || "Action failed");
        }
    };

    if (isLoading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4, minHeight: "100vh", bgcolor: "#14171d", alignItems: "center" }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error || !noteData?.data) {
        return (
            <Box sx={{ p: 4, bgcolor: "#14171d", minHeight: "100vh", color: "white" }}>
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate(-1)}
                    sx={{ color: "white", mb: 2 }}
                >
                    Back
                </Button>
                <Typography variant="h5">Error loading note or note not found</Typography>
            </Box>
        );
    }

    const note = noteData.data;

    return (
        <Box sx={{ p: 4, bgcolor: "#14171d", minHeight: "100vh" }}>
            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 4 }}>
                <IconButton onClick={() => navigate(-1)} sx={{ color: "white", bgcolor: "rgba(255,255,255,0.05)" }}>
                    <ArrowBackIcon />
                </IconButton>
                <Box>
                    <Typography variant="h4" sx={{ color: "white", fontWeight: "bold" }}>
                        Review Note
                    </Typography>
                    <Typography variant="body1" sx={{ color: "#8b9bb4" }}>
                        Verify the content quality and details before publishing.
                    </Typography>
                </Box>
            </Stack>

            <Grid container spacing={4}>
                {/* Note Details */}
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 3, bgcolor: "#1e2128", color: "white", borderRadius: 3, border: "1px solid rgba(255,255,255,0.05)" }}>
                        <Typography variant="h6" sx={{ mb: 3, fontWeight: "bold", color: "#448aff" }}>
                            Note Information
                        </Typography>

                        <Stack spacing={2.5}>
                            <Box>
                                <Typography variant="caption" sx={{ color: "#8b9bb4", display: "block", mb: 0.5 }}>Chapter Name</Typography>
                                <Typography variant="body1" sx={{ fontWeight: "600" }}>{note.chapterName || "N/A"}</Typography>
                            </Box>

                            <Box>
                                <Typography variant="caption" sx={{ color: "#8b9bb4", display: "block", mb: 0.5 }}>Subject</Typography>
                                <Typography variant="body1" sx={{ fontWeight: "600" }}>{note.subject}</Typography>
                            </Box>

                            <Box>
                                <Typography variant="caption" sx={{ color: "#8b9bb4", display: "block", mb: 0.5 }}>Target Class & Board</Typography>
                                <Stack direction="row" spacing={1}>
                                    <Chip label={`Class ${note.class}`} size="small" sx={{ bgcolor: "rgba(68, 138, 255, 0.1)", color: "#448aff", borderRadius: 1 }} />
                                    <Chip label={note.board} size="small" sx={{ bgcolor: "rgba(255, 145, 77, 0.1)", color: "#ff914d", borderRadius: 1 }} />
                                </Stack>
                            </Box>

                            <Box>
                                <Typography variant="caption" sx={{ color: "#8b9bb4", display: "block", mb: 0.5 }}>Price</Typography>
                                <Typography variant="h5" sx={{ fontWeight: "bold", color: "#4caf50" }}>₹{note.price}</Typography>
                            </Box>

                            <Divider sx={{ borderColor: "rgba(255,255,255,0.05)" }} />

                            <Box>
                                <Typography variant="caption" sx={{ color: "#8b9bb4", display: "block", mb: 0.5 }}>Page Count</Typography>
                                <Typography variant="body1">{note.pageCount} Pages</Typography>
                            </Box>

                            <Stack direction="column" spacing={2} sx={{ mt: 2 }}>
                                <Button
                                    fullWidth
                                    variant="contained"
                                    startIcon={<CheckCircleOutlineIcon />}
                                    onClick={handleApprove}
                                    disabled={isApproving || isRejecting}
                                    sx={{ bgcolor: "#448aff", py: 1.5, borderRadius: 2, textTransform: "none", fontWeight: "bold" }}
                                >
                                    Approve & Publish
                                </Button>
                                <Button
                                    fullWidth
                                    variant="outlined"
                                    color="error"
                                    startIcon={<CancelOutlinedIcon />}
                                    onClick={handleReject}
                                    disabled={isApproving || isRejecting}
                                    sx={{ py: 1.5, borderRadius: 2, textTransform: "none", fontWeight: "bold" }}
                                >
                                    Reject Note
                                </Button>
                            </Stack>
                        </Stack>
                    </Paper>
                </Grid>

                {/* PDF Pages Preview */}
                <Grid item xs={12} md={8}>
                    <Paper sx={{
                        p: 1,
                        bgcolor: "#1e2128",
                        borderRadius: 3,
                        border: "1px solid rgba(255,255,255,0.05)",
                        maxHeight: "85vh",
                        overflowY: "auto",
                        "&::-webkit-scrollbar": { width: 8 },
                        "&::-webkit-scrollbar-track": { bgcolor: "transparent" },
                        "&::-webkit-scrollbar-thumb": { bgcolor: "rgba(255,255,255,0.1)", borderRadius: 10 }
                    }}>
                        <Box sx={{ p: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <Typography variant="h6" sx={{ color: "white", fontWeight: "bold" }}>
                                Document Preview
                            </Typography>
                            <Typography variant="body2" sx={{ color: "#8b9bb4" }}>
                                {note.previewImages?.length || 0} Pages total
                            </Typography>
                        </Box>

                        <Divider sx={{ mb: 2, borderColor: "rgba(255,255,255,0.05)" }} />

                        <Stack spacing={3} alignItems="center" sx={{ pb: 4 }}>
                            {note.previewImages && note.previewImages.length > 0 ? (
                                note.previewImages.map((url, index) => (
                                    <Box key={index} sx={{ width: "100%", position: "relative" }}>
                                        <Typography
                                            variant="caption"
                                            sx={{
                                                position: "absolute",
                                                top: 10,
                                                left: 10,
                                                bgcolor: "rgba(0,0,0,0.6)",
                                                color: "white",
                                                px: 1,
                                                py: 0.5,
                                                borderRadius: 1,
                                                zIndex: 1
                                            }}
                                        >
                                            Page {index + 1}
                                        </Typography>
                                        <img
                                            src={url}
                                            alt={`Page ${index + 1}`}
                                            style={{
                                                width: "100%",
                                                height: "auto",
                                                borderRadius: 8,
                                                border: "1px solid rgba(255,255,255,0.1)"
                                            }}
                                        />
                                    </Box>
                                ))
                            ) : (
                                <Box sx={{ py: 10, textAlign: "center", color: "#8b9bb4" }}>
                                    <DescriptionOutlinedIcon sx={{ fontSize: 60, mb: 2, opacity: 0.3 }} />
                                    <Typography>No preview images available</Typography>
                                </Box>
                            )}
                        </Stack>
                    </Paper>
                </Grid>
            </Grid>

            <ConfirmationModal
                open={modalConfig.open}
                onClose={() => setModalConfig(prev => ({ ...prev, open: false }))}
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

export default ReviewNote;

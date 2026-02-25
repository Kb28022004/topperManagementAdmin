import React, { useEffect, useState } from 'react';
import {
    Box,
    Grid,
    Paper,
    Typography,
    Card,
    CardContent,
    TextField,
    Button,
    List,
    ListItem,
    ListItemAvatar,
    Avatar,
    ListItemText,
    Chip,
    IconButton,
    Divider,
    Tab,
    Tabs
} from '@mui/material';
import {
    Description as DescriptionIcon,
    Flag as FlagIcon,
    School as SchoolIcon,
    AttachMoney as AttachMoneyIcon,
    Search as SearchIcon,
    FilterList as FilterListIcon,
    CheckCircle as CheckCircleIcon,
    Cancel as CancelIcon,
    Visibility as VisibilityIcon,
    AccessTime as AccessTimeIcon,
    Group as GroupIcon
} from '@mui/icons-material';
import { useGetPendingNotesQuery, useGetPendingToppersQuery, useGetStudentUsageQuery, useApproveNoteMutation, useRejectNoteMutation } from '../../feature/api/adminApi';
import { useNavigate } from 'react-router-dom';

const StatCard = ({ title, value, icon, color, subText }) => (
    <Card sx={{ height: '100%', bgcolor: '#1e2129', color: 'white', borderRadius: 3 }}>
        <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                    <Box sx={{ bgcolor: `${color}20`, p: 1, borderRadius: 2, display: 'inline-flex', mb: 2 }}>
                        {React.cloneElement(icon, { sx: { color: color } })}
                    </Box>
                    <Typography variant="body2" sx={{ color: '#8b9bb4', mb: 1 }}>{title}</Typography>
                    <Typography variant="h4" fontWeight="bold">{value}</Typography>
                </Box>
                {subText && (
                    <Chip
                        label={subText}
                        size="small"
                        sx={{ bgcolor: `${color}20`, color: color, borderRadius: 1 }}
                    />
                )}
            </Box>
        </CardContent>
    </Card>
);

const Dashboard = () => {
    const navigate = useNavigate();
    const [tabValue, setTabValue] = useState(0);
    const token = localStorage.getItem("authToken");

    const { data: pendingNotesData, isFetching: notesFetching } = useGetPendingNotesQuery({ token }, { skip: !token });
    const { data: pendingToppersData, isFetching: toppersFetching } = useGetPendingToppersQuery(token, { skip: !token });
    const { data: usageData } = useGetStudentUsageQuery(token, { skip: !token });

    // ─── Derived data ─────────────────────────────────────────────────────────
    const recentUploads = pendingNotesData?.data ?? [];
    const pendingToppers = pendingToppersData?.data ?? [];

    const pendingNotesCount = recentUploads.length;
    const pendingToppersCount = pendingToppers.length;
    const totalStudents = usageData?.data?.totalStudents || 0;
    const totalAppTime = Math.round((usageData?.data?.totalAppTime || 0) / 60);

    // ─── Mutations ────────────────────────────────────────────────────────────
    const [approveNote] = useApproveNoteMutation();
    const [rejectNote] = useRejectNoteMutation();

    const handleApprove = async (noteId) => {
        try { await approveNote({ token, id: noteId }).unwrap(); }
        catch { /* toast handled globally */ }
    };

    const handleReject = async (noteId) => {
        try { await rejectNote({ token, id: noteId }).unwrap(); }
        catch { /* toast handled globally */ }
    };

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const formatTime = (seconds) => {
        if (seconds < 60) return `${seconds}s`;
        const mins = Math.floor(seconds / 60);
        if (mins < 60) return `${mins}m`;
        const hrs = Math.floor(mins / 60);
        return `${hrs}h ${mins % 60}m`;
    };

    return (
        <Box sx={{ p: 4, color: "white", minHeight: '100vh' }}>
            {/* Header Section */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h5" fontWeight="bold">Admin Panel</Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Avatar sx={{ bgcolor: '#1e2129' }}>A</Avatar>
                </Box>
            </Box>

            {/* Stats Grid */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Pending Reviews"
                        value={pendingNotesCount}
                        icon={<DescriptionIcon />}
                        color="#ff914d"
                        subText="+12%"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Flagged Content"
                        value="8"
                        icon={<FlagIcon />}
                        color="#ff5252"
                        subText="+2%"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Active Students"
                        value={totalStudents}
                        icon={<GroupIcon />}
                        color="#448aff"
                        subText="Live"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="App Usage"
                        value={`${totalAppTime}m`}
                        icon={<AccessTimeIcon />}
                        color="#00e676"
                        subText="Total"
                    />
                </Grid>
            </Grid>

            {/* Main Content Area */}
            <Grid container spacing={3}>
                {/* Left Column: List */}
                <Grid item xs={12} md={8}>
                    <Paper sx={{ bgcolor: '#1e2129', color: 'white', borderRadius: 3, overflow: 'hidden' }}>
                        {/* Search and Filter */}
                        <Box sx={{ p: 2, display: 'flex', gap: 2 }}>
                            <TextField
                                fullWidth
                                placeholder="Search notes, IDs, or toppers..."
                                variant="outlined"
                                InputProps={{
                                    startAdornment: <SearchIcon sx={{ color: '#8b9bb4', mr: 1 }} />,
                                    sx: { color: 'white', bgcolor: '#2c3039', borderRadius: 2 }
                                }}
                                sx={{ '& .MuiOutlinedInput-notchedOutline': { border: 'none' } }}
                            />
                            <IconButton sx={{ bgcolor: '#2c3039', color: 'white', borderRadius: 2 }}>
                                <FilterListIcon />
                            </IconButton>
                        </Box>

                        {/* Tabs */}
                        <Tabs
                            value={tabValue}
                            onChange={handleTabChange}
                            sx={{
                                px: 2,
                                '& .MuiTab-root': { color: '#8b9bb4', textTransform: 'none' },
                                '& .Mui-selected': { color: 'white' },
                                '& .MuiTabs-indicator': { bgcolor: '#448aff' }
                            }}
                        >
                            <Tab label="Notes Moderation" />
                            <Tab label="Toppers" />
                            <Tab label="Student Activity" />
                        </Tabs>

                        <Divider sx={{ bgcolor: '#2c3039' }} />

                        {/* List Header */}
                        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="subtitle1" fontWeight="bold">
                                {tabValue === 0 ? `Pending Uploads (${pendingNotesCount})` :
                                    tabValue === 1 ? `Topper Requests (${pendingToppersCount})` :
                                        `Student Engagement`}
                            </Typography>
                            <Button size="small" sx={{ color: '#448aff', textTransform: 'none' }}>Sort by Active</Button>
                        </Box>

                        {/* List Items */}
                        <List sx={{ px: 2, pb: 2 }}>
                            {tabValue === 0 ? (
                                notesFetching ? (
                                    <Typography sx={{ color: '#8b9bb4', textAlign: 'center', py: 4 }}>Loading…</Typography>
                                ) : recentUploads.length > 0 ? (
                                    recentUploads.map((note) => (
                                        <Paper key={note._id} sx={{ mb: 2, bgcolor: '#2c3039', p: 2, borderRadius: 2 }}>
                                            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                                                <Box sx={{
                                                    width: 60, height: 60, bgcolor: '#3d4250',
                                                    borderRadius: 1, display: 'flex',
                                                    alignItems: 'center', justifyContent: 'center'
                                                }}>
                                                    <DescriptionIcon sx={{ color: '#8b9bb4' }} />
                                                </Box>
                                                <Box sx={{ flex: 1 }}>
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                        <Typography variant="subtitle1" fontWeight="bold">{note.chapterName || note.title}</Typography>
                                                        <Typography variant="caption" sx={{ color: '#8b9bb4' }}>Pending</Typography>
                                                    </Box>
                                                    <Typography variant="body2" sx={{ color: '#8b9bb4' }}>
                                                        {note.topperId?.firstName || "Unknown Topper"} • Class {note.class || "N/A"} • {note.subject || "N/A"}
                                                    </Typography>
                                                    <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                                                        <Chip label={note.subject} size="small" sx={{ bgcolor: '#448aff20', color: '#448aff', borderRadius: 1 }} />
                                                        <Chip label={`₹${note.price}`} size="small" sx={{ bgcolor: '#00e67620', color: '#00e676', borderRadius: 1 }} />
                                                    </Box>
                                                </Box>
                                            </Box>
                                            <Box sx={{ display: 'flex', gap: 2 }}>
                                                <Button
                                                    variant="outlined" fullWidth
                                                    sx={{ color: '#8b9bb4', borderColor: '#3d4250', textTransform: 'none' }}
                                                    onClick={() => navigate(`/superAdmin/notes/pending`)}
                                                >
                                                    View
                                                </Button>
                                                <Button
                                                    variant="outlined" fullWidth color="error"
                                                    sx={{ textTransform: 'none' }}
                                                    onClick={() => handleReject(note._id)}
                                                >
                                                    Reject
                                                </Button>
                                                <Button
                                                    variant="contained" fullWidth
                                                    sx={{ bgcolor: '#448aff', textTransform: 'none' }}
                                                    onClick={() => handleApprove(note._id)}
                                                >
                                                    Approve
                                                </Button>
                                            </Box>
                                        </Paper>
                                    ))
                                ) : (
                                    <Typography sx={{ color: '#8b9bb4', textAlign: 'center', py: 4 }}>No pending notes found</Typography>
                                )
                            ) : tabValue === 1 ? (
                                // Toppers List Placeholder
                                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                                    <Button variant="contained" onClick={() => navigate('/superAdmin/toppers/pending')}>View All Pending Requests</Button>
                                </Box>
                            ) : (
                                // Student Activity List
                                usageData?.data?.topActiveStudents?.length > 0 ? (
                                    usageData.data.topActiveStudents.map((student) => (
                                        <ListItem key={student._id} sx={{ bgcolor: '#2c3039', borderRadius: 2, mb: 1 }}>
                                            <ListItemAvatar>
                                                <Avatar src={student.profilePhoto} />
                                            </ListItemAvatar>
                                            <ListItemText
                                                primary={student.fullName}
                                                secondary={`${student.class}th • ${student.board}`}
                                                sx={{ '& .MuiListItemText-primary': { color: 'white' }, '& .MuiListItemText-secondary': { color: '#8b9bb4' } }}
                                            />
                                            <Box sx={{ textAlign: 'right' }}>
                                                <Typography variant="subtitle2" color="#00e676">
                                                    {formatTime(student.stats?.totalTimeSpent || 0)}
                                                </Typography>
                                                <Typography variant="caption" color="#8b9bb4">
                                                    Total Time
                                                </Typography>
                                            </Box>
                                        </ListItem>
                                    ))
                                ) : (
                                    <Typography sx={{ color: '#8b9bb4', textAlign: 'center', py: 4 }}>No student activity found</Typography>
                                )
                            )}
                        </List>

                        {recentUploads?.length > 0 && tabValue === 0 && (
                            <Box sx={{ p: 2, textAlign: 'center', borderTop: '1px solid #2c3039' }}>
                                <Button onClick={() => navigate('/superAdmin/notes/pending')}>View All Notes</Button>
                            </Box>
                        )}
                    </Paper>
                </Grid>

                {/* Right Column: Details/Preview Placeholder (Optional, could be hidden on smaller screens) */}
                <Grid item xs={12} md={4}>
                    {/* This could be a static preview or selected item details */}
                    <Paper sx={{ bgcolor: '#1e2129', color: 'white', borderRadius: 3, p: 3, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <SchoolIcon sx={{ fontSize: 60, color: '#3d4250', mb: 2 }} />
                        <Typography variant="h6" sx={{ color: '#8b9bb4' }}>Select an item to view details</Typography>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default Dashboard;

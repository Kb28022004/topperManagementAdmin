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
    Visibility as VisibilityIcon
} from '@mui/icons-material';
import { useGetPendingNotesQuery, useGetPendingToppersQuery } from '../../feature/api/adminApi';
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
    const token = localStorage.getItem("authToken"); // Handle token properly in real implementation

    // Using the hooks we created. Note: Ensure token is available or handle skip
    const { data: pendingNotesData } = useGetPendingNotesQuery(token, { skip: !token });
    const { data: pendingToppersData } = useGetPendingToppersQuery(token, { skip: !token });

    const pendingNotesCount = pendingNotesData?.data?.length || 0;
    const pendingToppersCount = pendingToppersData?.data?.length || 0;

    // Mock data for UI visualization matching the image style
    const recentUploads = pendingNotesData?.data?.slice(0, 3) || [];

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
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
                        title="Topper Profiles"
                        value={pendingToppersCount}
                        icon={<SchoolIcon />}
                        color="#448aff"
                        subText="+5%"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Total Revenue"
                        value="$12,450"
                        icon={<AttachMoneyIcon />}
                        color="#00e676"
                        subText="+15%"
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
                            <Tab label="User Management" />
                        </Tabs>

                        <Divider sx={{ bgcolor: '#2c3039' }} />

                        {/* List Header */}
                        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="subtitle1" fontWeight="bold">
                                {tabValue === 0 ? `Pending Uploads (${pendingNotesCount})` : `Pending Toppers (${pendingToppersCount})`}
                            </Typography>
                            <Button size="small" sx={{ color: '#448aff', textTransform: 'none' }}>Sort by Date</Button>
                        </Box>

                        {/* List Items */}
                        <List sx={{ px: 2, pb: 2 }}>
                            {tabValue === 0 ? (
                                recentUploads.length > 0 ? (
                                    recentUploads.map((note) => (
                                        <Paper key={note._id} sx={{ mb: 2, bgcolor: '#2c3039', p: 2, borderRadius: 2 }}>
                                            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                                                {/* <Avatar variant="rounded" src={note.previewImages?.[0]} sx={{ width: 60, height: 60 }} /> */}
                                                <Box sx={{
                                                    width: 60,
                                                    height: 60,
                                                    bgcolor: '#3d4250',
                                                    borderRadius: 1,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}>
                                                    <DescriptionIcon sx={{ color: '#8b9bb4' }} />
                                                </Box>
                                                <Box sx={{ flex: 1 }}>
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                        <Typography variant="subtitle1" fontWeight="bold">{note.title}</Typography>
                                                        <Typography variant="caption" sx={{ color: '#8b9bb4' }}>
                                                            Just now
                                                        </Typography>
                                                    </Box>
                                                    <Typography variant="body2" sx={{ color: '#8b9bb4' }}>
                                                        {note.topperId?.firstName || "Unknown Topper"} • {note.class || "Class N/A"} • {note.subject || "Subject N/A"}
                                                    </Typography>
                                                    <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                                                        <Chip label={note.subject} size="small" sx={{ bgcolor: '#448aff20', color: '#448aff', borderRadius: 1 }} />
                                                        <Chip label="Exam Prep" size="small" sx={{ bgcolor: '#ff914d20', color: '#ff914d', borderRadius: 1 }} />
                                                    </Box>
                                                </Box>
                                            </Box>
                                            <Box sx={{ display: 'flex', gap: 2 }}>
                                                <Button
                                                    variant="outlined"
                                                    fullWidth
                                                    sx={{ color: '#8b9bb4', borderColor: '#3d4250', textTransform: 'none' }}
                                                    onClick={() => navigate(`/superAdmin/notes/pending`)} // Ideally open a modal
                                                >
                                                    View
                                                </Button>
                                                <Button
                                                    variant="outlined"
                                                    fullWidth
                                                    color="error"
                                                    sx={{ textTransform: 'none' }}
                                                >
                                                    Reject
                                                </Button>
                                                <Button
                                                    variant="contained"
                                                    fullWidth
                                                    sx={{ bgcolor: '#448aff', textTransform: 'none' }}
                                                >
                                                    Approve
                                                </Button>
                                            </Box>
                                        </Paper>
                                    ))
                                ) : (
                                    <Typography sx={{ color: '#8b9bb4', textAlign: 'center', py: 4 }}>No pending notes found</Typography>
                                )
                            ) : (
                                // Toppers List Placeholder
                                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                                    <Button variant="contained" onClick={() => navigate('/superAdmin/toppers/pending')}>View All Pending Requests</Button>
                                </Box>
                            )}
                        </List>

                        {recentUploads.length > 0 && tabValue === 0 && (
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

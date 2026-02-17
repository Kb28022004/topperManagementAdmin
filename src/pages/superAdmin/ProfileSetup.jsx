import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
    Box,
    Button,
    TextField,
    Typography,
    Avatar,
    Paper,
    IconButton,
    CircularProgress,
    Container,
} from "@mui/material";
import { PhotoCamera } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useCreateProfileMutation } from "../../feature/api/adminApi";

const validationSchema = Yup.object({
    fullName: Yup.string().min(2, "Name must be at least 2 characters").required("Full Name is required"),
    bio: Yup.string().max(500, "Bio must be at most 500 characters"),
    department: Yup.string().required("Department is required"),
    designation: Yup.string().required("Designation is required"),
});

const ProfileSetup = () => {
    const [createProfile, { isLoading }] = useCreateProfileMutation();
    const navigate = useNavigate();
    const [preview, setPreview] = useState(null);

    const formik = useFormik({
        initialValues: {
            fullName: "",
            bio: "",
            department: "",
            designation: "",
            profilePhoto: null,
        },
        validationSchema: validationSchema,
        onSubmit: async (values) => {
            const formData = new FormData();
            formData.append("fullName", values.fullName);
            formData.append("bio", values.bio);
            formData.append("department", values.department);
            formData.append("designation", values.designation);
            if (values.profilePhoto) {
                formData.append("profilePhoto", values.profilePhoto);
            }

            try {
                const response = await createProfile({ formData, token: localStorage.getItem("authToken") }).unwrap();
                toast.success(response.message || "Profile created successfully!");
                navigate("/superAdmin");
            } catch (error) {
                toast.error(error?.data?.message || "Failed to create profile");
            }
        },
    });

    const handleFileChange = (event) => {
        const file = event.currentTarget.files[0];
        if (file) {
            formik.setFieldValue("profilePhoto", file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <Box
            sx={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                py: 4,
            }}
        >
            <Container maxWidth="sm">
                <Paper
                    elevation={10}
                    sx={{
                        p: 4,
                        borderRadius: 4,
                        backdropFilter: "blur(10px)",
                        backgroundColor: "rgba(255, 255, 255, 0.9)",
                    }}
                >
                    <Box sx={{ mb: 3, textAlign: "center" }}>
                        <Typography variant="h4" component="h1" fontWeight="bold" color="primary" gutterBottom>
                            Complete Your Profile
                        </Typography>
                        <Typography variant="body1" color="textSecondary">
                            Please enter your details to proceed to the dashboard.
                        </Typography>
                    </Box>

                    <form onSubmit={formik.handleSubmit}>
                        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mb: 4 }}>
                            <Box sx={{ position: "relative" }}>
                                <Avatar
                                    src={preview}
                                    alt="Profile Preview"
                                    sx={{ width: 120, height: 120, border: "4px solid white", boxShadow: 3 }}
                                />
                                <IconButton
                                    color="primary"
                                    aria-label="upload picture"
                                    component="label"
                                    sx={{
                                        position: "absolute",
                                        bottom: 0,
                                        right: 0,
                                        bgcolor: "white",
                                        "&:hover": { bgcolor: "#f5f5f5" },
                                    }}
                                >
                                    <input hidden accept="image/*" type="file" onChange={handleFileChange} />
                                    <PhotoCamera />
                                </IconButton>
                            </Box>
                            <Typography variant="caption" color="textSecondary" sx={{ mt: 1 }}>
                                Upload Profile Photo
                            </Typography>
                        </Box>

                        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                            <TextField
                                fullWidth
                                id="fullName"
                                name="fullName"
                                label="Full Name"
                                variant="outlined"
                                value={formik.values.fullName}
                                onChange={formik.handleChange}
                                error={formik.touched.fullName && Boolean(formik.errors.fullName)}
                                helperText={formik.touched.fullName && formik.errors.fullName}
                            />

                            <TextField
                                fullWidth
                                id="department"
                                name="department"
                                label="Department"
                                variant="outlined"
                                value={formik.values.department}
                                onChange={formik.handleChange}
                                error={formik.touched.department && Boolean(formik.errors.department)}
                                helperText={formik.touched.department && formik.errors.department}
                            />

                            <TextField
                                fullWidth
                                id="designation"
                                name="designation"
                                label="Designation"
                                variant="outlined"
                                value={formik.values.designation}
                                onChange={formik.handleChange}
                                error={formik.touched.designation && Boolean(formik.errors.designation)}
                                helperText={formik.touched.designation && formik.errors.designation}
                            />

                            <TextField
                                fullWidth
                                id="bio"
                                name="bio"
                                label="Bio"
                                multiline
                                rows={4}
                                variant="outlined"
                                value={formik.values.bio}
                                onChange={formik.handleChange}
                                error={formik.touched.bio && Boolean(formik.errors.bio)}
                                helperText={formik.touched.bio && formik.errors.bio}
                            />

                            <Button
                                color="primary"
                                variant="contained"
                                fullWidth
                                type="submit"
                                size="large"
                                disabled={isLoading}
                                sx={{
                                    mt: 2,
                                    py: 1.5,
                                    borderRadius: 2,
                                    fontWeight: "bold",
                                    textTransform: "none",
                                    fontSize: "1rem",
                                    boxShadow: "0 4px 6px rgba(50, 50, 93, 0.11), 0 1px 3px rgba(0, 0, 0, 0.08)",
                                }}
                            >
                                {isLoading ? <CircularProgress size={24} color="inherit" /> : "Save & Continue"}
                            </Button>
                        </Box>
                    </form>
                </Paper>
            </Container>
        </Box>
    );
};

export default ProfileSetup;

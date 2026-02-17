import { IconButton, styled, Typography, Menu, MenuItem, Avatar, Box } from "@mui/material";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import KeyboardArrowDownOutlinedIcon from "@mui/icons-material/KeyboardArrowDownOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import profileImage from "../assets/profileTopImage.svg";
import { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const Header = ({ setOpenSidebar, openSidebar, to, isDashboard }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const userDetails = JSON.parse(localStorage.getItem("userDetails")) || {};

  console.log("userDetails", userDetails);

  // ----------------------------
  // ✅ Detect dashboard type dynamically
  // ----------------------------
  const locationPath = location.pathname.split("/").filter(Boolean);
  const panelType = locationPath[0];
  const lastPath = locationPath[locationPath.length - 1];

  let formattedLastPath = "";

  if (isDashboard && lastPath === "dashboard") {
    formattedLastPath = "Admin Dashboard";
  } else if (locationPath.includes("toppers") && locationPath.includes("pending")) {
    formattedLastPath = "Pending Topper Requests";
  } else if (locationPath.includes("notes") && locationPath.includes("pending")) {
    formattedLastPath = "Pending Notes Requests";
  } else if (locationPath.includes("setup-profile")) {
    formattedLastPath = "Profile Setup";
  } else if (locationPath.includes("reports")) {
    formattedLastPath = "Reports & Analytics";
  } else if (locationPath.includes("settings")) {
    formattedLastPath = "Settings";
  } else {
    // fallback to formatted last path segment
    formattedLastPath =
      lastPath.charAt(0).toUpperCase() +
      lastPath.slice(1).replaceAll("-", " ");
  }

  // ----------------------------
  //  Logout logic
  // ----------------------------
  const handleMouseLeave = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    // Clear all auth related items
    localStorage.removeItem("authToken");
    localStorage.removeItem("userDetails");
    localStorage.removeItem("authToken");
    toast.success("Logged out successfully");
    navigate("/login");
  };

  return (
    <HeaderMainContainer>
      <HeaderFirstSection>
        <IconButton>
          <MenuOutlinedIcon
            onClick={() => setOpenSidebar(!openSidebar)}
            sx={{ color: "white", fontSize: { xs: "medium", sm: "large" } }}
          />
        </IconButton>
        <Typography
          sx={{
            fontFamily: "Noto Sans",
            fontWeight: 700,
            fontSize: { xs: "20px", sm: "24px" },
            color: "white",
          }}
        >
          {formattedLastPath || "Dashboard"}
        </Typography>
      </HeaderFirstSection>

      <HeaderLastSection>
        <IconButton sx={{ display: { xs: "none", lg: "block" } }}>
          <NotificationsOutlinedIcon
            sx={{
              color: "#8b9bb4",
              fontSize: {
                xs: "medium",
                lg: "large",
              },
            }}
          />
        </IconButton>

        <LastSectionDiv>
          {/* Use Avatar as fallback or the image if valid */}
          <Avatar
            src={profileImage}
            alt="profile"
            sx={{ width: 32, height: 32 }}
          />
          <Typography sx={{ color: "white", fontSize: "14px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "100px" }}>
            {userDetails?.firstName || userDetails?.fullName || "Admin"}
          </Typography>
          <IconButton
            onMouseEnter={(e) => setAnchorEl(e.currentTarget)}
            onClick={(e) => setAnchorEl(e.currentTarget)}
          >
            <KeyboardArrowDownOutlinedIcon sx={{ color: "#8b9bb4" }} />
          </IconButton>
        </LastSectionDiv>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMouseLeave}
          PaperProps={{
            elevation: 3,
            sx: {
              marginTop: "10px",
              backgroundColor: "#1e2129",
              border: "1px solid #2c3039",
              borderRadius: "10px",
              minWidth: 200,
              padding: "10px",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              "& .MuiMenuItem-root": {
                color: "#8b9bb4",
                borderRadius: "8px",
                "&:hover": {
                  backgroundColor: "#2c3039",
                  color: "white"
                }
              }
            },
          }}
        >
          <MenuItem component={NavLink} to={to} onClick={handleMouseLeave}>
            <PersonOutlineOutlinedIcon fontSize="small" style={{ color: "inherit", marginRight: "10px" }} />
            <Typography variant="body2">View Profile</Typography>
          </MenuItem>

          <MenuItem
            onClick={() => {
              handleLogout();
              handleMouseLeave();
            }}
          >
            <LogoutRoundedIcon fontSize="small" style={{ color: "inherit", marginRight: "10px" }} />
            <Typography variant="body2">Logout</Typography>
          </MenuItem>
        </Menu>
      </HeaderLastSection>
    </HeaderMainContainer>
  );
};

export default Header;

// ----------------------------
// Styled Components
// ----------------------------
const HeaderMainContainer = styled("div")`
  width: 100%;
  height: 120px;
  padding: 0 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #1e2129;
  border-bottom: 1px solid #1e2129;

  @media (max-width: 1200px) {
    max-width: 100vw;
    padding: 0 20px;
  }

  @media (max-width: 600px) {
    width: 100vw;
    padding: 0 10px;
  }
`;

const HeaderFirstSection = styled("div")`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const HeaderLastSection = styled("div")`
  display: flex;
  align-items: center;
  gap: 30px;
`;

const LastSectionDiv = styled("div")`
  min-width: 180px;
  height: 50px;
  border-radius: 25px;
  display: flex;
  color: #fff;
  align-items: center;
  gap: 10px;
  justify-content: space-between;
  background-color: #1e2129;
  border: 1px solid #2c3039;
  padding: 0 15px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
      border-color: #448aff;
  }

  @media (max-width: 600px) {
    width: auto;
    min-width: unset;
    padding: 0 10px;
  }
`;

import React, { useState } from "react";

import { Outlet } from "react-router-dom";
import { styled } from "@mui/material";
import supportIcon from '../assets/Page-1.svg'
import firstIcon from '../assets/Vector (1).svg'
import secondIcon from '../assets/Vector (2).svg'
import thirdIon from '../assets/Vector.svg'
import fifthIcon from '../assets/Group 1144.svg'
import fourthIcon from '../assets/Group 1143.svg'
import sixthIcon from '../assets/Group 1145.svg'
import seventhIcon from '../assets/Group (3).svg'
import eightIcom from '../assets/Home-1.svg'


import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

const SuperAdminDashboard = () => {
  const [openSidebar, setOpenSidebar] = useState(true);

  const dashboardItems = [
    {
      title: "Dashboard",
      icon: eightIcom,

      navigate: ".",
    },

    {
      title: "Toppers",
      icon: thirdIon,
      navigate: "toppers/pending",
      subItems: [
        {
          subTitle: "Pending Requests",
          navigate: "toppers/pending",
          icon: thirdIon,
        },
        {
          subTitle: "Approved Toppers",
          navigate: "toppers/approved",
          icon: thirdIon,
        },
        {
          subTitle: "Rejected Toppers",
          navigate: "toppers/rejected",
          icon: thirdIon,
        },
      ],
    },
    {
      title: "Notes",
      icon: fifthIcon,
      navigate: "notes/pending",
      subItems: [
        {
          subTitle: "Pending Notes",
          navigate: "notes/pending",
          icon: fifthIcon,
        },
        {
          subTitle: "Approved Notes",
          navigate: "notes/approved",
          icon: fifthIcon,
        },
        {
          subTitle: "Rejected Notes",
          navigate: "notes/rejected",
          icon: fifthIcon,
        },
      ],
    },
    {
      title: "Reports & Analytics",
      icon: seventhIcon,
      navigate: "reports",
    },
    {
      title: "Settings",
      icon: secondIcon,
      navigate: "settings",
    },
  ];

  return (
    <DashboardMainContainer>
      <Sidebar dashboardItems={dashboardItems} openSidebar={openSidebar} setOpenSidebar={setOpenSidebar} />
      <ContentWrapper>
        <Header openSidebar={openSidebar} setOpenSidebar={setOpenSidebar} content='ADMIN +' />
        <Outlet />
      </ContentWrapper>
    </DashboardMainContainer>
  );
};

export default SuperAdminDashboard;

const DashboardMainContainer = styled("div")`
  display: flex;
  height: auto;
`;

const ContentWrapper = styled("div")`
  flex: 1;
  display: flex;
  flex-direction: column;

`;
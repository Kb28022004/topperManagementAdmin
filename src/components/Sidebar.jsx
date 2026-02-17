import { Drawer, styled, useMediaQuery } from "@mui/material";
import WestIcon from "@mui/icons-material/West";
import ebidgo from "../assets/topperNotsIcon.png";
import help from "../assets/Group (4).svg";

import { NavLink } from "react-router-dom";

const Sidebar = ({ openSidebar, setOpenSidebar, dashboardItems }) => {
  const isMobile = useMediaQuery("(max-width:1200px)");

  return (
    <>
      <DrawerSidebar
        open={openSidebar}
        onClose={() => setOpenSidebar(false)}
        variant={isMobile ? "temporary" : "permanent"}
        anchor="left"
        sx={{
          width: openSidebar ? 240 : 0,
          flexShrink: 0,
          transition: "width 0.6s ease",

          "& .MuiDrawer-paper": {
            width: openSidebar ? 240 : 0,
            boxSizing: "border-box",
            backgroundColor: "#1e2129",
            color: "white",
            borderRight: "1px solid #2c3039",
          },
        }}
      >
        {isMobile ? (
          <LogoMobile>
            {/* <LogoImage src={ebidgo} alt="Ebidgo Logo" /> */}
            <WestIconStyle
              onClick={() => setOpenSidebar(false)}
              fontSize="large"
            />
          </LogoMobile>
        ) : (
          <LogoContainer>
            {openSidebar ? (
              <NavLink
                to="/superAdmin/dashboard"
              >
                {/* <LogoImage src={ebidgo} alt="ebidgo logo" /> */}
              </NavLink>
            ) : (
              <ScrizaLogo alt="Blog Logo" />
            )}
          </LogoContainer>
        )}

        {dashboardItems.map((item, index) => {
          const hasSubItems = item.subItems?.length > 0;

          return (
            <div key={index}>
              <Items
                to={item.navigate}
                end={!hasSubItems}
                openSidebar={openSidebar}
              >
                <TitleAndIcon openSidebar={openSidebar}>
                  {openSidebar ? (
                    <img src={item.icon} alt="" style={{ filter: "brightness(0) invert(1)" }} />
                  ) : (
                    <p>{item.icon}</p>
                  )}
                  {openSidebar && <div>{item.title}</div>}
                </TitleAndIcon>
              </Items>

              {hasSubItems && (
                <SubItemsContainer
                  style={{
                    maxHeight: "500px",
                    overflow: "hidden",
                    transition: openSidebar
                      ? "max-height 0.4s ease"
                      : "max-height ease",
                  }}
                >
                  {item.subItems.map((sub, subIdx) => (
                    <SubItem
                      key={subIdx}
                      onClick={
                        isMobile ? () => setOpenSidebar(false) : undefined
                      }
                      to={sub.navigate}
                      className={({ isActive }) => (isActive ? "active" : "")}
                    >
                      {openSidebar && <span style={{ fontSize: "20px" }}>•</span>}
                      {openSidebar && <div>{sub.subTitle}</div>}
                    </SubItem>
                  ))}
                </SubItemsContainer>
              )}
            </div>
          );
        })}
        {/* <img style={{ marginTop: "30px" }} src={help} alt="" /> */}
      </DrawerSidebar>
    </>
  );
};

export default Sidebar;

const DrawerSidebar = styled(Drawer)`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
`;

const LogoContainer = styled("div")`
  height: 100px;
  height: 120px;
  display: grid;
  place-items: center;
  position: sticky;
  background-color: #1e2129;
  border-bottom: 1px solid #2c3039;
  top: 0;
  z-index: 1;
  padding: 40px;
`;

const LogoImage = styled("img")`
  width: 100%;

`;

const ScrizaLogo = styled("img")``;

const StyledNavLink = styled(NavLink)`
  width: 100%;
  font: 400 15px "Mulish";
  display: flex;
  flex-direction: ${(props) => (props.openSidebar ? "row" : "column")};
  justify-content: flex-start;
  align-items: center;
  height: ${(props) => (props.openSidebar ? "50px" : "60px")};
  text-decoration: none;
  color: #8b9bb4;
  padding-left: 26px;
  padding-top: 40px;

  &.active {
    border-radius: 5px;

    color: #448aff;

    &:hover {
      color: #448aff;
    }
  }

  &:hover {
    color: white;
  }
`;

const Items = ({ to, end, children, ...rest }) => (
  <StyledNavLink to={to} end={end} {...rest}>
    {children}
  </StyledNavLink>
);

const TitleAndIcon = styled("div")`
  display: flex;
  align-items: center;
  gap: 15px;
  padding-right: 16px;
`;

const SubItemsContainer = styled("div")`
  display: flex;
  flex-direction: column;
  padding: 20px 0 0 60px;
`;

const SubItem = styled(NavLink)`
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  border: none;
  color: #8b9bb4;
  font-size: 15px;
  font-weight: 400;
  font-family: "Manrope";

  padding: 6px 6px;

  &.active {
    color: #448aff;
  }

  &:hover {
    color: white;
  }
`;

const LogoMobile = styled("div")`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 0.1px solid black;
  position: sticky;
  top: 0;
  z-index: 1;
  background-color: #1e2129;
  padding: 10px;
`;

const WestIconStyle = styled(WestIcon)`
  color: rgb(231, 231, 231);
  margin-right: 13px;
`;

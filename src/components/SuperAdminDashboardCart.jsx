import { styled } from "@mui/material";
import React from "react";

const SuperAdminDashboardCart = ({ title, image, number }) => {
  return (
    <CartContainer>
      <CardTitle>{title}</CardTitle>
      <hr style={{ border: "0.75px solid #DDDDEB" }} />
      <CardLastDiv>
        <img src={image} alt={title} style={{ width: "45px", height: "45px" }} />
        <CardNumber>{number}</CardNumber>
      </CardLastDiv>
    </CartContainer>
  );
};

export default SuperAdminDashboardCart;

const CartContainer = styled("div")`
  flex: 1;
  min-width: 250px;
  border-radius: 10px;
  border: 1px solid #e8e8e8;
  background: linear-gradient(to bottom, #ffffff, #eef5ff);
  display: flex;
  flex-direction: column;
  gap: 15px;
  padding: 25px;
  height: 100%;

  @media (max-width: 900px) {
    padding: 20px;
  }

  @media (max-width: 600px) {
    padding: 18px;
  }
`;

const CardLastDiv = styled("div")`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const CardTitle = styled("p")`
  font-size: 18px;
  font-weight: 500;
  font-family: "Manrope";
  line-height: 100%;
  color: #222;

  @media (max-width: 600px) {
    font-size: 16px;
  }
`;

const CardNumber = styled("p")`
  font-size: 30px;
  font-weight: 700;
  font-family: "Manrope";

  @media (max-width: 600px) {
    font-size: 24px;
  }
`;

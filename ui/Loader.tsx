import { keyframes, styled } from "@aura-ui/react";

const flashing = keyframes({
  "0%": {
    opacity: 0.2,
  },
  "50%": {
    opacity: 1,
  },
  "100%": {
    opacity: 0.2,
  },
});

const Wrapper = styled("div", {
  span: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    backgroundColor: "$slate12",
    margin: "0 4px",
    display: "inline-block",

    "&:nth-child(1)": {
      animation: `${flashing} 1.4s infinite linear`,
    },

    "&:nth-child(2)": {
      animation: `${flashing} 1.4s infinite linear .2s`,
    },

    "&:nth-child(3)": {
      animation: `${flashing} 1.4s infinite linear .4s`,
    },
  },
});

export const Loader = () => (
  <Wrapper>
    <span></span>
    <span></span>
    <span></span>
  </Wrapper>
);

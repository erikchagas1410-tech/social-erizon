export const ELEMENTS = {
  block: (accent: string) => ({
    type: "div",
    props: {
      style: {
        position: "absolute",
        width: "60%",
        height: "40%",
        background: accent,
        top: "10%",
        left: "-10%",
        transform: "rotate(-8deg)"
      }
    }
  }),

  diagonalLine: (accent: string) => ({
    type: "div",
    props: {
      style: {
        position: "absolute",
        width: "200%",
        height: "2px",
        background: accent,
        transform: "rotate(25deg)",
        top: "40%",
        left: "-50%"
      }
    }
  }),

  grid: () => ({
    type: "div",
    props: {
      style: {
        position: "absolute",
        inset: 0,
        backgroundImage:
          "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
        backgroundSize: "60px 60px"
      }
    }
  }),

  glow: (accent: string) => ({
    type: "div",
    props: {
      style: {
        position: "absolute",
        width: "300px",
        height: "300px",
        borderRadius: "999px",
        background: accent,
        filter: "blur(120px)",
        top: "-80px",
        right: "-80px",
        opacity: 0.4
      }
    }
  }),

  noise: () => ({
    type: "div",
    props: {
      style: {
        position: "absolute",
        inset: 0,
        opacity: 0.08,
        backgroundImage:
          "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.9) 0 1px, transparent 1px), radial-gradient(circle at 80% 40%, rgba(255,255,255,0.7) 0 1px, transparent 1px), radial-gradient(circle at 50% 80%, rgba(255,255,255,0.8) 0 1px, transparent 1px)",
        backgroundSize: "18px 18px"
      }
    }
  }),

  lines: (accent: string) => ({
    type: "div",
    props: {
      children: [
        {
          type: "div",
          props: {
            style: {
              position: "absolute",
              top: "12%",
              left: "10%",
              width: "100px",
              height: "2px",
              background: "#FFFFFF"
            }
          }
        },
        {
          type: "div",
          props: {
            style: {
              position: "absolute",
              top: "10%",
              right: "8%",
              width: "1px",
              height: "80%",
              background: `${accent}33`
            }
          }
        }
      ]
    }
  }),

  minimal: (accent: string) => ({
    type: "div",
    props: {
      style: {
        position: "absolute",
        top: "24%",
        right: "8%",
        width: "28%",
        height: "42%",
        border: `1px solid ${accent}22`
      }
    }
  }),

  bigNumber: (accent: string) => ({
    type: "div",
    props: {
      style: {
        position: "absolute",
        fontSize: "220px",
        fontWeight: 900,
        color: accent,
        opacity: 0.15,
        top: "10%",
        left: "5%"
      },
      children: "90%"
    }
  }),

  warningStripe: () => ({
    type: "div",
    props: {
      style: {
        position: "absolute",
        width: "200%",
        height: "40px",
        background:
          "repeating-linear-gradient(45deg,#000,#000 20px,#FFD600 20px,#FFD600 40px)",
        transform: "rotate(-8deg)",
        top: "20%"
      }
    }
  }),

  glitchBar: (accent: string) => ({
    type: "div",
    props: {
      style: {
        position: "absolute",
        height: "6px",
        width: "100%",
        background: accent,
        top: "50%",
        opacity: 0.6
      }
    }
  })
};

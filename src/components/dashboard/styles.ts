import type { CSSProperties } from "react";

export const styles = {
  container: { display: "flex", flexDirection: "column", padding: 16, gap: 24 },
  row: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    width: "100%",
    gap: 16,
    flexWrap: "wrap",
  },
  refreshButton: {
    width: 54,
    aspectRatio: 1,
  },
  createSessionButton: {
    height: 54,
    padding: "0 16px",
  },
  redirectUriField: {
    padding: 10,
    fontSize: 16,
    justifyContent: "flex-start",
    alignItems: "center",
    border: "1px solid #F0E68C",
    borderRadius: 8,
    display: "block",
    wordBreak: "break-all",
    whiteSpace: "pre-wrap",
    overflow: "scroll",
  },
} satisfies Record<string, CSSProperties>;

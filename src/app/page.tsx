"use client";

import React from "react";
import styles from "./page.module.css";

// import HighlightText from "./highlightText/page";
import HighlightedText from "./highlightedText/page";
// import CheckText from "./highlightedText/copyText";

export default function AdCheckTool() {
  return (
    <div className={styles.container}>
      {/* <HighlightText /> */}
      <HighlightedText />
      {/* <CheckText /> */}
    </div>
  );
}

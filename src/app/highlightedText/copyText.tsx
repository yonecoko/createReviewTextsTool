"use client";

import styles from "./highlightTextArea.module.css";

export default function CopyText() {
  return (
    <div className={styles.copyTextContainer}>
      <textarea className={styles.copyTextarea} />
    </div>
  );
}

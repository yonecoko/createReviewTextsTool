"use client";

import { useState } from "react";
import ReviewsPrintTexts from "./reviewsPrintTexts";
import styles from "./highlightTextArea.module.css";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import { Box, Tooltip } from "@mui/material";
import LawsPrintText from "./lawsPrintText";
import CopyText from "./copyText";

async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
  } catch (error) {
    console.log(error || "コピーに失敗しました");
  }
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box>
          <div>{children}</div> {/* <Typography>を<div>に変更 */}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

export default function HighlightTextPage() {
  const [openTip, setOpenTip] = useState<boolean>(false);
  const anyText = ["◆指摘なし\n", "【確認済み】\n", "【修正完了済み】\n"];
  const [reBtn, setReBtn] = useState<boolean>(false);
  const [tiktokBtn, setTiktokBtn] = useState<boolean>(false);

  const handleCloseTip = (): void => {
    setOpenTip(false);
  };

  const nonChecked = () => {
    setOpenTip(true);
    if (value === 0) {
      copyToClipboard(anyText[0]);
    } else if (value === 1) {
      copyToClipboard(anyText[1]);
    } else {
      copyToClipboard(anyText[2]);
    }
  };

  const [value, setValue] = useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const lawsComponent = () => {
    return (
      <>
        <div className="checkbox-container">
          <Tooltip
            arrow
            open={openTip}
            onClose={handleCloseTip}
            disableHoverListener
            placement="top"
            title="Copied!"
          >
            <button className={styles.bgWhite} onClick={nonChecked}>
              {anyText[0]}
            </button>
          </Tooltip>
        </div>

        <LawsPrintText />
      </>
    );
  };

  const reviewComponent = () => {
    return (
      <>
        <div className="checkbox-container">
          <Tooltip
            arrow
            open={openTip}
            onClose={handleCloseTip}
            disableHoverListener
            placement="top"
            title="Copied!"
          >
            <button className={styles.bgWhite} onClick={nonChecked}>
              {anyText[1]}
            </button>
          </Tooltip>
          <button
            className={reBtn ? styles.bgBlue : styles.bgWhite}
            onClick={() => setReBtn(!reBtn)}
          >
            再投稿あり
          </button>
          {reBtn && (
            <button
              className={tiktokBtn ? styles.bgBlue : styles.bgWhite}
              onClick={() => setTiktokBtn(!tiktokBtn)}
            >
              Tiktok
            </button>
          )}
        </div>

        <ReviewsPrintTexts reBtn={reBtn} tiktokBtn={tiktokBtn} />
      </>
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.createTextContainer}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={value}
            onChange={handleChange}
            aria-label="basic tabs example"
          >
            <Tab label="薬機チェック" {...a11yProps(0)} />
            <Tab label="指摘チェック" {...a11yProps(1)} />
            <Tab label="修正チェック" {...a11yProps(2)} />
          </Tabs>
        </Box>
        <CustomTabPanel value={value} index={0}>
          {lawsComponent()}
        </CustomTabPanel>
        <CustomTabPanel value={value} index={1}>
          {reviewComponent()}
        </CustomTabPanel>
        <CustomTabPanel value={value} index={2}>
          現在開発中です。
        </CustomTabPanel>
      </div>
      <CopyText />
    </div>
  );
}

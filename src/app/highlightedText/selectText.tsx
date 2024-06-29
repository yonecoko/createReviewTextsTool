"use client";

import styles from "./highlightTextArea.module.css";
import { useState, useEffect } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "@/app/config/firebase";

type DocumentData = {
  id: string;
  text: string;
  details: string;
  type: string;
};

export default function SelectText(props: any) {
  type Text = string;
  type DetailText = string;
  type MistakeText = string;
  type RightText = string;

  const [AdReviewText, setAdReviewText] = useState<DocumentData[]>([]);

  const [typeText, setTypeText] = useState<DocumentData[]>([]);

  const [medicinesTexts, setMedicinesTexts] = useState<DocumentData[]>([]);
  const [exaggerationTexts, setExaggerationTexts] = useState<DocumentData[]>(
    []
  );
  const [incompleteRequestTexts, setIncompleteRequestTexts] = useState<
    DocumentData[]
  >([]);
  const [inadequacyOfDescriptionTexts, setInadequacyOfDescriptionTexts] =
    useState<DocumentData[]>([]);
  const [relationshipDisclosureTexts, setRelationshipDisclosureTexts] =
    useState<DocumentData[]>([]);
  const [otherTexts, setOtherTexts] = useState<DocumentData[]>([]);

  const [selectType, setSelectType] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState<Text>("");
  const [detailText, setDetailText] = useState<DetailText>("");
  const [mistakeText, setMistakeText] = useState<MistakeText>("");
  const [rightText, setRightText] = useState<RightText>("");
  const types = [
    "薬機法",
    "景表法",
    "依頼事項不備",
    "記載不備",
    "関係性の明示",
    "その他",
  ];

  useEffect(() => {
    const adReviewTextDB = collection(db, "AdReviewText");

    const unsubscribe = onSnapshot(
      adReviewTextDB,
      (snapshot) => {
        const AdReviewText = snapshot.docs.map((doc) => {
          // console.log("doc data:", doc.data()); // デバッグ情報をコンソールに出力
          return doc.data() as DocumentData;
        });
        setAdReviewText(AdReviewText);
        props.getText([...AdReviewText, AdReviewText]);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching LawCheck data:", error); // エラーメッセージを出力
        setLoading(false);
      }
    );

    const typeUnsubscribes = types.map((type) => {
      const typeQuery = query(adReviewTextDB, where("type", "==", type));
      return onSnapshot(
        typeQuery,
        (snapshot) => {
          const typeData = snapshot.docs.map(
            (doc) => doc.data() as DocumentData
          );

          console.log(typeData);
          typeData.map((doc) => {
            switch (doc.type) {
              case "薬機法":
                setMedicinesTexts([...typeData]);
                break;
              case "景表法":
                setExaggerationTexts([...typeData]);
                break;
              case "依頼事項不備":
                setIncompleteRequestTexts([...typeData]);
                break;
              case "記載不備":
                setInadequacyOfDescriptionTexts([...typeData]);
                break;
              case "関係性の明示":
                setRelationshipDisclosureTexts([...typeData]);
                break;
              case "その他":
                setOtherTexts([...typeData]);
                break;
              default:
                break;
            }
          });
        },
        (error) => {
          console.error("Error fetching LawCheck data:", error); // エラーメッセージを出力
          setLoading(false);
        }
      );
    });
    setText("");
    console.log(typeText);

    return () => {
      unsubscribe();
      typeUnsubscribes.forEach((unsubscribe) => unsubscribe());
    };
  }, []);

  useEffect(() => {}, [selectType]);

  const selectTexts = (): JSX.Element => {
    return (
      <>
        <select
          onChange={(e) => setText(e.target.value)}
          className={styles.selectText}
        >
          {selectType === "薬機法" &&
            medicinesTexts.map((item) => (
              <option key={item.text} value={item.text}>
                {item.text}
              </option>
            ))}
          {selectType === "景表法" &&
            exaggerationTexts.map((item) => (
              <option key={item.text} value={item.text}>
                {item.text}
              </option>
            ))}
          {selectType === "依頼事項不備" &&
            incompleteRequestTexts.map((item) => (
              <option key={item.text} value={item.text}>
                {item.text}
              </option>
            ))}
          {selectType === "記載不備" &&
            inadequacyOfDescriptionTexts.map((item) => (
              <option key={item.text} value={item.text}>
                {item.text}
              </option>
            ))}
          {selectType === "関係性の明示" &&
            relationshipDisclosureTexts.map((item) => (
              <option key={item.text} value={item.text}>
                {item.text}
              </option>
            ))}
          {selectType === "その他" &&
            otherTexts.map((item) => (
              <option key={item.text} value={item.text}>
                {item.text}
              </option>
            ))}
        </select>
      </>
    );
  };

  const printedTexts = () => {
    if (selectType === "その他") {
      return <></>;
    } else if (text.includes("不備")) {
      return (
        <>
          <div className={styles.textContainer}>
            <div className={styles.smallText}>【誤】</div>
            <input
              className={styles.detailText}
              type="text"
              value={mistakeText}
              onChange={(e) => setMistakeText(e.target.value)}
            />
          </div>
          <div className={styles.textContainer}>
            <div className={styles.smallText}>【正】</div>
            <input
              className={styles.detailText}
              type="text"
              value={rightText}
              onChange={(e) => setRightText(e.target.value)}
            />
          </div>
        </>
      );
    } else if (text.includes("タイアップタグがない")) {
      return (
        <>
          <div className={styles.textContainer}>
            <div className={styles.smallText}>アカウント</div>
            <input
              className={styles.detailText}
              type="text"
              value={mistakeText}
              onChange={(e) => setMistakeText(e.target.value)}
            />
          </div>
          <div className={styles.textContainer}>
            <div className={styles.smallText}>関係性の明示</div>
            <input
              className={styles.detailText}
              type="text"
              value={rightText}
              onChange={(e) => setRightText(e.target.value)}
            />
          </div>
        </>
      );
    } else {
      return (
        <textarea
          className={styles.detailText}
          value={detailText}
          onChange={(e) => setDetailText(e.target.value)}
        />
      );
    }
  };

  const handleSubmit = () => {
    props.getText(text);
    setText(text);
    setDetailText("");
    setMistakeText("");
    setRightText("");
    props.getDetailText(detailText);
    props.getMistakeText(mistakeText);
    props.getRightText(rightText);
    // console.log(text);
  };

  return (
    <div className={styles.createTextContainer}>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <>
          <select
            // onChange={(e) => setSelectType(e.target.value)}
            className={styles.selectText}
            onChange={(e) => setSelectType(e.target.value)}
          >
            {types.map((type, i) => (
              <option key={i} value={type}>
                {type}
              </option>
            ))}
          </select>
          {selectTexts()}
        </>
      )}

      {printedTexts()}
      <button className={styles.inputBtn} onClick={handleSubmit}>
        追加
      </button>
    </div>
  );
}

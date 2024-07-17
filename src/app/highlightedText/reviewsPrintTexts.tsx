"use client";

import { db } from "@/app/config/firebase";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import parse from "html-react-parser";
import { useEffect, useState } from "react";
import styles from "./highlightTextArea.module.css";

type DocumentData = {
  id: string;
  text: string;
  details: string;
  type: string;
};

type Props = {
  reBtn: boolean;
  tiktokBtn: boolean;
};

export default function ReviewsPrintTexts(props: Props) {
  const { reBtn, tiktokBtn } = props;
  const [allData, setAllData] = useState<DocumentData[]>([]); // 全てのデータ
  const [selectLoading, setSelectLoading] = useState(true); // 選択肢のロード
  const [printTexts, setPrintTexts] = useState<string[]>([]); // 出力する定型文をオブジェクトにまとめたの配列

  const [medicinesTexts, setMedicinesTexts] = useState<DocumentData[]>([]); // 薬機法の定型文
  const [exaggerationTexts, setExaggerationTexts] = useState<DocumentData[]>(
    []
  ); // 景表法の定型文
  const [incompleteRequestTexts, setIncompleteRequestTexts] = useState<
    DocumentData[]
  >([]); //依頼事項不備の定型文
  const [inadequacyOfDescriptionTexts, setInadequacyOfDescriptionTexts] =
    useState<DocumentData[]>([]); // 記載不備の定型文
  const [relationshipDisclosureTexts, setRelationshipDisclosureTexts] =
    useState<DocumentData[]>([]); // 関係性の明示の定型文
  const [otherTexts, setOtherTexts] = useState<DocumentData[]>([]); // その他の定型文

  const [printLoading, setPrintLoading] = useState(true); // 出力する定型文のロード
  const [getText, setGetText] = useState<string>("");
  const [detailText, setDetailText] = useState<string>("");
  const [mistakeText, setMistakeText] = useState<string>("");
  const [rightText, setRightText] = useState<string>("");
  const [addBtn, setAddBtn] = useState(false);
  const [isCopy, setIsCopy] = useState(false);

  useEffect(() => {
    const adReviewTextDB = collection(db, "AdReviewText");

    const typeUnsubscribes = selectedType.map((type) => {
      const typeQuery = query(adReviewTextDB, where("type", "==", type.name));
      return onSnapshot(
        typeQuery,
        (snapshot) => {
          const typeData = snapshot.docs.map(
            (doc) => doc.data() as DocumentData
          );

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
          setSelectLoading(false);
        },
        (error) => {
          console.error("Error fetching LawCheck data:", error); // エラーメッセージを出力
          setSelectLoading(false);
        }
      );
    });
    setGetText("");

    return () => {
      typeUnsubscribes.forEach((unsubscribe) => unsubscribe());
    };
  }, []);

  useEffect(() => {
    // AdReviewTextのデータを一括取得
    const unsubscribe = onSnapshot(
      collection(db, "AdReviewText"),
      (snapshot) => {
        const AdReviewText = snapshot.docs.map((doc) => {
          return doc.data() as DocumentData;
        });
        setAllData(AdReviewText);
        setPrintLoading(false);
      },
      (error) => {
        console.error("Error fetching LawCheck data:", error);
        setPrintLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (addBtn) {
      const selectedData = allData.find((data) => data.text === getText);
      if (selectedData) {
        const formatMarkdown = (markdown: string): string => {
          // 不適切な改行とエスケープを修正する処理
          return markdown.replace(/\\n/g, "\n").replace(/\\/g, "");
        };

        if (reBtn) {
          if (detailText.length >= 1) {
            const completeText = formatMarkdown(selectedData.details)
              .replaceAll("input", detailText)
              .replaceAll(
                "Xonly",
                "※X投稿の注釈記載について、注釈内容を明確にするため、\n注釈が必要な文言と注釈内容は『同じ投稿内』へご記載ください。\n離して記載する場合は、注釈が必要な文言の『すぐ下のスレッド』へ注釈内容のご記載をお願いいたします。\n"
              )
              .replaceAll(
                "rePost",
                "※X投稿の場合、スレッド（ツリー）投稿への記載でも問題ございません。\n"
              );

            const fixedText = parse(completeText) as string;
            setPrintTexts([...printTexts, fixedText]);
          } else {
            const revisionText = formatMarkdown(selectedData.details)
              .replaceAll("right", rightText)
              .replaceAll("mistake", mistakeText)
              .replaceAll(
                "Xonly",
                "※X投稿の注釈記載について、注釈内容を明確にするため、\n注釈が必要な文言と注釈内容は『同じ投稿内』へご記載ください。\n離して記載する場合は、注釈が必要な文言の『すぐ下のスレッド』へ注釈内容のご記載をお願いいたします。\n"
              )
              .replaceAll(
                "rePost",
                "※X投稿の場合、スレッド（ツリー）投稿への記載でも問題ございません。\n"
              );
            const revisionFixedText = parse(revisionText) as string;
            setPrintTexts([...printTexts, revisionFixedText]);
          }
        } else {
          if (detailText.length >= 1) {
            const completeText = formatMarkdown(selectedData.details)
              .replaceAll("input", detailText)
              .replaceAll("Xonly", "")
              .replaceAll("rePost", "");
            const fixedText = parse(completeText) as string;
            setPrintTexts([...printTexts, fixedText]);
          } else {
            const revisionText = formatMarkdown(selectedData.details)
              .replaceAll("right", rightText)
              .replaceAll("mistake", mistakeText)
              .replaceAll("Xonly", "")
              .replaceAll("rePost", "");
            const revisionFixedText = parse(revisionText) as string;
            setPrintTexts([...printTexts, revisionFixedText]);
          }
        }

        setAddBtn(false);
        setMistakeText("");
        setRightText("");
        setDetailText("");
      }
    }
  }, [addBtn, allData, getText, detailText, mistakeText, rightText]);

  const deleteValue = (index: number) => {
    setPrintTexts(printTexts.filter((_, i) => i !== index));
  };
  const getDateIn7Days = () => {
    const today = new Date();
    const futureDate = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    const month = futureDate.getMonth() + 1; // 月は0から始まるので1を足す
    const date = futureDate.getDate();
    const day = futureDate.getDay();
    const weekday = ["日", "月", "火", "水", "木", "金", "土"];

    return { month, date, weekday: weekday[day] };
  };

  const reBtnRequest = () => {
    return reBtn
      ? "ご投稿を削除いただきましたら、再投稿をお願いできますと幸いです。\n★再投稿いただきましたら、【お問合せ】までURLをご連絡ください。\n\n"
      : "修正後の連絡は不要でございます。\n\n";
  };

  const [copyText, setCopyText] = useState("");

  const copyAllText = async () => {
    let count = 0;

    printTexts.forEach((text) => {
      const quoteCount = (text.match(/「/g) || []).length;
      const errorCount = (text.match(/【誤】/g) || []).length;
      count += quoteCount + errorCount;
    });

    const { month, date, weekday } = getDateIn7Days();

    const allText =
      `【ご対応期限】${month}月${date}日（${weekday}) 12：00まで\n【修正・削除対象箇所】${count}件\n\n修正・削除の対象箇所は以下の通りとなります。\n` +
      reBtnRequest() +
      printTexts.map((item) => (item ? item : "")).join("\n");

    const tiktokText =
      allText +
      "※ご投稿修正に関するご注意※\n-------------------\nTikTokは、投稿日より『7日以上』経過いたしますと、\n内容の編集ができない仕様となっております。\n大変お手数をおかけいたしますが、\nご修正の際は投稿を削除いただき、上記内容のご修正・再投稿をお願いいたします。\n★再投稿いただきましたら、【お問合せ】までURLをご連絡ください。\n-------------------\n";

    try {
      !tiktokBtn
        ? await navigator.clipboard.writeText(allText)
        : await navigator.clipboard.writeText(tiktokText);
      setIsCopy(true);
      setCopyText(allText);
    } catch (err) {
      console.error("コピーできません: ", err);
    }

    // setPrintTexts([]);
  };

  const selectTexts = (): JSX.Element => {
    return (
      <>
        <select
          onChange={(e) => setGetText(e.target.value)}
          className={styles.selectText}
        >
          <option key={"選択してください"} value={"選択してください"}>
            選択してください
          </option>
          {selectedType[0].done === true &&
            medicinesTexts.map((item) => (
              <option key={item.text} value={item.text}>
                {item.text}
              </option>
            ))}
          {selectedType[1].done === true &&
            exaggerationTexts.map((item) => (
              <option key={item.text} value={item.text}>
                {item.text}
              </option>
            ))}
          {selectedType[2].done === true &&
            incompleteRequestTexts.map((item) => (
              <option key={item.text} value={item.text}>
                {item.text}
              </option>
            ))}
          {selectedType[3].done === true &&
            inadequacyOfDescriptionTexts.map((item) => (
              <option key={item.text} value={item.text}>
                {item.text}
              </option>
            ))}
          {selectedType[4].done === true &&
            relationshipDisclosureTexts.map((item) => (
              <option key={item.text} value={item.text}>
                {item.text}
              </option>
            ))}
          {selectedType[5].done === true &&
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
    if (selectedType[5].done === true) {
      return <></>;
    } else if (getText.includes("不備") || getText.includes("投稿URL")) {
      return (
        <>
          <div className={styles.textContainer}>
            <div className={styles.smallText}>【誤】</div>
            <textarea
              className={styles.detailText}
              value={mistakeText}
              onChange={(e) => setMistakeText(e.target.value)}
            />
          </div>
          <div className={styles.textContainer}>
            <div className={styles.smallText}>【正】</div>
            <textarea
              className={styles.detailText}
              value={rightText}
              onChange={(e) => setRightText(e.target.value)}
            />
          </div>
        </>
      );
    } else if (getText.includes("タイアップタグがない")) {
      return (
        <>
          <div className={styles.textContainer}>
            <div className={styles.smallText}>アカウント</div>
            <textarea
              className={styles.detailText}
              value={mistakeText}
              onChange={(e) => setMistakeText(e.target.value)}
            />
          </div>
          <div className={styles.textContainer}>
            <div className={styles.smallText}>関係性の明示</div>
            <textarea
              className={styles.detailText}
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

  const [selectedType, setSelectedType] = useState([
    { name: "薬機法", done: false },
    { name: "景表法", done: false },
    { name: "依頼事項不備", done: false },
    { name: "記載不備", done: false },
    { name: "関係性の明示", done: false },
    { name: "その他", done: false },
  ]);

  const handleTypeClick = (typeName: string) => {
    setSelectedType((prevSelectedType) =>
      prevSelectedType.map((type) =>
        type.name === typeName
          ? { ...type, done: !type.done }
          : { ...type, done: false }
      )
    );
  };

  const selectTypes = () => {
    return selectedType.map((type) => (
      <input
        key={type.name}
        id={type.name}
        value={type.name}
        className={`${styles.typeBtn} ${type.done ? styles.selected : ""}`}
        type="button"
        onClick={() => handleTypeClick(type.name)}
      />
    ));
  };

  const handleSubmit = () => {
    setGetText(getText);
    setAddBtn(true);
    console.log(printTexts);
  };

  const changeText = (index: number, newText: string) => {
    setPrintTexts((prevPrintTexts) =>
      prevPrintTexts.map((text, i) => (i === index ? newText : text))
    );
  };

  const [relationshipWord, setRelationshipWord] = useState("");
  const [brandName, setBrandName] = useState("");
  const [productName, setProductName] = useState("");

  return (
    <>
      <div className={styles.createTextContainer}>
        {selectLoading ? (
          <div>Loading...</div>
        ) : (
          <>
            {selectTypes()}
            {selectTexts()}
          </>
        )}
        {/* 
        <input
          className={styles.detailText}
          type="text"
          value={relationshipWord}
          onChange={(e) => setRelationshipWord(e.target.value)}
        /> */}
        {printedTexts()}
        <button className={styles.inputBtn} onClick={handleSubmit}>
          追加
        </button>
      </div>
      <div className={styles.printTextContainer}>
        {printLoading ? (
          <div>Loading...</div>
        ) : (
          <>
            {printTexts.map((printText, i) => (
              <div className={styles.printTextArea} key={i}>
                <textarea
                  className={styles.printText}
                  value={printText}
                  onChange={(e) => changeText(i, e.target.value)}
                />
                <input
                  type="button"
                  className={styles.deleteBtn}
                  onClick={() => deleteValue(i)}
                  value={"x"}
                />
              </div>
            ))}
            {printTexts.length !== 0 && (
              <>
                <button
                  className={styles.inputBtn}
                  onClick={() => {
                    setPrintTexts([]);
                    setDetailText("");
                    setMistakeText("");
                    setRightText("");
                    setIsCopy(false);
                  }}
                >
                  全削除
                </button>
                <button className={styles.inputBtn} onClick={copyAllText}>
                  コピー
                </button>
                {isCopy && (
                  <>
                    <br />
                    <span className={styles.isCopy}>コピーしました！</span>
                  </>
                )}
              </>
            )}
          </>
        )}
      </div>
    </>
  );
}

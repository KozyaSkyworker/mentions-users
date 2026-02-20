import { useRef, useState, type ChangeEvent } from "react";
import { USERS } from "./model";

import classes from "./TextAreaMentions.module.css";

const KEYS = {
  BACKSPACE: "Backspace",
  DELETE: "Delete",
  AT: "@",
  SPACE: " ",
} as const;

export const TextAreaMentions = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isTypingUserName, setIsTypingUserName] = useState(false);
  const [currentUserNameSearch, setCurrentUserNameSearch] = useState("");
  const [currentTypingIndex, setCurrentTypingIndex] = useState(0);

  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const handleChange = (
    e: ChangeEvent<HTMLTextAreaElement, HTMLTextAreaElement>
  ) => {
    const currentText = e.target.value;
    // console.log("VALUE = ", currentText);
    if (isTypingUserName) {
      const currentCaretPosition = e.currentTarget.selectionStart;
      const lastIndexOfAtSymbol = currentText.lastIndexOf(
        "@",
        currentCaretPosition
      );
      const newSearch = currentText.slice(
        lastIndexOfAtSymbol,
        currentCaretPosition
      );
      setCurrentUserNameSearch(newSearch);
      // console.log(newSearch);
    }
  };

  // console.log("CURRENT SEACH = ", currentUserNameSearch);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // console.log("LAST KEY = ", e.key);

    const CUT = e.ctrlKey && e.key.toLowerCase() === "x";

    if (e.key === KEYS.AT) {
      // console.log(e.key, e.currentTarget.selectionStart);
      const selectionStartAt = e.currentTarget.selectionStart;
      const beforeText = e.currentTarget.value.slice(0, selectionStartAt);
      const afterText = e.currentTarget.value.slice(selectionStartAt);

      if (
        beforeText.length > 0 &&
        beforeText[beforeText.length - 1] !== KEYS.SPACE
      ) {
        return;
      }
      setIsTypingUserName(true);

      e.preventDefault();

      // open the mention list
      // console.log("open the mention list");
      setIsOpen(true);

      // const selectionStartAt = e.currentTarget.selectionStart;
      // const beforeText = e.currentTarget.value.slice(0, selectionStartAt);
      // const afterText = e.currentTarget.value.slice(selectionStartAt);

      const newText = `${beforeText}${KEYS.AT}${afterText}`;
      // console.log(newText);
      e.currentTarget.value = newText;
      // setText(newText);
      // console.log(selectionStartAt);
      e.currentTarget.setSelectionRange(
        selectionStartAt + 1,
        selectionStartAt + 1
      );
      setCurrentTypingIndex(selectionStartAt);
      //   e.currentTarget.selectionEnd = selectionStartAt;
    } else if (e.key === KEYS.BACKSPACE || e.key === KEYS.DELETE || CUT) {
      const start = e.currentTarget.selectionStart;
      const end = e.currentTarget.selectionEnd;
      const value = e.currentTarget.value;
      let deletedChar = "";

      if (start === end) {
        if (e.key === KEYS.BACKSPACE) {
          deletedChar = value.substring(start - 1, start);
        } else if (e.key === KEYS.DELETE) {
          deletedChar = value.substring(start, start + 1);
        }
      } else {
        deletedChar = value.substring(start, end);
      }
      // console.log("Deleted character(s): ", deletedChar);

      if ((deletedChar === KEYS.AT || deletedChar === value) && isOpen) {
        setIsOpen(false);
      }
    }
    // else if (
    //   isTypingUserName &&
    //   !e.shiftKey &&
    //   !e.altKey &&
    //   !e.ctrlKey &&
    //   !e.metaKey
    // ) {
    //   setCurrentUserNameSearch((prev) => prev + e.key);
    // }
  };

  const handleInsertUser = (userName: string) => {
    if (!textAreaRef.current) return;

    const symbolBeforeNewUserName = textAreaRef.current.value
      .slice(0, currentTypingIndex + 1)
      .at(-1);

    const actualUserName =
      symbolBeforeNewUserName === KEYS.AT ? userName.slice(1) : userName;

    const before = textAreaRef.current.value.slice(0, currentTypingIndex + 1);
    const after = textAreaRef.current.value.slice(currentTypingIndex + 1);

    const maxSlicedLength = Math.max(currentUserNameSearch.length - 1, 0);

    const newText = `${before}${actualUserName}${KEYS.SPACE}${after.slice(
      maxSlicedLength
    )}`;

    textAreaRef.current.value = newText;

    textAreaRef.current.focus();
    textAreaRef.current.setSelectionRange(
      textAreaRef.current.value.slice(0, currentTypingIndex + 1).length +
        actualUserName.length +
        1,
      textAreaRef.current.value.slice(0, currentTypingIndex + 1).length +
        actualUserName.length +
        1
    );
    setCurrentTypingIndex(
      textAreaRef.current.value.slice(0, currentTypingIndex + 1).length +
        actualUserName.length
    );
    setIsTypingUserName(false);
    setIsOpen(false);
    setCurrentUserNameSearch("");
  };

  return (
    <>
      <textarea
        ref={textAreaRef}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        cols={46}
      />
      {isOpen && (
        <div className={classes.dropdown}>
          <ol className={classes.list}>
            {USERS.filter(({ userName }) =>
              userName.startsWith(currentUserNameSearch)
            ).map(({ id, fullName, userName }) => (
              <li
                className={classes.list__item}
                key={id}
                onClick={() => handleInsertUser(userName)}
              >
                <button>
                  <span className={classes.list__item__userName}>
                    {userName}
                  </span>
                  <span className={classes.list__item__fullName}>
                    {fullName}
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </div>
      )}
    </>
  );
};

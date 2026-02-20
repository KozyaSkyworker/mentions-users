import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
} from "react";
import { USERS } from "./model";

import getCaretCoordinates from "textarea-caret";

import classes from "./TextAreaMentions.module.css";

const KEYS = {
  BACKSPACE: "Backspace",
  DELETE: "Delete",
  AT: "@",
  SPACE: " ",
  NEW_LINE: "\n",
  ESCAPE: "Escape",
} as const;

export const TextAreaMentions = () => {
  const [dropdownState, setDropdownState] = useState({
    isOpen: false,
    coords: {
      left: 0,
      top: 0,
    },
  });
  const [isTypingUserName, setIsTypingUserName] = useState(false);
  const [currentUserNameSearch, setCurrentUserNameSearch] = useState("");
  const [currentTypingIndex, setCurrentTypingIndex] = useState(0);

  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const closeDropDown = useCallback(() => {
    setIsTypingUserName(false);
    setDropdownState({ isOpen: false, coords: { left: 0, top: 0 } });
    setCurrentUserNameSearch("");
  }, []);

  const handleChange = (
    e: ChangeEvent<HTMLTextAreaElement, HTMLTextAreaElement>
  ) => {
    const currentText = e.target.value;

    if (isTypingUserName) {
      const currentCaretPosition = e.currentTarget.selectionStart;
      const lastIndexOfAtSymbol = currentText.lastIndexOf(
        KEYS.AT,
        currentCaretPosition
      );
      const newSearch = currentText.slice(
        lastIndexOfAtSymbol,
        currentCaretPosition
      );
      setCurrentUserNameSearch(newSearch);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const CUT = e.ctrlKey && e.key.toLowerCase() === "x";

    console.log(e.key);
    if (e.key === KEYS.ESCAPE) {
      e.preventDefault();
      closeDropDown();
    } else if (e.key === KEYS.AT) {
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

      const { left: caretLeft, top: caretTop } = getCaretCoordinates(
        e.currentTarget,
        e.currentTarget.selectionStart
      );
      const left = caretLeft + 10;
      const top = caretTop + 15;
      setDropdownState({
        isOpen: true,
        coords: { left, top },
      });

      const newText = `${beforeText}${KEYS.AT}${afterText}`;
      e.currentTarget.value = newText;
      e.currentTarget.setSelectionRange(
        selectionStartAt + 1,
        selectionStartAt + 1
      );
      setCurrentTypingIndex(selectionStartAt);
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

      if (
        (deletedChar === KEYS.AT || deletedChar === value) &&
        dropdownState.isOpen
      ) {
        closeDropDown();
      }
    }
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
    closeDropDown();
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        textAreaRef.current &&
        !textAreaRef.current.contains(e.target as Node)
      ) {
        closeDropDown();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [closeDropDown]);

  return (
    <div className={classes.wrapper}>
      <textarea
        ref={textAreaRef}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        cols={46}
      />
      {dropdownState.isOpen && (
        <div
          ref={dropdownRef}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              e.preventDefault();
              closeDropDown();
              textAreaRef.current?.focus();
            }
          }}
          className={classes.dropdown}
          style={{
            left: `${dropdownState.coords.left}px`,
            top: `${dropdownState.coords.top}px`,
          }}
        >
          <ol className={classes.list}>
            {USERS.filter(({ fullName, userName }) => {
              console.log(fullName, currentUserNameSearch);

              return (
                userName.startsWith(
                  currentUserNameSearch.toLocaleLowerCase()
                ) ||
                fullName
                  .toLocaleLowerCase()
                  .includes(currentUserNameSearch.slice(1).toLocaleLowerCase())
              );
            }).map(({ id, fullName, userName }) => (
              <li
                className={classes.list__item}
                key={id}
                onMouseDown={(e) => {
                  e.preventDefault();
                }}
                onClick={() => {
                  handleInsertUser(userName);
                }}
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
    </div>
  );
};

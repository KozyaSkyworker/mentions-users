import { useCallback, useRef, useState } from "react";

import { useDropDownState } from "./useDropDownState";
import { useClickOutside } from "./useClickOutside";
import { useUsers } from "./useUsers";

import { KEYS } from "./model";

import classes from "./TextAreaMentions.module.css";

export const TextAreaMentions = () => {
  const { dropdownState, resetState, showDropDownAtCoords } =
    useDropDownState();

  const {
    currentUserNameSearch,
    filteredUsers,
    updateUsersSearch,
    resetSearch,
  } = useUsers();

  const [isTypingUserName, setIsTypingUserName] = useState(false);
  const [currentTypingIndex, setCurrentTypingIndex] = useState(0);

  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const closeDropDown = useCallback(() => {
    setIsTypingUserName(false);
    resetState();
    resetSearch();
  }, [resetSearch, resetState]);

  useClickOutside({ textAreaRef, dropdownRef, closeDropDown });

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const CUT = e.ctrlKey && e.key.toLowerCase() === KEYS.x;

    if (e.key === KEYS.AT && e.shiftKey) {
      const selectionStartAt = e.currentTarget.selectionStart;
      showDropDownAtCoords(textAreaRef);
      setIsTypingUserName(true);
      setCurrentTypingIndex(selectionStartAt);
    } else if (e.key === KEYS.ENTER && dropdownState.isOpen) {
      e.preventDefault();
      if (filteredUsers.length > 0) {
        handleInsertUser(filteredUsers[0].userName);
      }

      closeDropDown();
    } else if (e.key === KEYS.ESCAPE) {
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

      e.preventDefault();

      showDropDownAtCoords(textAreaRef);
      setIsTypingUserName(true);

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
    closeDropDown();

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
  };

  return (
    <div className={classes.wrapper}>
      <textarea
        ref={textAreaRef}
        onChange={() => isTypingUserName && updateUsersSearch(textAreaRef)}
        onKeyDown={handleKeyDown}
        cols={46}
      />
      {dropdownState.isOpen && (
        <div
          ref={dropdownRef}
          onKeyDown={(e) => {
            if (e.key === KEYS.ESCAPE) {
              e.preventDefault();
              textAreaRef.current?.focus();
              closeDropDown();
            }
          }}
          className={classes.dropdown}
          style={{
            left: `${dropdownState.coords.left}px`,
            top: `${dropdownState.coords.top}px`,
          }}
        >
          <ol className={classes.list}>
            {filteredUsers.map(({ id, fullName, userName }) => (
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

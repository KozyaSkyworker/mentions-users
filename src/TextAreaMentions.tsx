import { useRef, useState, type ChangeEvent } from "react";
import { USERS } from "./model";

const TextAreaMentions = () => {
  const [isOpen, setIsOpen] = useState(false);
  // const [text, setText] = useState("");
  const [currentUserNameSearch, setCurrentUserNameSearch] = useState("");
  const [currentTypingIndex, setCurrentTypingIndex] = useState(0);

  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const handleChange = (
    e: ChangeEvent<HTMLTextAreaElement, HTMLTextAreaElement>
  ) => {
    console.log(e.target.value);
    // setText(e.target.value);
  };

  // console.log(
  // "CURRENT > ",
  // textAreaRef.current?.value.substring(currentTypingIndex)
  // );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "@") {
      const selectionStartAt = e.currentTarget.selectionStart;
      const beforeText = e.currentTarget.value.slice(0, selectionStartAt);
      const afterText = e.currentTarget.value.slice(selectionStartAt);

      if (beforeText.length > 0 && beforeText[beforeText.length - 1] !== " ") {
        return;
      }

      e.preventDefault();

      // open the mention list
      console.log("open the mention list");
      setIsOpen(true);

      //   const selectionStartAt = e.currentTarget.selectionStart;
      //   const beforeText = e.currentTarget.value.slice(0, selectionStartAt);
      //   const afterText = e.currentTarget.value.slice(selectionStartAt);

      const newText = `${beforeText}@${afterText}`;
      e.currentTarget.value = newText;
      //   setText(newText);
      console.log(selectionStartAt);
      e.currentTarget.setSelectionRange(
        selectionStartAt + 1,
        selectionStartAt + 1
      );
      setCurrentTypingIndex(selectionStartAt);
      //   e.currentTarget.selectionEnd = selectionStartAt;
    }
  };

  const handleInsertUser = (userName: string) => {
    if (!textAreaRef.current) return;

    const newText = `${textAreaRef.current.value.slice(
      0,
      currentTypingIndex + 1
    )}${userName} ${textAreaRef.current.value.slice(currentTypingIndex + 1)}`;

    textAreaRef.current.value = newText;

    textAreaRef.current.focus();
    textAreaRef.current.setSelectionRange(
      textAreaRef.current.value.slice(0, currentTypingIndex + 1).length +
        userName.length,
      textAreaRef.current.value.slice(0, currentTypingIndex + 1).length +
        userName.length
    );
    setCurrentTypingIndex(
      textAreaRef.current.value.slice(0, currentTypingIndex + 1).length +
        userName.length
    );
    // setText((prev) => {
    // const newText = `${prev.slice(
    //   0,
    //   currentTypingIndex
    // )}${userName} ${prev.slice(currentTypingIndex)}`;
    //   return newText;
    // });
  };

  return (
    <>
      <textarea
        ref={textAreaRef}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        cols={46}
        // value={text}
      />
      {isOpen && (
        <div>
          <ol>
            {USERS.filter(({ userName }) =>
              userName.includes(currentUserNameSearch)
            ).map(({ id, fullName, userName }) => (
              <li key={id} onClick={() => handleInsertUser(userName)}>
                <span>{userName}</span>
                <span>{fullName}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </>
  );
};

export default TextAreaMentions;

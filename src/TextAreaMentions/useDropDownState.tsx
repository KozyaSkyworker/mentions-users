import { useCallback, useState } from "react";
import { INITIAL_STATE } from "./model";
import getCaretCoordinates from "textarea-caret";

export const useDropDownState = () => {
  const [dropdownState, setDropdownState] = useState(INITIAL_STATE);

  const resetState = useCallback(() => {
    setDropdownState(INITIAL_STATE);
  }, []);

  const showDropDownAtCoords = useCallback(
    (textAreaRef: React.RefObject<HTMLTextAreaElement | null>) => {
      if (!textAreaRef.current) return;

      const textArea = textAreaRef.current;

      const { left: caretLeft, top: caretTop } = getCaretCoordinates(
        textArea,
        textArea.selectionStart
      );
      // если гор. скролл -textArea.scrollLeft
      const left = caretLeft + 10;
      const top = caretTop + 15 - textArea.scrollTop;
      setDropdownState({
        isOpen: true,
        coords: { left, top },
      });
    },
    []
  );

  return { dropdownState, resetState, showDropDownAtCoords };
};

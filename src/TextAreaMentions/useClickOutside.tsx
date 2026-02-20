import { useEffect } from "react";

interface Props {
  dropdownRef: React.RefObject<HTMLDivElement | null>;
  textAreaRef: React.RefObject<HTMLTextAreaElement | null>;
  closeDropDown: () => void;
}

export const useClickOutside = ({
  closeDropDown,
  dropdownRef,
  textAreaRef,
}: Props) => {
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
  }, [closeDropDown, dropdownRef, textAreaRef]);
};

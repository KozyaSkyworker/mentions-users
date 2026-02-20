import { useCallback, useState } from "react";
import { KEYS, USERS, type IUser } from "./model";

export const useUsers = () => {
  const [filteredUsers, setFilteredUsers] = useState<IUser[]>(USERS);
  const [currentUserNameSearch, setCurrentUserNameSearch] = useState("");

  const resetSearch = useCallback(() => {
    setCurrentUserNameSearch("");
  }, []);

  const updateUsersSearch = useCallback(
    (textAreaRef: React.RefObject<HTMLTextAreaElement | null>) => {
      if (!textAreaRef.current) return;
      const currentText = textAreaRef.current.value;

      const currentCaretPosition = textAreaRef.current.selectionStart;
      const lastIndexOfAtSymbol = currentText.lastIndexOf(
        KEYS.AT,
        currentCaretPosition
      );
      const newSearch = currentText.slice(
        lastIndexOfAtSymbol,
        currentCaretPosition
      );
      setCurrentUserNameSearch(newSearch);
      setFilteredUsers(
        USERS.filter(
          ({ fullName, userName }) =>
            userName.startsWith(newSearch.toLocaleLowerCase()) ||
            fullName
              .toLocaleLowerCase()
              .includes(newSearch.slice(1).toLocaleLowerCase())
        )
      );
    },
    []
  );

  return {
    currentUserNameSearch,
    filteredUsers,
    updateUsersSearch,
    resetSearch,
  };
};

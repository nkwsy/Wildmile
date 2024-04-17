"use client";
import { createContext, useContext, useState } from "react";
import useSWR from "swr";

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const fetcher = (url) => fetch(url).then((res) => res.json());
  const { data, mutate } = useSWR("/api/user", fetcher);
  //   const [userMenuOpened, setUserMenuOpened] = useState(false);

  return (
    <UserContext.Provider
      value={{ user: data?.user, mutate }}
      //   value={{ user: data?.user, mutate, userMenuOpened, setUserMenuOpened }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);

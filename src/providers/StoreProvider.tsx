"use client";

import { ReactNode, useEffect, useRef } from "react";
import { Provider } from "react-redux";
import { AppStore, makeStore } from "@/store/store";
import { readAuthSession } from "@/store/persistence";
import { setCredentials } from "@/store/authSlice";

const StoreProvider = ({ children }: { children: ReactNode }) => {
  const storeRef = useRef<AppStore>();

  if (!storeRef.current) {
    storeRef.current = makeStore();
  }

  useEffect(() => {
    const session = readAuthSession();
    if (session) {
      storeRef.current?.dispatch(setCredentials(session));
    }
  }, []);

  return <Provider store={storeRef.current}>{children}</Provider>;
};

export default StoreProvider;


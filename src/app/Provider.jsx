"use client";

import { Provider } from "react-redux";
import store from "@/redux/store";
import { ThemeProvider } from "@/components/ThemeProvider";

export function Providers({ children }) {
  return (
    <Provider store={store}>
      <ThemeProvider>{children}</ThemeProvider>
    </Provider>
  );
}

import { createContext } from "react";

export const Context = createContext({
  patient: {
    isAuthenticated: false,
    user: null,
  },
  admin: {
    isAuthenticated: false,
    user: null,
  },
  isBootstrapping: true,
});

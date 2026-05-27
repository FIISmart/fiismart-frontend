import { createContext, useContext } from "react";

const AuthenticatedLayoutContext = createContext(false);

export const AuthenticatedLayoutProvider = AuthenticatedLayoutContext.Provider;

export function useAuthenticatedLayout() {
  return useContext(AuthenticatedLayoutContext);
}

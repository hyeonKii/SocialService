import { User, getAuth, onAuthStateChanged } from "firebase/auth";
import { app } from "firebaseApp";
import {
  ReactNode,
  createContext,
  useEffect,
  useState,
} from "react";

interface AuthProps {
  children: ReactNode;
}

const AuthContext = createContext({
  user: null as User | null,
});

export const AuthContextProvider = ({ children }: AuthProps) => {
  const [currUser, setCurrUser] = useState<User | null>(null);
  const auth = getAuth(app);

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrUser(user);
      } else {
        setCurrUser(null);
      }
    });
  }, [auth]);

  return (
    <AuthContext.Provider value={{ user: currUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;

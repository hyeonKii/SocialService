import { Layout } from "components/Layout";
import Router from "components/Router";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { app } from "firebaseApp";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { useEffect, useState } from "react";
import { Loader } from "components/loader/Loader";
import { RecoilRoot } from "recoil";

function App() {
  const auth = getAuth(app);

  // isAuth가 초기화되었는지 확인하기 위해 init 상태를 설정
  const [init, setInit] = useState<boolean>(false);
  const [isAuth, setIsAuth] = useState<boolean>(!!auth?.currentUser);

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuth(true);
      } else {
        setIsAuth(false);
      }
      setInit(true);
    });
  }, [auth]);

  return (
    <RecoilRoot>
      <Layout>
        <ToastContainer
          theme="dark"
          autoClose={1000}
          hideProgressBar
          newestOnTop
        />
        {init ? <Router isAuth={isAuth} /> : <Loader />}
      </Layout>
    </RecoilRoot>
  );
}

export default App;

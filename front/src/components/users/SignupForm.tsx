import { FirebaseError } from "firebase/app";
import {
  createUserWithEmailAndPassword,
  getAuth,
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { app } from "firebaseApp";
import { useTranslation } from "hooks/useTranslation";
import React, { useState } from "react";
import { FaGithub } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function SignupForm() {
  const [error, setError] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [pwConfirm, setPwConfirm] = useState<string>("");
  const navigate = useNavigate();
  const t = useTranslation();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const auth = getAuth(app);
      await createUserWithEmailAndPassword(auth, email, password);
      navigate("/");
      toast.success("회원가입이 성공적으로 완료되었습니다 :)");
    } catch (e) {
      if (e instanceof FirebaseError) toast.error(e?.message);
    }
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {
      target: { name, value },
    } = e;

    if (name === "email") {
      setEmail(value);
      const validRegex =
        /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

      if (!value?.match(validRegex)) {
        setError("이메일 형식이 올바르지 않습니다.");
      } else {
        setError("");
      }
    }

    if (name === "password") {
      setPassword(value);

      if (value?.length < 8) {
        setError("비밀번호는 8자리 이상으로 입력해주세요");
      } else if (pwConfirm?.length > 0 && value !== pwConfirm) {
        setError("비밀번호와 비밀번호 확인 값이 다릅니다. 다시 확인해주세요.");
      } else {
        setError("");
      }
    }

    if (name === "pwConfirm") {
      setPwConfirm(value);

      if (value?.length < 8) {
        setError("비밀번호는 8자리 이상으로 입력해주세요");
      } else if (value !== password) {
        setError("비밀번호와 비밀번호 확인 값이 다릅니다. 다시 확인해주세요.");
      } else {
        setError("");
      }
    }
  };

  const onClickSocialLogin = async (providerType: string) => {
    const auth = getAuth(app);

    let provider;
    if (providerType === "google") {
      provider = new GoogleAuthProvider();
    }

    if (providerType === "github") {
      provider = new GithubAuthProvider();
    }

    if (provider) {
      await signInWithPopup(auth, provider)
        .then(() => toast.success("로그인 되었습니다!"))
        .catch((error) => {
          const errorMessage = error?.message;
          toast?.error(errorMessage);
        });
    }
  };

  return (
    <>
      <form className="form form--lg" onSubmit={handleSubmit}>
        <div className="form__title">{t("MENU_SIGNUP")}</div>
        <div className="form__block">
          <label htmlFor="email">{t("FORM_EMAIL")}</label>
          <input
            type="text"
            name="email"
            id="email"
            value={email}
            onChange={onChange}
            required
          />
        </div>
        <div className="form__block">
          <label htmlFor="password">{t("FORM_PASSWORD")}</label>
          <input
            type="password"
            name="password"
            id="password"
            value={password}
            onChange={onChange}
            required
          />
        </div>
        <div className="form__block">
          <label htmlFor="password_confirmation">
            {t("FORM_PASSWORD_CHECK")}
          </label>
          <input
            type="password"
            name="pwConfirm"
            id="pwConfirm"
            value={pwConfirm}
            onChange={onChange}
            required
          />
        </div>
        {error && error?.length > 0 && (
          <div className="form__block">
            <div className="form__error">{error}</div>
          </div>
        )}

        <div className="form__block">
          {t("YES_ACCOUNT")}
          <Link to="/users/login" className="form__link">
            {t("SIGNIN_LINK")}
          </Link>
        </div>
        <div className="form__block--lg">
          <button
            type="submit"
            className="form__btn-submit"
            disabled={error?.length > 0}
          >
            {t("MENU_SIGNUP")}
          </button>
        </div>
        <div className="form__socialBtn">
          <FcGoogle
            type="button"
            className="form__socialBtn-google"
            //이벤트 헨들러 함수는 기본적으로 동기함수다.
            //해당 이벤트가 발생하면 즉시 처리된다.
            //따라서 비동기 작업을 수행하는 함수를 이벤트 핸들러로 사용하면
            //에러가 발생한다.
            onClick={() => onClickSocialLogin("google")}
          />

          <FaGithub
            type="button"
            className="form__socialBtn-github"
            onClick={() => onClickSocialLogin("github")}
          />
        </div>
      </form>
    </>
  );
}

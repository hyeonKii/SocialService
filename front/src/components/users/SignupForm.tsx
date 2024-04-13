import {
  createUserWithEmailAndPassword,
  getAuth,
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { app } from "firebaseApp";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function SignupForm() {
  const [error, setError] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [pwConfirm, setPwConfirm] = useState<string>("");
  const navigate = useNavigate();

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    try {
      const auth = getAuth(app);
      await createUserWithEmailAndPassword(auth, email, password);
      navigate("/");
      toast.success("회원가입이 성공적으로 완료되었습니다 :)");
    } catch (error: any) {
      toast.error(error?.code);
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

  const onClickSocialLogin = async (providerType : string) => {
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
        .then(() => toast.success("로그인 되었습니다:)"))
        .catch((error) => {
          const errorMessage = error?.message;
          toast?.error(errorMessage);
        });
    }
  };

  return (
    <>
      <form className="form form--lg" onSubmit={handleSubmit}>
        <div className="form__title">회원가입</div>
        <div className="form__block">
          <label htmlFor="email">이메일</label>
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
          <label htmlFor="password">비밀번호</label>
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
          <label htmlFor="pwConfirm">비밀번호 확인</label>
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
          계정이 있으신가요?
          <Link to="/users/login" className="form__link">
            로그인
          </Link>
        </div>
        <div className="form__block--lg">
          <button
            type="submit"
            className="form__btn-submit"
            disabled={error?.length > 0}
          >
            회원가입
          </button>
        </div>
        <div className="form__block--lg">
          <button
            type="button"
            id="google"
            className="form__btn-google"
            onClick={() => onClickSocialLogin("google")}
          >
            Google로 회원가입
          </button>
        </div>
        <div className="form__block--lg">
          <button
            type="button"
            id="github"
            className="form__btn-github"
            onClick={() => onClickSocialLogin("github")}
          >
            Github으로 회원가입
          </button>
        </div>
      </form>
    </>
  );
}

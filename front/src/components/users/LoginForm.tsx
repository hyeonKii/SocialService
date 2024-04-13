import {
  signInWithEmailAndPassword,
  getAuth,
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { app } from "firebaseApp";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function LoginForm() {
  const [error, setError] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const navigate = useNavigate();

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    try {
      const auth = getAuth(app);
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/");
      toast.success("로그인이 성공적으로 완료되었습니다 :)");
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
        <div className="form__title">로그인</div>
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
        {error && error?.length > 0 && (
          <div className="form__block">
            <div className="form__error">{error}</div>
          </div>
        )}

        <div className="form__block">
          계정이 없으신가요?
          <Link to="/users/signup" className="form__link">
            회원가입
          </Link>
        </div>
        <div className="form__block--lg">
          <button
            type="submit"
            className="form__btn-submit"
            disabled={error?.length > 0}
          >
            로그인
          </button>
        </div>
        <div className="form__block--lg">
          <button
            type="button"
            id="google"
            className="form__btn-google"
            onClick={() => onClickSocialLogin("google")}
          >
            Google로 로그인
          </button>
        </div>
        <div className="form__block--lg">
          <button
            type="button"
            id="github"
            className="form__btn-github"
            onClick={() => onClickSocialLogin("github")}
          >
            Github으로 로그인
          </button>
        </div>
      </form>
    </>
  );
}

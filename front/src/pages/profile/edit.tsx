import PostHeader from "components/posts/PostHeader";
import AuthContext from "context/AuthContext";
import { FirebaseError } from "firebase/app";
import { updateProfile } from "firebase/auth";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadString,
} from "firebase/storage";
import { storage } from "firebaseApp";
import { useTranslation } from "hooks/useTranslation";
import { useContext, useEffect, useState } from "react";
import { FiImage } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { v4 as uuidv4 } from "uuid";

const STORAGE_DOWNLOAD_URL = "https://firebasestorage.googleapis.com";

export default function ProfileEdit() {
  const [displayName, setDisplayName] = useState<string>("");
  const [imageUrl, setImageUrl] = useState<string>("");
  const { user } = useContext(AuthContext);
  const t = useTranslation();
  const navigate = useNavigate();

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {
      target: { value },
    } = e;

    setDisplayName(value);
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    let key = `${user?.uid}/${uuidv4()}`;
    const storageRef = ref(storage, key);
    let newImgURL = null;

    try {
      //기존 스토리지 이미지 삭제
      if (user?.photoURL && user?.photoURL?.includes(STORAGE_DOWNLOAD_URL)) {
        const imageRef = ref(storage, user?.photoURL);
        if (imageRef) {
          await deleteObject(imageRef).catch((error) => {
            toast.error(error);
          });
        }
      }

      //이미지 업로드
      if (imageUrl) {
        const data = await uploadString(storageRef, imageUrl, "data_url");
        newImgURL = await getDownloadURL(data?.ref);
      }

      //updateProfile 호출
      if (user) {
        await updateProfile(user, {
          displayName: displayName || "",
          photoURL: newImgURL || "",
        });
        toast.success("프로필이 업데이트 되었습니다!");
        navigate("/profile");
      }
    } catch (e) {
      if (e instanceof FirebaseError) {
        toast.error(e?.message);
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {
      target: { files },
    } = e;

    const file = files?.[0];
    const fileReader = new FileReader();
    fileReader?.readAsDataURL(file as Blob);

    fileReader.onloadend = (e: ProgressEvent) => {
      if (e.currentTarget instanceof FileReader) {
        const result = e.currentTarget.result as string;
        setImageUrl(result);
      }
    };
  };

  const handleDeleteImg = () => {
    setImageUrl("");
  };

  useEffect(() => {
    if (user?.photoURL) {
      setImageUrl(user?.photoURL);
    }
    if (user?.displayName) {
      setDisplayName(user?.displayName);
    }
  }, [user?.photoURL, user?.displayName]);

  return (
    <div className="post">
      <PostHeader />
      <form className="post-form" onSubmit={onSubmit}>
        <div className="post-form__profile">
          <input
            type="text"
            className="post-form__input"
            placeholder={t("NAME_PLACEHOLDER")}
            onChange={onChange}
            value={displayName}
          />
          {imageUrl && (
            <div className="post-form__attachment">
              <img src={imageUrl} alt="attachment" width={100} height={100} />
              <button
                type="button"
                onClick={handleDeleteImg}
                className="post-form__clear-btn"
              >
                {t("BUTTON_DELETE")}
              </button>
            </div>
          )}

          <div className="post-form__submit-area">
            <div className="post-form__image-area">
              <label className="post-form__file" htmlFor="file-input">
                <FiImage className="post-form__file-icon" />
              </label>
            </div>
            <input
              type="file"
              name="file-input"
              id="file-input"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
            <input
              type="submit"
              value={t("BUTTON_EDIT_PROFILE")}
              className="post-form__submit-btn"
            />
          </div>
        </div>
      </form>
    </div>
  );
}

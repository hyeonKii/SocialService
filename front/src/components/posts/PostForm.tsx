import AuthContext from "context/AuthContext";
import { FirebaseError } from "firebase/app";
import { addDoc, collection } from "firebase/firestore";
import { getDownloadURL, ref, uploadString } from "firebase/storage";
import { db, storage } from "firebaseApp";
import { useTranslation } from "hooks/useTranslation";
import React, { useContext, useState } from "react";
import { FiImage } from "react-icons/fi";
import { toast } from "react-toastify";
import { v4 as uuidv4 } from "uuid";

export default function PostForm() {
  const [content, setContent] = useState<string>("");
  const [hashTag, setHashTag] = useState<string>("");
  const [tags, setTags] = useState<string[]>([]);
  const [imageFile, setImageFile] = useState<string | null>(null);
  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const { user } = useContext(AuthContext);
  const t = useTranslation();

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
        setImageFile(result);
      }
    };
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setIsSubmit(true);
    const key = `${user?.uid}/${uuidv4()}`;
    const storageRef = ref(storage, key);

    try {
      //이미지 업로드
      let imageURL = "";
      if (imageFile) {
        const data = await uploadString(storageRef, imageFile, "data_url");
        imageURL = await getDownloadURL(data?.ref);
      }

      //업로드된 이미지 url 업데이트
      await addDoc(collection(db, "posts"), {
        content: content,
        createdAt: new Date()?.toLocaleDateString("ko", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
        uid: user?.uid,
        email: user?.email,
        hashTags: tags,
        imageURL: imageURL,
      });
      setContent("");
      setTags([]);
      setHashTag("");
      setIsSubmit(false);
      setImageFile(null);
      toast.success("게시글을 생성했습니다.");
    } catch (e) {
      if (e instanceof FirebaseError) {
        toast.error(e?.message);
      }
    }
  };

  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const {
      target: { name, value },
    } = e;

    if (name === "content") {
      setContent(value);
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags?.filter((item) => item !== tag));
  };

  const onChangeHashTag = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHashTag(e?.target?.value?.trim());
  };

  const handleKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === " " && e.currentTarget.value.trim() !== "") {
      // 같은 태그가 존재하면 에러 발생
      // 아닌 경우 태그 생성
      if (tags?.includes(e.currentTarget.value?.trim())) {
        toast.error("같은 태그가 존재합니다.");
      } else {
        setTags((prev) => (prev?.length > 0 ? [...prev, hashTag] : [hashTag]));
        setHashTag("");
      }
    }
  };

  const handleDeleteImg = () => {
    setImageFile(null);
  };

  return (
    <form className="post-form" onSubmit={onSubmit}>
      <textarea
        className="post-form__textarea"
        name="content"
        id="content"
        placeholder={t("POST_PLACEHOLDER")}
        onChange={onChange}
        value={content}
        required
      />

      <div className="post-form__hashtags">
        <span className="post-form__hashtags-outputs">
          {tags?.map((tag, idx) => (
            <span
              className="post-form__hashtags-tag"
              key={idx}
              onClick={() => removeTag(tag)}
            >
              #{tag}
            </span>
          ))}
        </span>
        <input
          className="post-form__input"
          name="hashtag"
          id="hashtag"
          placeholder={t("POST_HASHTAG")}
          onChange={onChangeHashTag}
          onKeyUp={handleKeyUp}
          value={hashTag}
        />
      </div>
      <div className="post-form__submit-area">
        <div className="post-form__image-area">
          <label htmlFor="file-input" className="post-form__file">
            <FiImage className="post-form__file-icon" />
          </label>
          <input
            type="file"
            name="file-input"
            id="file-input"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          {imageFile && (
            <div className="post-form__attachment">
              <img src={imageFile} alt="attachment" width={100} height={100} />
              <button
                className="post-form__clear-btn"
                type="button"
                onClick={handleDeleteImg}
              >
                {t("BUTTON_DELETE")}
              </button>
            </div>
          )}
        </div>
        <input
          type="submit"
          value="Tweet"
          className="post-form__submit-btn"
          disabled={isSubmit}
        />
      </div>
    </form>
  );
}

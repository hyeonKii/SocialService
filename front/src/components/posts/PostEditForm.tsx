import AuthContext from "context/AuthContext";
import { FirebaseError } from "firebase/app";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadString,
} from "firebase/storage";
import { db, storage } from "firebaseApp";
import { PostProps } from "pages/home";
import { useCallback, useContext, useEffect, useState } from "react";
import { FiImage } from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { v4 as uuidv4 } from "uuid";
import PostHeader from "./PostHeader";

export default function PostEditForm() {
  const params = useParams();
  const [post, setPost] = useState<PostProps | null>(null);
  const [content, setContent] = useState<string>("");
  const [hashTag, setHashTag] = useState<string>("");
  const [tags, setTags] = useState<string[]>([]);
  const [imageFile, setImageFile] = useState<string | null>(null);
  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const { user } = useContext(AuthContext);

  const navigate = useNavigate();

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

  const getPost = useCallback(async () => {
    if (params.id) {
      const docRef = doc(db, "posts", params.id);
      const docSnap = await getDoc(docRef);
      setPost({ ...(docSnap?.data() as PostProps), id: docSnap.id });
      setContent(docSnap?.data()?.content);
      setTags(docSnap?.data()?.hashTags);
      setImageFile(docSnap?.data()?.imageUrl);
    }
  }, [params.id]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setIsSubmit(true);
    const key = `${user?.uid}/${uuidv4()}`;
    const storageRef = ref(storage, key);

    try {
      // if 이미지를 변경한 경우 else 변경하지 않은 경우
      if (post) {
        // 업데이트 할 FireStore Document 참조
        const postRef = doc(db, "posts", post?.id);

        // 새로운 이미지 경로 !== 기존 이미지 경로
        if (imageFile !== post?.imageUrl) {
          // 새로운 이미지 먼저 업로드
          let newPhotoUrl = "";
          if (imageFile) {
            const data = await uploadString(storageRef, imageFile, "data_url");
            newPhotoUrl = await getDownloadURL(data?.ref);
          }
          // 기존이미지 경로 제거
          if (post?.imageUrl !== newPhotoUrl) {
            let imageRef = ref(storage, post?.imageUrl);
            await deleteObject(imageRef).catch((error) => {
              toast.error(error);
            });
          }
          await updateDoc(postRef, {
            content: content,
            hashTags: tags,
            imageUrl: newPhotoUrl,
          });
        } else {
          await updateDoc(postRef, {
            content: content,
            hashTags: tags,
          });
        }
        navigate(`/posts/${post?.id}`);
        toast.success("게시글을 수정했습니다.");
      }
      setImageFile(null);
      setIsSubmit(false);
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

  useEffect(() => {
    if (params.id) getPost();
  }, [getPost, params.id]);

  return (
    <>
      <div className="post">
        <PostHeader />
      </div>
      <form className="post-form" onSubmit={onSubmit}>
        <textarea
          className="post-form__textarea"
          name="content"
          id="content"
          placeholder="What is happening?"
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
            placeholder="해시태그 + 스페이스바 입력"
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
                <img
                  src={imageFile}
                  alt="attachment"
                  width={100}
                  height={100}
                />
                <button
                  className="post-form__clear-btn"
                  type="button"
                  onClick={handleDeleteImg}
                >
                  Clear
                </button>
              </div>
            )}
          </div>
          <input
            type="submit"
            value="edit"
            className="post-form__submit-btn"
            disabled={isSubmit}
          />
        </div>
      </form>
    </>
  );
}

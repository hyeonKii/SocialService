import {FirebaseError} from "firebase/app";
import {doc, getDoc, updateDoc} from "firebase/firestore";
import {db} from "firebaseApp";
import {PostProps} from "pages/home";
import {useCallback, useEffect, useState} from "react";
import {FiImage} from "react-icons/fi";
import {useNavigate, useParams} from "react-router-dom";
import {toast} from "react-toastify";

export default function PostEditForm() {
    const params = useParams();
    const [post, setPost] = useState<PostProps | null>(null);
    const [content, setContent] = useState<string>("");
    const [hashTag, setHashTag] = useState<string>("");
    const [tags, setTags] = useState<string[]>([]);
    const navigate = useNavigate();

    const handleFileUpload = () => {};

    const getPost = useCallback(async () => {
        if (params.id) {
            const docRef = doc(db, "posts", params.id);
            const docSnap = await getDoc(docRef);
            setPost({...(docSnap?.data() as PostProps), id: docSnap.id});
            setContent(docSnap?.data()?.content);
            setTags(docSnap?.data()?.hashTags);
        }
    }, [params.id]);

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            if (post) {
                const postRef = doc(db, "posts", post?.id);
                await updateDoc(postRef, {
                    content: content,
                    hashTags: tags
                });
            }
            navigate(`/posts/${post?.id}`);
            toast.success("게시글을 수정했습니다.");
        } catch (e) {
            if (e instanceof FirebaseError) {
                toast.error(e?.message);
            }
        }
    };

    const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const {
            target: {name, value},
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
                setTags((prev) =>
                    prev?.length > 0 ? [...prev, hashTag] : [hashTag]
                );
                setHashTag("");
            }
        }
    };

    useEffect(() => {
        if (params.id) getPost();
    }, [getPost, params.id]);

    return (
        <form className="post-form" onSubmit={onSubmit}>
            <textarea
                className="post-form__textarea"
                name="content"
                id="content"
                placeholder="What is happening?"
                onChange={onChange}
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
                <label htmlFor="file-input" className="post-form__file">
                    <FiImage className="post-form__file-icon" />
                </label>
                <input
                    type="file"
                    name="file-input"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                />
                <input
                    type="submit"
                    value="수정"
                    className="post-form__submit-btn"
                />
            </div>
        </form>
    );
}

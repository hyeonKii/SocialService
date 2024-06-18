import AuthContext from "context/AuthContext";
import { FirebaseError } from "firebase/app";
import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "firebaseApp";
import { useTranslation } from "hooks/useTranslation";
import { PostProps } from "pages/home";
import { useCallback, useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";

interface FollowingProps {
  post: PostProps;
}

export default function FollowingBox({ post }: FollowingProps) {
  const { user } = useContext(AuthContext);
  const [postFollowers, setPostFollowers] = useState<string[]>([]);
  const t = useTranslation();

  const onClickFollow = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();

    try {
      if (user?.uid) {
        const followingRef = doc(db, "following", user?.uid);

        await setDoc(
          followingRef,
          {
            users: arrayUnion({ id: post?.uid }),
          },
          { merge: true }
        );

        const followerRef = doc(db, "follower", post?.uid);
        await setDoc(
          followerRef,
          { users: arrayUnion({ id: user?.uid }) },
          { merge: true }
        );
        toast.success("팔로우를 했습니다 :)");

        //팔로잉 알림 생성
        await addDoc(collection(db, "notifications"), {
          createdAt: new Date()?.toLocaleDateString("ko", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          }),
          content: `${user?.email || user?.displayName}가 팔로우 했습니다.`,
          url: "#",
          isRead: false,
          uid: post?.uid,
        });
      }
    } catch (e) {
      if (e instanceof FirebaseError) {
        toast.error(e?.message);
      }
    }
  };

  const onClickDeleteFollow = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();

    try {
      if (user?.uid) {
        const followingRef = doc(db, "following", user?.uid);

        await updateDoc(followingRef, {
          users: arrayRemove({ id: post?.uid }),
        });

        const followerRef = doc(db, "follower", post?.uid);
        await updateDoc(followerRef, {
          users: arrayRemove({ id: user.uid }),
        });
      }
      toast.success("팔로우를 취소했습니다.");
    } catch (e) {
      if (e instanceof FirebaseError) {
        toast.error(e?.message);
      }
    }
  };

  const getFollowers = useCallback(async () => {
    if (post.uid) {
      const ref = doc(db, "follower", post.uid);
      onSnapshot(ref, (doc) => {
        setPostFollowers([]);
        doc
          ?.data()
          ?.users?.map((user: { id: string }) =>
            setPostFollowers((prev) => (prev ? [...prev, user?.id] : []))
          );
      });
    }
  }, [post.uid]);

  useEffect(() => {
    if (post.uid) getFollowers();
  }, [getFollowers, post.uid]);

  return (
    <>
      {user?.uid !== post?.uid &&
        (postFollowers?.includes(user?.uid as string) ? (
          <button
            type="button"
            className="post__following-btn"
            onClick={(e) => onClickDeleteFollow(e)}
          >
            {t("BUTTON_FOLLOWING")}
          </button>
        ) : (
          <button
            type="button"
            className="post__follow-btn"
            onClick={(e) => onClickFollow(e)}
          >
            {t("BUTTON_FOLLOW")}
          </button>
        ))}
    </>
  );
}

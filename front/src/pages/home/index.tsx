import { CommentProps } from "components/comments/CommentBox";
import PostBox from "components/posts/PostBox";
import PostForm from "components/posts/PostForm";
import AuthContext from "context/AuthContext";
import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { db } from "firebaseApp";
import { useTranslation } from "hooks/useTranslation";
import { useCallback, useContext, useEffect, useState } from "react";

export interface PostProps {
  id: string;
  email: string;
  content: string;
  createdAt: string;
  uid: string;
  profileUrl?: string;
  likes?: string[];
  likeCount?: number;
  comments?: CommentProps[];
  hashTags: string[];
  imageURL?: string;
}

type TabType = "all" | "following";

export default function HomePage() {
  const [posts, setPosts] = useState<PostProps[]>([]);
  const [followingPosts, setFollowingPosts] = useState<PostProps[]>([]);
  const [followingIds, setFollowingIds] = useState<string[]>([""]);
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const { user } = useContext(AuthContext);
  const t = useTranslation();

  const getFollowingIds = useCallback(async () => {
    if (user?.uid) {
      const ref = doc(db, "following", user?.uid);
      onSnapshot(ref, (doc) => {
        setFollowingIds([""]);
        doc
          ?.data()
          ?.users?.map((user: { id: string }) =>
            setFollowingIds((prev) => (prev ? [...prev, user?.id] : []))
          );
      });
    }
  }, [user?.uid]);

  useEffect(() => {
    if (user) {
      // eslint-disable-next-line prefer-const
      let postsRef = collection(db, "posts");
      // eslint-disable-next-line prefer-const
      let postsQuery = query(postsRef, orderBy("createdAt", "desc"));

      let followingQuery = query(
        postsRef,
        where("uid", "in", followingIds),
        orderBy("createdAt", "desc")
      );

      onSnapshot(postsQuery, (snapShot) => {
        // eslint-disable-next-line prefer-const
        let dataObj = snapShot.docs.map((doc) => ({
          ...doc.data(),
          id: doc?.id,
        }));
        setPosts(dataObj as PostProps[]);
      });

      onSnapshot(followingQuery, (snapShot) => {
        // eslint-disable-next-line prefer-const
        let dataObj = snapShot.docs.map((doc) => ({
          ...doc.data(),
          id: doc?.id,
        }));
        setFollowingPosts(dataObj as PostProps[]);
      });
    }
  }, [followingIds, user]);

  useEffect(() => {
    if (user?.uid) getFollowingIds();
  }, [getFollowingIds, user?.uid]);

  return (
    <div className="home">
      <div className="home__top">
        <div className="home__title">{t("MENU_HOME")}</div>
        <div className="home__tabs">
          <div
            className={`home__tab ${
              activeTab === "all" && "home__tab--active"
            }`}
            onClick={() => setActiveTab("all")}
          >
            {t("TAB_ALL")}
          </div>
          <div
            className={`home__tab ${
              activeTab === "following" && "home__tab--active"
            }`}
            onClick={() => setActiveTab("following")}
          >
            {t("TAB_FOLLOWING")}
          </div>
        </div>
      </div>

      <PostForm />
      {activeTab === "all" && (
        <div className="post">
          {posts?.length > 0 ? (
            posts?.map((post) => <PostBox post={post} key={post.id} />)
          ) : (
            <div className="post__no-posts">
              <div className="post__text">{t("NO_POSTS")}</div>
            </div>
          )}
        </div>
      )}
      {activeTab === "following" && (
        <div className="post">
          {followingPosts?.length > 0 ? (
            followingPosts?.map((post) => <PostBox post={post} key={post.id} />)
          ) : (
            <div className="post__no-posts">
              <div className="post__text">{t("NO_POSTS")}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

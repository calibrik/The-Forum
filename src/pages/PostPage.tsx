import { useEffect, useRef, useState, type FC } from "react";
import styles from "../scss/postPage.module.scss"
import buttonStyles from "../scss/baseButton.module.scss";
import { Deleted, SendIcon, ThreeDots } from "../components/Icons";
import { Reactions } from "../components/Reactions";
import { InputField } from "../components/InputField";
import { BaseButton } from "../components/BaseButton";
import { Comment } from "../components/Comment";
import { BackButton } from "../components/BackButton";
import { bridge, getImageUrl } from "../misc/utils";
import { useNavigate, useParams } from "react-router";
import { Spinner } from "../components/Spinner";
import { useStory, useStoryInit } from "../providers/StoryProvider";
import { db, type IPost, type ISubforum } from "../misc/db";
import { useUserState } from "../providers/UserAuth";
import { TypingTextBox, useTypingBoxes } from "../components/TypingTextBox";
import { useLocale } from "../providers/Locale";

const FAKE_POST_BASE: Omit<IPost, "title" | "content"> = {
    id: "fake",
    author: "fake_op",
    subforum: "zero",
    likes: 0,
    comments: 0,
    views: 3,
    commentsDetailed: [],
    dateCreated: new Date()
};

interface IPostPageProps { };
interface IComment {
    comment?: string
}

export const PostPage: FC<IPostPageProps> = (_) => {
    let navigate = useNavigate();
    const {id}=useParams<{id:string}>();
    const isDeleted = id === "deleted";
    const isFake = id === "fake";
    const storyInit = useStoryInit();
    const [post,setPost]=useState<IPost|undefined>(undefined);
    const [subforumPfp,setSubforumPfp]=useState<string|undefined>(undefined);
    const userState=useUserState();
    const { setTypingBox, getTypingBoxes } = useTypingBoxes();
    const story = useStory();
    const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
    const [subforum, setSubforum] = useState<ISubforum | undefined>(undefined);
    const menuWrapperRef = useRef<HTMLDivElement>(null);
    const { t } = useLocale();
    const fakePost: IPost = { ...FAKE_POST_BASE, title: t("postPage.fake.title"), content: t("postPage.fake.content") };

    function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData.entries()) as IComment;
        console.log("Submitted: ", data);
        e.currentTarget.reset();
    }

    async function init(){
        if (!userState.isRealLoggedIn.current) {
            navigate("/")
            return;
        }
        if (isDeleted)
            return;
        const post = isFake
            ? fakePost
            : await db.postsBuffer.where("id").equals(id??"").first() ?? await db.posts.where("id").equals(id??"").first();
        if (!post) {
            navigate("/404",{replace:true})
            return;
        }
        setPost(post);
        const sub = await db.subforumsBuffer.where("name").equals(post.subforum).first()??await db.subforums.where("name").equals(post.subforum).first();
        setSubforum(sub);
        setSubforumPfp(sub?.imageName);
    }

    useEffect(() => {
        bridge.exec(storyInit,2, getTypingBoxes(),init);
    }, [])

    function onMenuToggle() {
        setIsMenuOpen(prev => !prev);
    }

    function onDelete() {
        setIsMenuOpen(false);
        story.resumeStoryFromHint("delete-post-button-text");
    }

    useEffect(() => {
        if (isDeleted)
            return;
        if (isMenuOpen)
            story.goForwardHint("post-menu-dots-text");
        else
            story.goBackwardHint("delete-post-button-text")
    }, [isMenuOpen, isDeleted])

    useEffect(() => {
        if (!isMenuOpen)
            return;
        function onClickOutside(e: MouseEvent) {
            if (menuWrapperRef.current && !menuWrapperRef.current.contains(e.target as Node))
                setIsMenuOpen(false);
        }
        document.addEventListener("mousedown", onClickOutside);
        return () => {
            document.removeEventListener("mousedown", onClickOutside);
        };
    }, [isMenuOpen])

    const canDelete = isFake||post?.author == userState.userLoggedIn.current
        || subforum?.admin == userState.userLoggedIn.current || subforum?.mods?.includes(userState.userLoggedIn.current);
    const canNavigate = !isFake && !isDeleted;

    return (
        <>
        <TypingTextBox ref={setTypingBox("nar1")} type={"terminal"}/>
        <div className={styles.container}>
            <div className={`${styles.postContainer} ${isDeleted?styles.deleted:""}`}>
                <div className={styles.returnContainer}>
                    <BackButton id="back-text" isActive={canNavigate} />
                    {!isDeleted ? (
                        <>
                            <img onClick={canNavigate ? () => navigate(`/subforum/${post?.subforum}`) : undefined} src={getImageUrl(subforumPfp??"placeholder.png")} alt="" className={styles.subforumPfp} />
                            <div className={styles.authorContainer}>
                                <span onClick={canNavigate ? () => navigate(`/subforum/${post?.subforum}`) : undefined} className={styles.subforumName}>f/{post?.subforum}</span>
                                <span onClick={canNavigate ? () => navigate(`/user/${post?.author}`) : undefined} className={styles.username}>u/{post?.author}</span>
                            </div>
                        </>
                    ) : ""}
                    {!isDeleted && canDelete ?
                        <div ref={menuWrapperRef} className={styles.menuWrapper}>
                            <ThreeDots id="post-menu-dots-text" interactive onClick={onMenuToggle} className={styles.menuDots} />
                            {isMenuOpen ?
                                <div className={styles.dropdownMenu}>
                                    <div id="delete-post-button-text" className={styles.deleteOption} onClick={onDelete}>{t("common.delete")}</div>
                                </div>
                                : ""}
                        </div>
                        : ""}
                </div>
                {isDeleted ? (
                    <div className={styles.deletedContainer}>
                        <Deleted className={styles.deletedIcon} />
                        <h1 className={styles.deletedTitle}>{t("postPage.deletedTitle")}</h1>
                        <p className={styles.deletedMessage}>{t("postPage.deletedMessage")}</p>
                    </div>
                ) : (
                    <>
                        <h1 className={styles.postTitle}>{post?.title}</h1>
                        <p className={styles.content}>{post?.content}</p>
                        {post&&post.imageName?<img src={getImageUrl(post.imageName)} alt="" className={styles.picture} />:""}
                        <Reactions likes={post?.likes??0} comments={post?.comments??0} views={post?.views??0} />
                    </>
                )}
            </div>
            {!isDeleted ? (
                <>
                    <div className={styles.commentsListContainer}>
                        {post?.comments == 0 ? <span className={styles.noComments}>{t("postPage.noComments")}</span> :
                            post?.commentsDetailed?.map((v,i)=>(
                                <Comment {...v} key={i}/>
                            ))
                        }
                        {(post?.comments??0)>(post?.commentsDetailed?.length??0)?<Spinner />:""}
                    </div>
                    <form className={styles.inputContainer} onSubmit={onSubmit}>
                        <InputField name="comment" className={styles.input} placeholder={t("common.addComment")} type="text" />
                        <BaseButton type="submit" className={`${buttonStyles.primaryButton} ${styles.sendButton}`} icon={<SendIcon />} />
                    </form>
                </>
            ) : ""}
        </div>
        </>
    );
}

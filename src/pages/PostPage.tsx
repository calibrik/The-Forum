import { useEffect, useRef, useState, type FC } from "react";
import styles from "../scss/postPage.module.scss"
import buttonStyles from "../scss/baseButton.module.scss";
import { SendIcon, ThreeDots } from "../components/Icons";
import { Reactions } from "../components/Reactions";
import { InputField } from "../components/InputField";
import { BaseButton } from "../components/BaseButton";
import { Comment } from "../components/Comment";
import { BackButton } from "../components/BackButton";
import { bridge, getImageUrl, sanitizeDbFetch } from "../utils";
import { useNavigate, useParams } from "react-router";
import { Spinner } from "../components/Spinner";
import { useStory, useStoryInit } from "../providers/StoryProvider";
import { db, type IPost, type ISubforum } from "../backend/db";
import { useUserState } from "../providers/UserAuth";
import { TypingTextBox, type ITypingTextBoxHandle } from "../components/TypingTextBox";
interface IPostPageProps { };
interface IComment {
    comment?: string
}

export const PostPage: FC<IPostPageProps> = (_) => {
    let navigate = useNavigate();
    const {id}=useParams<{id:string}>();
    const storyInit = useStoryInit();
    const [post,setPost]=useState<IPost|undefined>(undefined);
    const [subforumPfp,setSubforumPfp]=useState<string|undefined>(undefined);
    const userState=useUserState();
    const typingBox=useRef<ITypingTextBoxHandle>(null)
    const story = useStory();
    const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
    const [subforum, setSubforum] = useState<ISubforum | undefined>(undefined);
    const menuWrapperRef = useRef<HTMLDivElement>(null);

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
        const post = await sanitizeDbFetch(await db.posts.where("id").equals(id??"").first());
        if (!post) {
            navigate("/404",{replace:true})
            return;
        }
        setPost(post);
        const sub = await sanitizeDbFetch(await db.subforums.where("id").equals(post.subforum).first());
        setSubforum(sub);
        setSubforumPfp(sub?.imageName);
    }

    useEffect(() => {
        bridge.exec(storyInit,2, [typingBox],init);
    }, [])

    function onMenuToggle() {
        setIsMenuOpen(prev => !prev);
    }

    function onDelete() {
        setIsMenuOpen(false);
        story.resumeStoryFromHint("delete-post-button-text");
    }

    useEffect(() => {
        if (isMenuOpen)
            story.goForwardHint("post-menu-dots-text");
        else
            story.goBackwardHint("delete-post-button-text")
    }, [isMenuOpen])

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

    const canDelete = post?.author == userState.userLoggedIn.current
        || !!subforum && (subforum.admin == userState.userLoggedIn.current || subforum.mods?.includes(userState.userLoggedIn.current));

    return (
        <>
        <TypingTextBox ref={typingBox} type={"terminal"}/>
        <div className={styles.container}>
            <div className={styles.postContainer}>
                <div className={styles.returnContainer}>
                    <BackButton id="back-text" />
                    <img onClick={() => navigate(`/subforum/${post?.subforum}`)} src={getImageUrl(subforumPfp??"placeholder.png")} alt="" className={styles.subforumPfp} />
                    <div className={styles.authorContainer}>
                        <span onClick={() => navigate(`/subforum/${post?.subforum}`)} className={styles.subforumName}>f/{post?.subforum}</span>
                        <span onClick={() => navigate(`/user/${post?.author}`)} className={styles.username}>u/{post?.author}</span>
                    </div>
                    {canDelete ?
                        <div ref={menuWrapperRef} className={styles.menuWrapper}>
                            <ThreeDots id="post-menu-dots-text" interactive onClick={onMenuToggle} className={styles.menuDots} />
                            {isMenuOpen ?
                                <div className={styles.dropdownMenu}>
                                    <div id="delete-post-button-text" className={styles.deleteOption} onClick={onDelete}>Delete</div>
                                </div>
                                : ""}
                        </div>
                        : ""}
                </div>
                <h1 className={styles.postTitle}>{post?.title}</h1>
                <p className={styles.content}>{post?.content}</p>
                <img src={getImageUrl(post?.imageName??"placeholder.png")} alt="" className={styles.picture} />
                <Reactions likes={post?.likes??0} comments={post?.comments??0} views={post?.views??0} />
            </div>
            <div className={styles.commentsListContainer}>
                {post?.comments == 0 ? <span className={styles.noComments}>No comments yet.</span> :
                    post?.commentsDetailed?.map((v,i)=>(
                        <Comment {...v} key={i}/>
                    ))
                }
                <Spinner />
            </div>
            <form className={styles.inputContainer} onSubmit={onSubmit}>
                <InputField name="comment" className={styles.input} placeholder="Add comment" type="text" />
                <BaseButton type="submit" className={`${buttonStyles.primaryButton} ${styles.sendButton}`} icon={<SendIcon />} />
            </form>
        </div>
        </>
    );
}

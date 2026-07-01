import { useEffect, useRef, useState, type FC } from "react";
import { getImageUrl, numberToText } from "../utils";
import { Outlet, useNavigate, useParams } from "react-router";
import styles from "../scss/sub-userPage.module.scss";
import baseButtonStyles from "../scss/baseButton.module.scss";
import { BaseButton } from "../components/BaseButton";
import { Plus } from "../components/Icons";
import { Menu, type IMenuOption } from "../components/Menu";
import { useStoryInit } from "../providers/StoryProvider";
import { useUserState } from "../providers/UserAuth";
import { db, type ISubforum } from "../backend/db";
import { Spinner } from "../components/Spinner";
import { TypingTextBox, type ITypingTextBoxHandle } from "../components/TypingTextBox";
interface ISubforumProps { };

export const Subforum: FC<ISubforumProps> = (_) => {
    const storyInit = useStoryInit();
    const userState = useUserState();
    const navigate = useNavigate();
    const { name } = useParams<{ name: string }>();
    const [subforum, setSubforum] = useState<ISubforum | undefined>(undefined)
    const typingBox=useRef<ITypingTextBoxHandle>(null);

    async function init() {
        if (!userState.isRealLoggedIn.current) {
            navigate("/")
            return;
        }
        const subforum = await db.subforums.where("name").equals(name ?? "").first();
        if (!subforum) {
            console.error(`No ${name} subforum found.`)
            navigate("/404",{replace:true})
            return;
        }
        setSubforum(subforum);
    }

    useEffect(() => {
        storyInit(2, [typingBox], init);
    }, [name])

    let menuOptions: IMenuOption[] = [
        {
            name: "Posts",
            destination: "",
            id: "posts"

        },
        {
            name: "Members",
            destination: "members",
            id: "members"
        },
    ]

    if (subforum && subforum.admin == userState.userLoggedIn.current) {
        menuOptions.push({
            name: "Settings",
            destination: "settings",
            id: "settings"
        });
    }

    return (
    <>
    <TypingTextBox ref={typingBox} type="terminal"/>    
        <div className={styles.container}>
            <img src={getImageUrl(subforum?.imageName ?? "placeholder.png")} className={styles.pfpBg} />
            <div className={styles.subProfileContainer}>
                {subforum ?
                    <div className={styles.headerContainer}>
                        <div className={styles.titleHeaderContainer}>
                            <h1 className={styles.title}>f/{subforum.name}</h1>
                            <span className={styles.followerCount}>{numberToText(subforum.followers)} followers</span>
                        </div>
                        <p className={styles.description}>{subforum.description}</p>
                    </div>
                    : <Spinner />}
                <Menu options={menuOptions} />
                <div className={styles.createPostContainer}>
                    <BaseButton icon={<Plus />} iconPos="start" className={`${styles.createPost} ${baseButtonStyles.primaryButton}`}>Create Post</BaseButton>
                </div>
            </div>
            <div className={styles.contentContainer}>
                <Outlet context={subforum}/>
            </div>
        </div>
        </>
    );
}

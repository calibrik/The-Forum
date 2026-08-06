import { useEffect, useRef, useState, type FC } from "react";
import { addHashToUserNickname, bridge, getImageUrl, numberToText, sanitizeDbFetch } from "../utils";
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
    const typingBox1 = useRef<ITypingTextBoxHandle>(null);
    const typingBox2 = useRef<ITypingTextBoxHandle>(null);

    async function init() {
        if (!userState.isRealLoggedIn.current) {
            navigate("/")
            return;
        }
        const subforum = await sanitizeDbFetch(await db.subforums.where("name").equals(await addHashToUserNickname(name??"")).first());
        if (!subforum) {
            console.error(`No ${name} subforum found.`)
            navigate("/404", { replace: true })
            return;
        }
        setSubforum(subforum);
    }

    useEffect(() => {
        bridge.exec(storyInit,2, [typingBox1], init);
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
            <TypingTextBox ref={typingBox1} type="terminal" />
            <TypingTextBox ref={typingBox2} type="terminal" />
            <div id="subforumContainer" className={styles.container}>
                <img data-fall="true" src={getImageUrl(subforum?.imageName ?? "placeholder.png")} className={styles.pfpBg} />
                <div data-fall="true" className={styles.subProfileContainer}>
                    {subforum ?
                        <div data-fall="true" className={styles.headerContainer}>
                            <div className={styles.titleHeaderContainer}>
                                <h1 className={styles.title}>f/{subforum.name}</h1>
                                <span className={styles.followerCount}>{numberToText(subforum.followers)} followers</span>
                            </div>
                            <p className={styles.description}>{subforum.description}</p>
                        </div>
                        : <Spinner />}
                    <div data-fall="true">
                        <Menu options={menuOptions} />
                    </div>
                    <div data-fall="true" className={styles.createPostContainer}>
                        <BaseButton icon={<Plus />} iconPos="start" className={`${styles.createPost} ${baseButtonStyles.primaryButton}`}>Create Post</BaseButton>
                    </div>
                </div>
                <div data-fall="true" className={styles.contentContainer}>
                    <Outlet context={[subforum, [typingBox1, typingBox2]]} />
                </div>
            </div>
        </>
    );
}
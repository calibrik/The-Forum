import { useEffect, useState, type FC } from "react";
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
interface ISubforumProps { };

export const Subforum: FC<ISubforumProps> = (_) => {
    const storyInit = useStoryInit();
    const userState = useUserState();
    const navigate = useNavigate();
    const { name } = useParams<{ name: string }>();
    const [subforum, setSubforum] = useState<ISubforum | undefined>(undefined)

    async function init() {
        if (!userState.isRealLoggedIn.current) {
            navigate("/")
            return;
        }
        const subforums = await db.subforums.where("name").equals(name ?? "").toArray();
        if (subforums.length != 1) {
            console.error(`No ${name} subforum found (or found too many) ${subforums.length}.`)
            navigate("/404")
            return;
        }
        setSubforum(subforums[0]);
    }

    useEffect(() => {
        storyInit(2, [], init);
    }, [])

    let menuOptions: IMenuOption[] = [
        {
            name: "Posts",
            destination: ""
        },
        {
            name: "Members",
            destination: "members"
        },
    ]
    
    if (subforum && subforum.admin == userState.userLoggedIn.current) {
        menuOptions.push({
            name: "Settings",
            destination: "settings"
        });
    }

    return (
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
                <Outlet />
            </div>
        </div>
    );
}

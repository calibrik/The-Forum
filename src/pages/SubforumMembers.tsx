import { useEffect, type FC } from "react";
import styles from "../scss/subforumMembersPage.module.scss";
import { SMEntry } from "../components/SMEntry";
import { Spinner } from "../components/Spinner";
import { useStoryInit } from "../providers/StoryProvider";
import { useOutletContext, useParams } from "react-router";
import type { ISubforum } from "../backend/db";
import { bridge } from "../utils";
import { TypingTextBox, useTypingBoxes } from "../components/TypingTextBox";
interface ISubforumMembersProps { };

export const SubforumMembers: FC<ISubforumMembersProps> = (_) => {
    const storyInit = useStoryInit();
    const [subforum] = useOutletContext<[ISubforum | undefined, unknown]>();
    const { name } = useParams<{ name: string }>();
    const typingBoxes = useTypingBoxes();

    useEffect(() => {
        bridge.exec(storyInit, 3, typingBoxes.getTypingBoxes());
    }, [name])

    return (
        <>
            <TypingTextBox ref={typingBoxes.setTypingBox("nar1")} type={"terminal"} />
            <div className={styles.container}>
                {subforum ?
                    <>
                        <div className={styles.section}>
                            <h1 className={styles.title}>Admin</h1>
                            <div className={styles.userList}>
                                <SMEntry isNav name={subforum.admin} type={"user"} />
                            </div>
                        </div>
                        <div className={styles.section}>
                            <h1 className={styles.title}>Mods</h1>
                            <div className={styles.userList}>
                                {subforum.mods.map((v) => (
                                    <SMEntry isNav key={v} name={v} type={"user"} />
                                ))}
                            </div>
                        </div>
                        <div className={styles.section}>
                            <h1 className={styles.title}>Members</h1>
                            <div className={styles.userList}>
                                {subforum.members.map((v) => (
                                    <SMEntry isNav key={v} name={v} type={"user"} />
                                ))}
                            </div>
                            <Spinner />
                        </div>
                    </>
                    : <Spinner />}
            </div>
        </>
    );
}

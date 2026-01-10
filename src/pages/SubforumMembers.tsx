import type { FC } from "react";
import styles from "../scss/subforumMembers.module.scss";
import { getImageUrl } from "../utils";
interface ISubforumMembersProps {};

export const SubforumMembers: FC<ISubforumMembersProps> = (props) => {
    return (
        <div className={styles.container}>
            <div className={styles.section}>
                <h1 className={styles.title}>Admin</h1>
                <div className={styles.userContainer}>
                    <img src={getImageUrl("placeholder")} className={styles.pfp} />
                    <span className={styles.username}>u/user</span>
                </div>
            </div>
        </div>
    );
}

import type { FC } from "react";
import styles from "../scss/subforumMembers.module.scss";
import { SMEntry } from "../components/SMEntry";
interface ISubforumMembersProps {};

export const SubforumMembers: FC<ISubforumMembersProps> = (_) => {
    return (
        <div className={styles.container}>
            <div className={styles.section}>
                <h1 className={styles.title}>Admin</h1>
                <SMEntry name={"user"} type={"user"} />
            </div>
            <div className={styles.section}>
                <h1 className={styles.title}>Mods</h1>
                <SMEntry name={"user"} type={"user"} />
                <SMEntry name={"user"} type={"user"} />
                <SMEntry name={"user"} type={"user"} />
            </div>
            <div className={styles.section}>
                <h1 className={styles.title}>Members</h1>
                <SMEntry name={"user"} type={"user"} />
                <SMEntry name={"user"} type={"user"} />
                <SMEntry name={"user"} type={"user"} />
                <SMEntry name={"user"} type={"user"} />
                <SMEntry name={"user"} type={"user"} />
                <SMEntry name={"user"} type={"user"} />
                <SMEntry name={"user"} type={"user"} />
                <SMEntry name={"user"} type={"user"} />
            </div>
        </div>
    );
}

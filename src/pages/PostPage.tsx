import { type FC } from "react";
import styles from "../scss/postPage.module.scss"
import buttonStyles from "../scss/baseButton.module.scss";
import { SendIcon } from "../components/Icons";
import { Reactions } from "../components/Reactions";
import { InputField } from "../components/InputField";
import { BaseButton } from "../components/BaseButton";
import { SMEntry } from "../components/SMEntry";
import { Comment } from "../components/Comment";
import { BackButton } from "../components/BackButton";
import { getImageUrl } from "../utils";
interface IPostPageProps { };
interface IComment {
    comment?: string
}

export const PostPage: FC<IPostPageProps> = (_) => {
    const commentsAmount: number = 10;

    function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData.entries()) as IComment;
        console.log("Submitted: ", data);
        e.currentTarget.reset();
    }

    return (
        <div className={styles.container}>
            <div className={styles.postContainer}>
                <div className={styles.returnContainer}>
                    <BackButton/>
                    <SMEntry name="subforum" type="subforum" />
                </div>
                <h1 className={styles.postTitle}>Title</h1>
                <p className={styles.content}>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin sodales quam ut pretium dignissim. Nam malesuada non diam a aliquet. Quisque ultrices porta diam egestas faucibus. Vivamus ac dapibus sem, eu pulvinar nunc. Maecenas a diam risus. Morbi molestie ac velit quis tristique. Aenean vel augue maximus, laoreet tortor nec, vulputate nulla. In sodales erat sed condimentum finibus.</p>
                <img src={getImageUrl("placeholder")} alt="" className={styles.picture} />
                <Reactions />
            </div>
            <div className={styles.commentsListContainer}>
                {commentsAmount == 0 ? <span className={styles.noComments}>No comments yet.</span> :
                    Array.from({ length: commentsAmount }).map((_, i) => (
                        <Comment key={i} />
                    ))
                }
            </div>
            <form className={styles.inputContainer} onSubmit={onSubmit}>
                <InputField name="comment" className={styles.input} placeholder="Add comment" type="text" />
                <BaseButton type="submit" className={`${buttonStyles.primaryButton} ${styles.sendButton}`} icon={<SendIcon />} />
            </form>
        </div>
    );
}

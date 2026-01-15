import { type FC } from "react";
import styles from "../scss/post.module.scss";
import { getImageUrl } from "../utils";
import { SMEntry } from "./SMEntry";
import { Reactions } from "./Reactions";
import { useNavigate } from "react-router";
interface IPostProps {
    img?: string
    postId?: string;
};

export const Post: FC<IPostProps> = (props) => {
    let navigate=useNavigate();

    return (
        <div onClick={()=>navigate("/post")} data-istransition="true" className={styles.cardContainer}>
            <SMEntry destination="/" name={"user"} type={"user"} />
            <h1 className={styles.title}>Title</h1>
            <p className={props.img ? styles.contentWithImg : styles.content}>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin sodales quam ut pretium dignissim. Nam malesuada non diam a aliquet. Quisque ultrices porta diam egestas faucibus. Vivamus ac dapibus sem, eu pulvinar nunc. Maecenas a diam risus. Morbi molestie ac velit quis tristique. Aenean vel augue maximus, laoreet tortor nec, vulputate nulla. In sodales erat sed condimentum finibus.</p>
            {props.img ?
                <div className={styles.postImgWrapper}>
                    <img className={styles.postImg} src={getImageUrl(props.img)} />
                </div>
                : ""}
            <Reactions />
        </div>
    );
}

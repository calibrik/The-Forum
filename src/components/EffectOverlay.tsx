import type { FC } from "react";
import styles from "../scss/effectOverlay.module.scss";
interface IEffectOverlayProps {
    id?:string
};

export const EffectOverlay: FC<IEffectOverlayProps> = (props) => {
    return (
        <div id={props.id} className={styles.overlay}>
            
        </div>
    );
}

import { forwardRef, useImperativeHandle, useRef } from "react";
import styles from "../scss/hintHolder.module.scss";
interface IHintHolderProps {
    id?: string;
};
export interface IHintHolderHandle {
    getHintClass: () => string|undefined;
}

export const HintHolder = forwardRef<IHintHolderHandle, IHintHolderProps>((props, ref) => {
    const div = useRef<HTMLDivElement>(null);
    useImperativeHandle(ref, () => ({
        getHintClass() {
            return div.current?.className;
        }
    }));
    return (
        <div className={styles.hintHolder}>
            <div ref={div} id={props.id}></div>
        </div>
    );
});

export function useHintHolders() {
    const hintHolders = useRef<Map<string, IHintHolderHandle>>(new Map());

    function setHintHolder(id: string) {
        return (ref: IHintHolderHandle) => {
            if (ref) {
                hintHolders.current.set(id, ref);
            }
            else {
                hintHolders.current.delete(id);
            }
        }
    }
    return { hintHolders, setHintHolder };
}
import type { FC } from "react";
import { Notepad as NotepadIcon } from "../components/Icons";
import styles from "../scss/systemApp.module.scss";

interface INotepadProps { }

export const Notepad: FC<INotepadProps> = () => {
    return (
        <div className={styles.container}>
            <div className={styles.appContainer}>
                <div className={styles.headerDiv}>
                    <NotepadIcon className={styles.icon} />
                    <span className={styles.appLabel}>Notepad</span>
                </div>
                <div className={styles.actionsDiv}>
                    <span className={styles.action}>File</span>
                    <span className={styles.action}>Edit</span>
                    <span className={styles.action}>View</span>
                </div>
                <div className={styles.contentDiv}>
                    <p className={styles.contentNotepad}>
                        {`Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque fermentum suscipit orci quis rutrum. Vestibulum eget tellus et dolor ultrices auctor ac a mi. Proin pretium est mauris, non hendrerit velit dapibus quis. Curabitur sed suscipit lacus, ut volutpat turpis. Duis non varius nulla. Ut tellus quam, volutpat a lorem eget, ullamcorper placerat eros. Aliquam laoreet, lectus in volutpat vulputate, eros odio ornare neque, id faucibus lacus leo eu quam. Nunc at justo ornare, condimentum libero quis, semper neque. Donec ut diam sem. Sed eu convallis mauris. Nam auctor turpis dolor, ut efficitur sapien euismod nec. Duis quis rutrum justo. Aenean et finibus massa, sit amet vulputate nisi. Nullam venenatis aliquet risus sit amet suscipit. Nam tempus risus erat, ac placerat augue vehicula quis. Proin porta, tellus non scelerisque tempus, libero lorem venenatis metus, vitae elementum odio urna sed odio.

Duis nec pellentesque metus, nec vehicula quam. Nulla at posuere nunc. Maecenas rutrum tortor id urna egestas, vel porttitor neque commodo. Maecenas malesuada, nisl eget bibendum ultrices, nulla tortor condimentum tellus, quis luctus magna sem et lacus. Sed rutrum, enim vel imperdiet finibus, enim libero iaculis mauris, non sagittis purus metus vitae ipsum. Nunc a leo libero. Phasellus pretium dui non risus eleifend commodo. Donec finibus leo sapien, quis faucibus metus egestas quis. Cras eleifend ultricies laoreet. In facilisis urna sit amet egestas convallis. Praesent pretium erat luctus lacus eleifend tempor. 

Etiam non hendrerit erat. Duis semper eleifend erat, sit amet tempor sapien tincidunt malesuada. Sed et ipsum efficitur ante malesuada dapibus eget ut ante. Aenean efficitur elit nisi, eu facilisis enim commodo in. Sed ac facilisis arcu. Aliquam id congue dolor. Morbi convallis, tellus non tristique semper, urna ante rutrum lectus, id cursus ex tortor tempor nunc. Nulla vestibulum turpis nisl, nec euismod mi dictum ac. Vestibulum urna ante, tempus ut blandit vel, facilisis condimentum ante.`}
                    </p>
                </div>
            </div>
        </div>
    );
}

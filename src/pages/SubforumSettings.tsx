import { useEffect, useState, type FC, type ReactNode } from "react";
import styles from "../scss/subforumSettings.module.scss";
import buttonStyles from "../scss/baseButton.module.scss";
import { InputField } from "../components/InputField";
import { SMEntry } from "../components/SMEntry";
import { ArrowRightSquare, ChevronDoubleDown, ChevronDoubleUp, X } from "../components/Icons";
import { BaseButton } from "../components/BaseButton";
interface ISubforumSettingsProps { };
interface ISubforumSettingsSectionProps {
    title: string;
    buttonText:string;
    buttonIcon:ReactNode;
};

const SubforumSettingsSection: FC<ISubforumSettingsSectionProps> = (props) => {
    const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set<string>());

    function removeUser(name: string) {
        let n = new Set(selectedUsers);
        n.delete(name);
        setSelectedUsers(n);
    }
    function addUser(name: string) {
        let n = new Set(selectedUsers);
        n.add(name);
        setSelectedUsers(n);
    }

    function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        console.log(selectedUsers);
        setSelectedUsers(new Set<string>());
    }

    return (
        <form className={styles.section} onSubmit={onSubmit}>
            <h1 className={styles.title}>{props.title}</h1>
            <div className={styles.inputDiv}>
                <InputField onSuggestionClick={addUser} isSearch placeholder={`Search`} type={"text"} className={styles.input} />
            </div>
            {Array.from(selectedUsers).map((value, i) => (
                <SMEntry type="user" onClick={removeUser} isSelected key={i} name={value} />
            ))}
            <div>
                <BaseButton iconPos="start" icon={props.buttonIcon} className={`${buttonStyles.primaryButton} ${styles.submitButton}`} type="submit">{props.buttonText}</BaseButton>
            </div>
        </form>
    );
}




export const SubforumSettings: FC<ISubforumSettingsProps> = (_) => {
    return (
        <div className={styles.container}>
            <SubforumSettingsSection title="Kick Members" buttonText={"Kick"} buttonIcon={<X/>} />
            <SubforumSettingsSection title="Demote mods to users" buttonText={"Demote"} buttonIcon={<ChevronDoubleDown/>} />
            <SubforumSettingsSection title="Promote users to mods" buttonText={"Promote"} buttonIcon={<ChevronDoubleUp/>} />
            <SubforumSettingsSection title="Transfer ownership" buttonText={"Transfer"} buttonIcon={<ArrowRightSquare/>} />
        </div>
    );
}

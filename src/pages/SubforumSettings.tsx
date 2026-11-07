import { useEffect, useRef, useState, type FC, type ReactNode } from "react";
import styles from "../scss/subforumSettingsPage.module.scss";
import buttonStyles from "../scss/baseButton.module.scss";
import { SMEntry } from "../components/SMEntry";
import { ArrowRightSquare, ChevronDoubleDown, ChevronDoubleUp, X } from "../components/Icons";
import { BaseButton } from "../components/BaseButton";
import { useStory, useStoryInit } from "../providers/StoryProvider";
import { SearchField, type ISearchFieldHandle, type ISuggestion } from "../components/SearchField";
import { bridge } from "../misc/utils";
import { useParams } from "react-router";
import { TypingTextBox, useTypingBoxes } from "../components/TypingTextBox";
import { db, type ISubforum } from "../misc/db";
interface ISubforumSettingsProps { };
interface ISubforumSettingsSectionProps {
    title: string;
    buttonText: string;
    buttonIcon: ReactNode;
    id?: string;
    filterFunction?: (suggestion: ISuggestion) => boolean;
    hintNames?: string[];
    onSubmit?: (name: string) => Promise<boolean>;
};

const SubforumSettingsSection: FC<ISubforumSettingsSectionProps> = (props) => {
    const [selectedUser, setSelectedUser] = useState<string>("");
    const story = useStory();
    const searchRef = useRef<ISearchFieldHandle>(null);

    function updateHints() {
        if (!props.hintNames)
            return;
        searchRef?.current?.setSuggestionHint(props.hintNames.map((name) => `u/${name}`));
    }

    function removeUser() {
        setSelectedUser("");
        if (!props.hintNames)
            return;
        story.goBackwardHint(`${props.id}-submit`);
        story.goBackwardHint("");
    }

    function addUser(name: string) {
        setSelectedUser(name);
        if (props.hintNames?.length && props.hintNames.includes(name)) {
            story.goForwardHint(`${props.id}-search`);
            story.goForwardHint("");
        }
    }

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setSelectedUser("");
        if (!await props.onSubmit?.(selectedUser)) {
            story.goBackwardHint(`${props.id}-submit`);
            story.goBackwardHint("");
        }
    }

    return (
        <form className={styles.section} onSubmit={onSubmit}>
            <h1 className={styles.title}>{props.title}</h1>
            <div className={styles.inputDiv}>
                <SearchField id={props.id ? `${props.id}-search` : undefined} ref={searchRef} onFocus={() => updateHints()} onSuggestionClick={addUser} filterFunction={props.filterFunction} className={styles.input} />
            </div>
            {selectedUser != "" ? <SMEntry type="user" onClick={removeUser} isSelected name={selectedUser} /> : ""}
            <div>
                <BaseButton id={props.id ? `${props.id}-submit` : undefined} iconPos="start" icon={props.buttonIcon} className={`${buttonStyles.primaryButton} ${styles.submitButton}`} type="submit">{props.buttonText}</BaseButton>
            </div>
        </form>
    );
}




export const SubforumSettings: FC<ISubforumSettingsProps> = (_) => {
    const typingBoxes = useTypingBoxes();
    const storyInit = useStoryInit();
    const story = useStory();
    const { name } = useParams<{ name: string }>();
    const [subforum, setSubforum] = useState<ISubforum | undefined>(undefined);
    const [demoteTarget, setDemoteTarget] = useState<string[] | undefined>(undefined);
    const [transferTarget, setTransferTarget] = useState<string | undefined>(undefined);

    const filterMembers = (suggestion: ISuggestion) => suggestion.type == "user" && (subforum?.members.includes(suggestion.name) ?? false);
    const filterMods = (suggestion: ISuggestion) => suggestion.type == "user" && (subforum?.mods.includes(suggestion.name) ?? false);
    const filterUsers = (suggestion: ISuggestion) => suggestion.type == "user";

    async function init() {
        const target = await db.subforumsBuffer.where("name").equals(name ?? "").first() ?? await db.subforums.where("name").equals(name ?? "").first();
        setSubforum(target);
        story.setSubforumSettingsHandle({ setDemoteTarget, setTransferTarget });
    }

    async function onDemote(name: string) {
        if (!subforum||!demoteTarget)
            return false;
        const mods = subforum.mods.filter((mod) => mod != name);
        const members = [...subforum.members, name];
        const updated = { ...subforum, mods, members };
        await db.subforumsBuffer.put(updated);
        setSubforum(updated);
        if (demoteTarget.every((mod) => !mods.includes(mod))) {
            setDemoteTarget(undefined);
            story.resumeStoryFromHint("demote-submit");
        }
        return demoteTarget.every((mod) => !mods.includes(mod));
    }

    async function onTransfer(name: string) {
        if (!subforum||!transferTarget)
            return false;
        const updated = { ...subforum, admin: name };
        await db.subforumsBuffer.put(updated);
        setSubforum(updated);
        if (updated.admin == transferTarget) {
            setTransferTarget(undefined);
            story.resumeStoryFromHint("transfer-submit");
        }
        return updated.admin == transferTarget;
    }

    useEffect(() => {
        bridge.exec(storyInit, 3, typingBoxes.getTypingBoxes(), init);
        return () => story.setSubforumSettingsHandle(undefined);
    }, [name])

    return (
        <>
            <TypingTextBox ref={typingBoxes.setTypingBox("nar1")} type={"terminal"} />
            <div className={styles.container}>
                <SubforumSettingsSection title="Kick Members" buttonText={"Kick"} buttonIcon={<X />} filterFunction={filterMembers} />
                <SubforumSettingsSection title="Demote mods to users" buttonText={"Demote"} buttonIcon={<ChevronDoubleDown />} id="demote" hintNames={demoteTarget} filterFunction={filterMods} onSubmit={demoteTarget ? onDemote : undefined} />
                <SubforumSettingsSection title="Promote users to mods" buttonText={"Promote"} buttonIcon={<ChevronDoubleUp />} filterFunction={filterMembers} />
                <SubforumSettingsSection title="Transfer ownership" buttonText={"Transfer"} buttonIcon={<ArrowRightSquare />} id="transfer" hintNames={transferTarget ? [transferTarget] : undefined} filterFunction={filterUsers} onSubmit={transferTarget ? onTransfer : undefined} />
            </div>
        </>
    );
}

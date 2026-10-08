import { useEffect, useRef, useState, type FC, type ReactNode, type RefObject } from "react";
import styles from "../scss/subforumSettingsPage.module.scss";
import buttonStyles from "../scss/baseButton.module.scss";
import { SMEntry } from "../components/SMEntry";
import { ArrowRightSquare, ChevronDoubleDown, ChevronDoubleUp, X } from "../components/Icons";
import { BaseButton } from "../components/BaseButton";
import { useStory, useStoryInit } from "../providers/StoryProvider";
import { SearchField, type ISearchFieldHandle, type ISuggestion } from "../components/SearchField";
import { bridge } from "../utils";
import { useParams } from "react-router";
import { TypingTextBox, useTypingBoxes } from "../components/TypingTextBox";
import { db, type ISubforum } from "../backend/db";
interface ISubforumSettingsProps { };
interface ISubforumSettingsSectionProps {
    title: string;
    buttonText: string;
    buttonIcon: ReactNode;
    id?: string;
    searchRef?: RefObject<ISearchFieldHandle | null>;
    filterFunction?: (suggestion: ISuggestion) => boolean;
    hintNames?: string[];
    onSubmit?: (names: string[]) => void;
};

const SubforumSettingsSection: FC<ISubforumSettingsSectionProps> = (props) => {
    const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set<string>());
    const story = useStory();

    function updateHints(selected: Set<string>) {
        if (!props.hintNames)
            return;
        props.searchRef?.current?.setSuggestionHint(props.hintNames.filter((name) => !selected.has(name)).map((name) => `u/${name}`));
    }

    function removeUser(name: string) {
        let n = new Set(selectedUsers);
        n.delete(name);
        setSelectedUsers(n);
        if (!props.hintNames)
            return;
        updateHints(n);
        story.goBackwardHint(`${props.id}-submit`);
        story.goBackwardHint("");
    }

    function addUser(name: string) {
        let n = new Set(selectedUsers);
        n.add(name);
        setSelectedUsers(n);
        if (props.hintNames?.length && props.hintNames.every((hintName) => n.has(hintName))) {
            story.goForwardHint(`${props.id}-search`);
            story.goForwardHint("");
        }
    }

    function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        console.log(selectedUsers);
        props.onSubmit?.(Array.from(selectedUsers));
        setSelectedUsers(new Set<string>());
    }



    return (
        <form className={styles.section} onSubmit={onSubmit}>
            <h1 className={styles.title}>{props.title}</h1>
            <div className={styles.inputDiv}>
                <SearchField id={props.id ? `${props.id}-search` : undefined} ref={props.searchRef} onFocus={() => updateHints(selectedUsers)} onSuggestionClick={addUser} filterFunction={props.filterFunction} className={styles.input} />
            </div>
            {Array.from(selectedUsers).map((value, i) => (
                <SMEntry type="user" onClick={removeUser} isSelected key={i} name={value} />
            ))}
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
    const demoteSearch = useRef<ISearchFieldHandle>(null);
    const [subforum, setSubforum] = useState<ISubforum | undefined>(undefined);
    const [isDemoting, setIsDemoting] = useState<boolean>(false);

    const filterMembers = (suggestion: ISuggestion) => suggestion.type == "user" && (subforum?.members.includes(suggestion.name) ?? false);
    const filterMods = (suggestion: ISuggestion) => suggestion.type == "user" && (subforum?.mods.includes(suggestion.name) ?? false);
    const filterUsers = (suggestion: ISuggestion) => suggestion.type == "user";

    async function init() {
        const target = await db.subforumsBuffer.where("name").equals(name ?? "").first() ?? await db.subforums.where("name").equals(name ?? "").first();
        setSubforum(target);
        story.setSubforumSettingsHandle({
            toggleDemoting() {
                setIsDemoting((prev) => !prev);
            }
        });
    }

    async function onDemote(names: string[]) {
        if (!subforum)
            return;
        const mods = subforum.mods.filter((mod) => !names.includes(mod));
        const updated = { ...subforum, mods };
        await db.subforumsBuffer.put(updated);
        setSubforum(updated);
        if (mods.length == 0) {
            story.toggleDemoting();
            story.resumeStoryFromHint("demote-submit");
        }
    }

    useEffect(() => {
        bridge.exec(storyInit, 3, typingBoxes.getTypingBoxes(), init);
        return () => story.setSubforumSettingsHandle(undefined);
    }, [name])
    console.log(subforum?.mods)
    return (
        <>
            <TypingTextBox ref={typingBoxes.setTypingBox("nar1")} id="nar1" type={"terminal"} />
            <div className={styles.container}>
                <SubforumSettingsSection title="Kick Members" buttonText={"Kick"} buttonIcon={<X />} filterFunction={filterMembers} />
                <SubforumSettingsSection title="Demote mods to users" buttonText={"Demote"} buttonIcon={<ChevronDoubleDown />} id="demote" searchRef={demoteSearch} hintNames={isDemoting ? subforum?.mods : undefined} filterFunction={filterMods} onSubmit={isDemoting ? onDemote : undefined} />
                <SubforumSettingsSection title="Promote users to mods" buttonText={"Promote"} buttonIcon={<ChevronDoubleUp />} filterFunction={filterMembers} />
                <SubforumSettingsSection title="Transfer ownership" buttonText={"Transfer"} buttonIcon={<ArrowRightSquare />} filterFunction={filterUsers} />
            </div>
        </>
    );
}

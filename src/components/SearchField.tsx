import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { InputField, type IInputFieldHandle } from "./InputField";
import { Search } from "./Icons";
import { SMEntry } from "./SMEntry";
import styles from "../scss/searchField.module.scss";
import hintStyle from '../scss/storyProvider.module.scss';
import { db } from "../backend/db";
import { useStory } from "../providers/StoryProvider";
interface ISearchFieldProps {
    id?: string
    onSuggestionClick?: (name: string) => void | Promise<void>;
    className?:string
    isSuggestionNav?:boolean;
    filterFunction?:(suggestion:ISuggestion)=>boolean;
    onFocus?:()=>void;
};

export interface ISuggestion{
    name:string;
    type:"user"|"subforum";
}

export interface ISearchFieldHandle{
    setSuggestionHint: (names?:string[])=>void;
}

export const SearchField= forwardRef<ISearchFieldHandle,ISearchFieldProps>((props,ref) => {
    const inputRef = useRef<IInputFieldHandle>(null);
    const [suggestions, setSuggestions] = useState<ISuggestion[]>([]);
    const [isFocused, setIsFocused] = useState<boolean>(false);
    const suggestionHint = useRef<string[]>([]);
    const story=useStory();

    async function onChange(value: string) {
        if (value.trim() === "")
            setSuggestions([]);
        else
        {
            const users = await db.users.where("nickname").startsWithIgnoreCase(value.trim()).toArray();
            const subforums= await db.subforums.where("name").startsWithIgnoreCase(value.trim()).toArray()
            const newSuggestions = [...users.map((u) => ({name:u.nickname,type:"user"} as ISuggestion)), ...subforums.map((s) => ({name:s.name,type:"subforum"} as ISuggestion))];
            setSuggestions(props.filterFunction?newSuggestions.filter(props.filterFunction):newSuggestions);
        }
    }

    function getFullName(suggestion:ISuggestion) {
        return `${suggestion.type=="user"?"u/":"f/"}${suggestion.name}`;
    }

    async function onSuggestionClick(name: string,type:"user"|"subforum") {
        const fullName=getFullName({name:name,type:type});
        if (suggestionHint.current.includes(fullName))
            suggestionHint.current=suggestionHint.current.filter((value)=>value!=fullName);
        if (props.onSuggestionClick)
            await props.onSuggestionClick(name);
        setIsFocused(false);
    }

    function handleFocus() {
        props.onFocus?.();
        if (props.id)
            story.goForwardHint(props.id);
        setIsFocused(true);
    }

    function onBlur(e:React.FocusEvent) {
         if (!e.currentTarget.contains(e.relatedTarget)) {
            setIsFocused(false);
        }
    }

    useEffect(() => {
        if (!isFocused && suggestionHint.current.length != 0)
            story.goBackwardHint("");
    }, [isFocused]);

    useImperativeHandle(ref, () => ({
        setSuggestionHint(names?: string[]) {
            suggestionHint.current = names ?? [];
        }
    }));

    return (
        <div className={styles.container} tabIndex={-1} onFocus={handleFocus} onBlur={onBlur}>
            <InputField className={props.className} icon={<Search className={styles.icon} />} id={props.id} onChange={onChange} ref={inputRef} placeholder="Search" type={"text"} />
            {isFocused && suggestions.length != 0 ?
                <div className={styles.dropdown}>
                    {
                        suggestions.map((value) => (
                            <SMEntry className={`${suggestionHint.current.includes(getFullName(value))?hintStyle.hint:""} ${styles.suggestion}`} onClick={onSuggestionClick} key={value.name} type={value.type} name={value.name} isNav={props.isSuggestionNav}/>
                        ))
                    }
                </div>
                : ""}
        </div>
    );
});

import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { InputField, type InputFieldHandle } from "./InputField";
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
};

interface ISuggestion{
    name:string;
    type:"user"|"subforum";
}

export interface ISearchFieldHandle{
    setSuggestionHint: (name?:string)=>void;
}

export const SearchField= forwardRef<ISearchFieldHandle,ISearchFieldProps>((props,ref) => {
    const inputRef = useRef<InputFieldHandle>(null);
    const [suggestions, setSuggestions] = useState<ISuggestion[]>([]);
    const [isFocused, setIsFocused] = useState<boolean>(false);
    const suggestionHint = useRef<string|undefined>(undefined);
    const story=useStory();

    async function onChange(value: string) {
        if (value.trim() === "")
            setSuggestions([]);
        else
        {
            const users = await db.users.where("nickname").startsWithIgnoreCase(value.trim()).toArray();
            const subforums= await db.subforums.where("name").startsWithIgnoreCase(value.trim()).toArray()
            const newSuggestions = [...users.map((u) => ({name:u.nickname,type:"user"} as ISuggestion)), ...subforums.map((s) => ({name:s.name,type:"subforum"} as ISuggestion))];
            setSuggestions(newSuggestions);
        }
    }

    async function onSuggestionClick(name: string,type:"user"|"subforum") {
        if (suggestionHint.current){
            const fullName=`${type=="user"?"u/":"f/"}${name}`;
            if (fullName==suggestionHint.current)
                suggestionHint.current=undefined;
        }
        if (props.onSuggestionClick)
            await props.onSuggestionClick(name);
        setIsFocused(false);
    }

    function onFocus() {
        if (props.id)
            story.goForwardHint(props.id);
        setIsFocused(true);
    }

    function onBlur(e:React.FocusEvent) {
         if (!e.currentTarget.contains(e.relatedTarget)) {
            setIsFocused(false);
            if (suggestionHint.current)
                story.goBackHint("");
        }
    }

    useImperativeHandle(ref, () => ({
        setSuggestionHint(name?: string) {
            suggestionHint.current = name;
        }
    }));

    return (
        <div className={styles.container} tabIndex={-1} onFocus={onFocus} onBlur={onBlur}>
            <InputField className={props.className} icon={<Search id={props.id} className={styles.icon} />} id={props.id} onChange={onChange} ref={inputRef} placeholder="Search" type={"text"} />
            {isFocused && suggestions.length != 0 ?
                <div className={styles.dropdown}>
                    {
                        suggestions.map((value) => (
                            <SMEntry className={`${`${value.type=="user"?"u/":"f/"}${value.name}`===suggestionHint.current?hintStyle.hint:""} ${styles.suggestion}`} onClick={onSuggestionClick} key={value.name} type={value.type} name={value.name} isNav={props.isSuggestionNav}/>
                        ))
                    }
                </div>
                : ""}
        </div>
    );
});

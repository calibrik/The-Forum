import { useRef } from "react";
import type { ISearchFieldHandle } from "../components/SearchField";
import type { IDestination } from "../misc/db";
import { bridge } from "../misc/utils";
import styles from "../scss/storyProvider.module.scss";
import { useUserState } from "../providers/UserAuth";

interface INavHintContext {
    location: string[];
    targetLocation: string[];
    mismatchedLevel: number;
    userLoggedIn: string;
    searchField?: ISearchFieldHandle;
}

const NAVIGATE_TO_PAGE: Record<string, (ctx: INavHintContext) => string[]> = {
    "user": (ctx) => {
        if (ctx.location[1] == "post")
            return ["back-text"];
        if (ctx.mismatchedLevel == 3) {
            return [ctx.targetLocation[3] ?? "posts"];
        }
        if (ctx.userLoggedIn == ctx.targetLocation[2])
            return ["user-icon-text"];
        ctx.searchField?.setSuggestionHint([`u/${ctx.targetLocation[2]}`]);
        return ["header-search", ""];
    },
    "subforum": (ctx) => {
        if (ctx.location[1] == "post")
            return ["back-text"];
        if (ctx.mismatchedLevel == 3) {
            return [ctx.targetLocation[3] ?? "posts"];
        }
        ctx.searchField?.setSuggestionHint([`f/${ctx.targetLocation[2]}`]);
        return ["header-search", ""];
    },
    "chat": (ctx) => {
        if (ctx.mismatchedLevel == 2) {
            if (ctx.location.length >= 3)
                return ["back-text"];
            return [ctx.targetLocation[2]];
        }
        return ["menu-icon-text", "chat-menu"];
    },
    "post": (ctx) => {
        if (ctx.location[1] == "post")
            return ["back-text"];
        return [ctx.targetLocation[2]];
    },
}

export function useElementHints() {
    const currIndex = useRef<number>(-1);//current index in path for chained nav
    const currHint = useRef<string[]>([]);//curr hint, length ==0 means it's not set
    const currStoryHint = useRef<string[]>([]);//current story hint used for caching the last story hint for recover on page function
    const headerSearch = useRef<ISearchFieldHandle>(null);
    const isStoryHint = useRef<boolean>(false);//is story hint currently hinting (for nav hint to trigger)
    const userState = useUserState();

    function setHeaderSearch(ref: ISearchFieldHandle | null) {
        headerSearch.current = ref;
    }

    function hint(id: string) {
        if (id == "")
            return;
        const els = document.querySelectorAll(`#${id}`);
        if (els.length == 0) {
            console.error(`No element with id ${id}`)
            return;
        }
        const hintClass = id.includes("text") ? styles.hintText : styles.hint;
        els.forEach((el) => el.classList.add(hintClass));
    }

    function goForwardHint(clickedId: string) {
        if (currHint.current.length > 1 && clickedId == currHint.current[currIndex.current]) {
            removeCurrHint();
            hint(currHint.current[++currIndex.current]);
        }
    }

    function setStoryHint(hints: string[], dontActivate?: boolean) {
        currHint.current = hints;
        currStoryHint.current = hints;
        currIndex.current = 0;
        if (!dontActivate) {
            isStoryHint.current = true;
            hint(hints[0]);
        }
    }

    function resetStoryHint() {
        currStoryHint.current = []
    }

    function reactivateStoryHint() {
        if (currStoryHint.current.length == 0)
            return;
        currIndex.current = 0;
        currHint.current = currStoryHint.current;
        isStoryHint.current = true;
        hint(currHint.current[0]);
    }

    function removeCurrHint() {
        const id = currHint.current[currIndex.current];
        if (id == "")
            return;
        const hintClass = id.includes("text") ? styles.hintText : styles.hint;
        document.querySelectorAll(`#${id}`).forEach((el) => el.classList.remove(hintClass));
    }

    function getCurrentStoryHint() {
        if (currStoryHint.current.length == 0)
            return "";
        return currStoryHint.current[currIndex.current];
    }

    function hintNavPath(target?: IDestination) {
        if (!target || !isStoryHint.current && currHint.current.length != 0) {
            return;
        }
        isStoryHint.current = false;
        if (target.user !== userState.userLoggedIn.current) {
            currHint.current = ["menu-icon-text", "logout"];
            currIndex.current = 0;
            bridge.exec(hint, currHint.current[currIndex.current]);
            return;
        }
        const location = window.location.pathname.split('/').slice(0, target.level + 1);
        const targetLocation = target.where.split('/');
        let mismatchedLevel = 0;
        const minLength = Math.min(location.length, targetLocation.length);
        for (; mismatchedLevel < minLength; mismatchedLevel++) {
            if (location[mismatchedLevel] != targetLocation[mismatchedLevel])
                break;
        }
        if (mismatchedLevel > target.level)
            return;
        const navFunc = NAVIGATE_TO_PAGE[targetLocation[1]];
        if (!navFunc) {
            currHint.current = [];
            return;
        }
        currHint.current = navFunc({
            location,
            targetLocation,
            mismatchedLevel,
            userLoggedIn: userState.userLoggedIn.current,
            searchField: headerSearch.current ?? undefined
        });
        currIndex.current = 0;
        bridge.exec(hint, currHint.current[currIndex.current]);
    }

    function goBackwardHint(clickedId: string) {
        if (currHint.current.length > 1 && clickedId == currHint.current[currIndex.current]) {
            removeCurrHint();
            hint(currHint.current[--currIndex.current]);
        }
    }

    function resetHint() {
        if (currHint.current.length == 0)
            return;
        removeCurrHint();
        currHint.current = [];
        headerSearch.current?.setSuggestionHint(undefined);
    }

    const _getCurrHint = process.env.NODE_ENV == 'test' ? () => currHint : undefined;
    const _getCurrIndex = process.env.NODE_ENV == 'test' ? () => currIndex : undefined;
    const _getIsStoryHint = process.env.NODE_ENV == 'test' ? () => isStoryHint : undefined;
    const _hint = process.env.NODE_ENV == 'test' ? hint : undefined;

    return { hintNavPath, goBackwardHint, goForwardHint, resetHint, setHeaderSearch, setStoryHint, reactivateStoryHint, resetStoryHint, removeCurrHint, getCurrentStoryHint, _getCurrHint, _getCurrIndex, _hint, _getIsStoryHint };
}

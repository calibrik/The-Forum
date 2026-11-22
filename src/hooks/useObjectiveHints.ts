import { useRef } from "react";

export function useObjectiveHints() {
    const hintText = useRef<string>("");//cache of the latest objective hint (the "Current objective" text in the side menu) to restore on recovery on the target page
    const lastNavHint = useRef<string>("");//last navigation hint (from navigate false) to show in the side menu when the user navigates away from the target page

    function dispatchHint(text: string) {
        window.dispatchEvent(new CustomEvent<string>("storyHintText", { detail: text }));
    }

    function setObjectiveHint(text: string) {
        hintText.current = text;
    }

    function resetObjectiveHint() {
        hintText.current = "";
    }

    function restoreObjectiveHint() {
        dispatchHint(hintText.current);
    }

    function setNavHint(text: string) {
        lastNavHint.current = text;
    }

    function showNavHint() {
        dispatchHint(lastNavHint.current);
    }

    const _lastNavHint = process.env.NODE_ENV == 'test' ? () => lastNavHint : undefined;
    return { dispatchHint, setObjectiveHint, resetObjectiveHint, restoreObjectiveHint, setNavHint, showNavHint, _lastNavHint };
}

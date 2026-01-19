import { useEffect, useRef, useState, type FC, type ReactNode } from "react";
import styles from "../scss/menu.module.scss";
import { useNavigate } from "react-router";

interface IOption {
    name: string;
    /**without /*/
    destination?: string;
}

interface IMenuProps {
    options: Record<string, IOption>
};

export const Menu: FC<IMenuProps> = (props) => {
    const ids = useRef<string[]>(Object.keys(props.options));
    const [activeOption, setActiveOption] = useState<string>("");
    let navigate = useNavigate();

    function onOptionSelect(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
        e.preventDefault();
        const id = e.currentTarget.dataset.optionid ?? ids.current[0];
        if (activeOption == id||props.options[id].destination===undefined) {
            return;
        }
        setActiveOption(id);
        navigate(props.options[id].destination,);
    }

    function determineActiveOption()
    {
        const url = new URL(document.URL);
        const segments = url.pathname.split('/').filter(segment => segment !== "");
        const lastSegment = segments[segments.length - 1];
        if (props.options[lastSegment])
            setActiveOption(lastSegment);
        else
            setActiveOption(ids.current[0]);
    }

    useEffect(() => {
        determineActiveOption();
        window.addEventListener("popstate",determineActiveOption);
        return ()=>{
            window.removeEventListener("popstate",determineActiveOption);
        };
    }, [])

    let optionElements: ReactNode[] = [];
    for (const id of ids.current) {
        if (id == activeOption)
            optionElements.push(<div onClick={onOptionSelect} key={id} data-optionid={id} className={`${styles.option} ${styles.active}`}>{props.options[id].name}</div>)
        else
            optionElements.push(<div onClick={onOptionSelect} key={id} data-optionid={id} className={`${styles.option}`}>{props.options[id].name}</div>)
    }

    return (
        <div className={styles.menuContainer}>
            {optionElements}
        </div>
    );
}

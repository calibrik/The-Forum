import { useEffect, useState, type FC } from "react";
import styles from "../scss/menu.module.scss";
import { useNavigate } from "react-router";

export interface IMenuOption {
    name: string;
    /**without /*/
    destination?: string;
    id?:string
}

interface IMenuProps {
    options: IMenuOption[]
};

export const Menu: FC<IMenuProps> = (props) => {
    const [activeOption, setActiveOption] = useState<number>(0);
    let navigate = useNavigate();

    function onOptionSelect(e: React.MouseEvent<HTMLDivElement, MouseEvent>,id:number) {
        e.preventDefault();
        if (activeOption == id||props.options[id].destination===undefined) {
            return;
        }
        setActiveOption(id);
        navigate(props.options[id].destination);
    }

    function determineActiveOption()
    {
        const url = new URL(document.URL);
        const segments = url.pathname.split('/').filter(segment => segment !== "");
        const lastSegment = segments[segments.length - 1];
        const index=props.options.findIndex((v)=>v.destination==lastSegment)
        setActiveOption(index!=-1?index:0);
    }

    useEffect(() => {
        determineActiveOption();
        window.addEventListener("popstate",determineActiveOption);
        return ()=>{
            window.removeEventListener("popstate",determineActiveOption);
        };
    }, [])

    return (
        <div className={styles.menuContainer}>
            {props.options.map((v,i)=>(
                <div onClick={(e)=>onOptionSelect(e,i)} id={v.id} key={i} className={`${styles.option} ${i == activeOption?styles.active:""}`}>{props.options[i].name}</div>
            ))}
        </div>
    );
}

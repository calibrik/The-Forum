import { useState, type FC, type ReactNode } from "react";
import styles from "../scss/menu.module.scss";
import { useNavigate } from "react-router";

interface IOption{
    name:string;
    /**without /*/
    destination:string;
}

interface IMenuProps {
    options: Record<string, IOption>
};

export const Menu: FC<IMenuProps> = (props) => {
    const ids=Object.keys(props.options);
    const [activeOption,setActiveOption]=useState<string>(ids[0]);
    let navigate=useNavigate();

    function onOptionSelect(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
        e.preventDefault();
        const id=e.currentTarget.dataset.optionid??ids[0];
        if (activeOption==id){
            return;
        }
        setActiveOption(id);
        navigate(props.options[id].destination,);
    }

    let optionElements:ReactNode[]=[];
    for (const id of ids) {
        if (id==activeOption)
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

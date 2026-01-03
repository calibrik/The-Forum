import type { FC, RefObject } from "react";
import '../scss/header.scss';
interface IHeaderProps {
    isLoggedIn?: boolean;
    ref?:RefObject<HTMLDivElement|null>;
};

export const Header: FC<IHeaderProps> = (props) => {
    return (
        <div id="header-div" ref={props.ref} className="header">
            <span id="header-text" className="header-title">The<span id="header-text" className="highlight">Forum</span></span>
        </div>
    );
}

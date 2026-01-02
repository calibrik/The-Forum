import type { FC, RefObject } from "react";
import '../scss/header.scss';
interface IHeaderProps {
    isLoggedIn?: boolean;
    ref?:RefObject<HTMLDivElement|null>;
};

export const Header: FC<IHeaderProps> = (props) => {
    return (
        <div ref={props.ref} className="header">
            <span className="header-title">The<span className="highlight">Forum</span></span>
        </div>
    );
}

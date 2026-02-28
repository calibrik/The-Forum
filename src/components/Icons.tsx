import type { FC, ReactNode } from "react";
import styles from "../scss/icons.module.scss"
interface IIconProps {
    onClick?: (e?: React.MouseEvent<HTMLDivElement>) => void | Promise<void>
    className?: string
    interactive?: boolean
    id?: string
    spin?: boolean
    tabindex?:number
};
interface IIconWrapper extends IIconProps {
    icon: ReactNode
}

const IconWrapper: FC<IIconWrapper> = (props) => {
    const className = `${styles.iconWrapper} ${props.className ?? ""} ${props.interactive ? styles.interactive : ""} ${props.spin ? styles.spin : ""}`;
    function onClick(e: React.MouseEvent<HTMLDivElement>) {
        e.preventDefault();
        if (props.onClick)
            props.onClick(e);
    }
    return (
        <div onClick={onClick} tabIndex={-1} id={props.id} data-istransition="true" className={className}>
            {props.icon}
        </div>
    );
}

export const Eye: FC<IIconProps> = (props) => {
    return (
        <IconWrapper icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" className="bi bi-eye-fill" viewBox="0 0 16 16">
                <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0" />
                <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8m8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7" />
            </svg>
        } {...props} />
    );
}

export const EyeSlash: FC<IIconProps> = (props) => {
    return (
        <IconWrapper icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" className="bi bi-eye-slash-fill" viewBox="0 0 16 16">
                <path d="m10.79 12.912-1.614-1.615a3.5 3.5 0 0 1-4.474-4.474l-2.06-2.06C.938 6.278 0 8 0 8s3 5.5 8 5.5a7 7 0 0 0 2.79-.588M5.21 3.088A7 7 0 0 1 8 2.5c5 0 8 5.5 8 5.5s-.939 1.721-2.641 3.238l-2.062-2.062a3.5 3.5 0 0 0-4.474-4.474z" />
                <path d="M5.525 7.646a2.5 2.5 0 0 0 2.829 2.829zm4.95.708-2.829-2.83a2.5 2.5 0 0 1 2.829 2.829zm3.171 6-12-12 .708-.708 12 12z" />
            </svg>
        } {...props} />
    );
}

export const Plus: FC<IIconProps> = (props) => {
    return (
        <IconWrapper icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" className="bi bi-plus" viewBox="0 0 16 16">
                <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4" />
            </svg>
        } {...props} />
    );
}

export const Heart: FC<IIconProps> = (props) => {
    return (
        <IconWrapper icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" className="bi bi-heart" viewBox="0 0 16 16">
                <path d="m8 2.748-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143q.09.083.176.171a3 3 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15" />
            </svg>
        } {...props} />
    );
}

export const HeartFill: FC<IIconProps> = (props) => {
    return (
        <IconWrapper icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" className="bi bi-heart-fill" viewBox="0 0 16 16">
                <path fillRule="evenodd" d="M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314" />
            </svg>
        } {...props} />
    );
}

export const CommentIcon: FC<IIconProps> = (props) => {
    return (
        <IconWrapper icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" className="bi bi-chat-square" viewBox="0 0 16 16">
                <path d="M14 1a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1h-2.5a2 2 0 0 0-1.6.8L8 14.333 6.1 11.8a2 2 0 0 0-1.6-.8H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1zM2 0a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2.5a1 1 0 0 1 .8.4l1.9 2.533a1 1 0 0 0 1.6 0l1.9-2.533a1 1 0 0 1 .8-.4H14a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2z" />
            </svg>
        } {...props} />
    );
}

export const CheckCircle: FC<IIconProps> = (props) => {
    return (
        <IconWrapper icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" className="bi bi-check-circle" viewBox="0 0 16 16">
                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
                <path d="m10.97 4.97-.02.022-3.473 4.425-2.093-2.094a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-1.071-1.05" />
            </svg>
        } {...props} />
    );
}

export const CheckCircleFill: FC<IIconProps> = (props) => {
    return (
        <IconWrapper icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" className="bi bi-check-circle-fill" viewBox="0 0 16 16">
                <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0m-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z" />
            </svg>
        } {...props} />
    );
}

export const Search: FC<IIconProps> = (props) => {
    return (
        <IconWrapper icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" className="bi bi-search" viewBox="0 0 16 16">
                <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0" />
            </svg>
        } {...props} />
    );
}

export const X: FC<IIconProps> = (props) => {
    return (
        <IconWrapper icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" className="bi bi-x-lg" viewBox="0 0 16 16">
                <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z" />
            </svg>
        } {...props} />
    );
}

export const ChevronDoubleDown: FC<IIconProps> = (props) => {
    return (
        <IconWrapper icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" className="bi bi-chevron-double-down" viewBox="0 0 16 16">
                <path fill-rule="evenodd" d="M1.646 6.646a.5.5 0 0 1 .708 0L8 12.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708" />
                <path fill-rule="evenodd" d="M1.646 2.646a.5.5 0 0 1 .708 0L8 8.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708" />
            </svg>
        } {...props} />
    );
}

export const ChevronDoubleUp: FC<IIconProps> = (props) => {
    return (
        <IconWrapper icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" className="bi bi-chevron-double-up" viewBox="0 0 16 16">
                <path fill-rule="evenodd" d="M7.646 2.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1-.708.708L8 3.707 2.354 9.354a.5.5 0 1 1-.708-.708z" />
                <path fill-rule="evenodd" d="M7.646 6.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1-.708.708L8 7.707l-5.646 5.647a.5.5 0 0 1-.708-.708z" />
            </svg>
        } {...props} />
    );
}

export const ArrowRightSquare: FC<IIconProps> = (props) => {
    return (
        <IconWrapper icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" className="bi bi-arrow-right-square" viewBox="0 0 16 16">
                <path fill-rule="evenodd" d="M15 2a1 1 0 0 0-1-1H2a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1zM0 2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2zm4.5 5.5a.5.5 0 0 0 0 1h5.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3a.5.5 0 0 0 0-.708l-3-3a.5.5 0 1 0-.708.708L10.293 7.5z" />
            </svg>
        } {...props} />
    );
}

export const Menu: FC<IIconProps> = (props) => {
    return (
        <IconWrapper icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" className="bi bi-list" viewBox="0 0 16 16">
                <path fillRule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5" />
            </svg>
        } {...props} />
    );
}

export const Person: FC<IIconProps> = (props) => {
    return (
        <IconWrapper icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" className="bi bi-person-fill" viewBox="0 0 16 16">
                <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6" />
            </svg>
        } {...props} />
    );
}


export const ArrowLeft: FC<IIconProps> = (props) => {
    return (
        <IconWrapper icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" className="bi bi-arrow-left" viewBox="0 0 16 16">
                <path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8" />
            </svg>
        } {...props} />
    );
}

export const SendIcon: FC<IIconProps> = (props) => {
    return (
        <IconWrapper icon={
            <svg
                width="1em" height="1em" fill="currentColor" className="bi bi-send-fill"
                viewBox="0 0 16 16"
                version="1.1"
                id="svg1"
                xmlns="http://www.w3.org/2000/svg">
                <defs
                    id="defs1" />
                <path
                    d="m 15.639967,8.4425131 a 0.5,0.5 0 0 0 0,-0.9192388 L 1.2390311,1.3516463 1.238324,1.3509392 0.79143255,1.1586061 a 0.5,0.5 0 0 0 -0.6851866,0.5692211 l 0.1060661,0.4737614 -7.071e-4,0.00212 1.28481405,5.7791828 -1.28481315,5.7791836 7.1e-6,0.0028 -0.1060661,0.473761 a 0.5,0.5 0 0 0 0.6851866,0.567807 z m -2.632558,0.040305 -10.5981158,-3e-7 0.086974,-0.3910297 a 0.5,0.5 0 0 0 10e-8,-0.2177888 l -0.086974,-0.3910302 10.5981177,7e-7 1.166018,0.4999238 z"
                    id="path1" />
            </svg>
        } {...props} />
    );
}

export const Dot: FC<IIconProps> = (props) => {
    return (
        <IconWrapper icon={
            <svg
                width="1em" height="1em" fill="currentColor" className="bi bi-dot"
                viewBox="0 0 16 16"
                version="1.1"
                id="svg1"
                xmlns="http://www.w3.org/2000/svg">
                <defs
                    id="defs1" />
                <path
                    d="m 7.9980472,15.999722 a 7.9997607,7.997769 0 1 0 0,-15.99553791 7.9997607,7.997769 0 0 0 0,15.99553791"
                    id="path1" />
            </svg>
        } {...props} />
    );
}

export const Spinner: FC<IIconProps> = (props) => {
    return (
        <IconWrapper icon={
            <svg width="1em" height="1em" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <g>
                    <path d="M10,1V3a7,7,0,1,1-7,7H1a9,9,0,1,0,9-9Z" />
                </g>
            </svg>
        } {...props} />
    );
}

export const Reply: FC<IIconProps> = (props) => {
    return (
        <IconWrapper icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" className="bi bi-reply" viewBox="0 0 16 16">
                <path d="M6.598 5.013a.144.144 0 0 1 .202.134V6.3a.5.5 0 0 0 .5.5c.667 0 2.013.005 3.3.822.984.624 1.99 1.76 2.595 3.876-1.02-.983-2.185-1.516-3.205-1.799a8.7 8.7 0 0 0-1.921-.306 7 7 0 0 0-.798.008h-.013l-.005.001h-.001L7.3 9.9l-.05-.498a.5.5 0 0 0-.45.498v1.153c0 .108-.11.176-.202.134L2.614 8.254l-.042-.028a.147.147 0 0 1 0-.252l.042-.028zM7.8 10.386q.103 0 .223.006c.434.02 1.034.086 1.7.271 1.326.368 2.896 1.202 3.94 3.08a.5.5 0 0 0 .933-.305c-.464-3.71-1.886-5.662-3.46-6.66-1.245-.79-2.527-.942-3.336-.971v-.66a1.144 1.144 0 0 0-1.767-.96l-3.994 2.94a1.147 1.147 0 0 0 0 1.946l3.994 2.94a1.144 1.144 0 0 0 1.767-.96z" />
            </svg>
        } {...props} />
    );
}


export const Notepad: FC<IIconProps> = (props) => {
    return (
        <IconWrapper icon={
            <svg width="1em" height="1em" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18.8914 19.9926H3.66691V19.9908C0.520135 20.0741 0.0752018 19.6135 0.00964126 17.776C0.00165919 17.5508 0.00206278 17.2909 0.00246637 17.0002L0.00264574 16.7958H0V2.02636C0 1.08994 0.284529 0.569427 0.998296 0.260572C1.55749 0.0185704 2.32942 -0.0096566 3.46475 0.00293217L3.51543 0.00132925H18.2197C18.6011 0.00132925 18.9474 0.136717 19.1978 0.355066C19.4483 0.573454 19.6036 0.875154 19.6036 1.20782C19.6036 3.46062 19.5937 6.88215 19.5841 10.3035C19.5771 12.7888 19.57 15.2746 19.57 19.4011C19.57 19.7278 19.2661 19.9926 18.8914 19.9926Z" fill="#353944" />
                <path fillRule="evenodd" clipRule="evenodd" d="M3.66686 19.4012H18.8914C18.8914 13.0212 18.9251 7.58653 18.9251 1.20782C18.9251 0.869133 18.6082 0.592884 18.2197 0.592884H3.51543C1.38426 0.566729 0.678475 0.666071 0.678475 2.0264V16.7958C0.678475 18.9754 0.575471 19.4849 3.66686 19.4012Z" fill="#70B1E1" />
                <path d="M0.742287 0.396663C1.19565 0.10892 1.81206 0.0191177 2.68973 0.00332312C2.71365 0.00111111 2.73769 1.85904e-06 2.76175 0C3.13641 0 3.44022 0.264872 3.44022 0.591516V19.4059H3.43776L3.43758 19.4221C3.4274 19.7476 3.11641 20.004 2.74318 19.9951C-0.0020628 19.9285 -0.000941704 19.2134 0.00246637 17.0002C0.00748879 12.0131 0 7.01656 0 2.02636C0 1.22889 0.215605 0.731087 0.742287 0.396663Z" fill="#353944" />
                <path fillRule="evenodd" clipRule="evenodd" d="M2.75682 0.591516C1.20946 0.613253 0.678475 0.84118 0.678475 2.0264V16.7958C0.678475 18.7366 0.591838 19.3534 2.75682 19.4059V0.591516Z" fill="#656D7A" />
                <path d="M16.6856 0.592649V5.42482C16.6854 5.44415 16.6785 5.46298 16.6658 5.47881C16.6493 5.49913 16.6243 5.51293 16.5962 5.51718C16.5681 5.52144 16.5392 5.51579 16.5159 5.50149L15.2993 4.75503L14.0215 5.4982C14.0056 5.50926 13.9865 5.51619 13.9664 5.51819C13.9462 5.52019 13.9258 5.51719 13.9075 5.50952C13.8892 5.50185 13.8738 5.48983 13.863 5.47484C13.8522 5.45986 13.8464 5.44252 13.8465 5.42482V0.592649H16.6856Z" fill="#D64331" />
                <path d="M18.8384 11.2124H13.3521C12.9774 11.2124 12.6736 10.9475 12.6736 10.6209V7.97115C12.6736 7.64447 12.9774 7.3796 13.3521 7.3796H18.8384C19.1569 7.3796 19.4465 7.49356 19.6567 7.67657L19.6594 7.67891C19.8693 7.86223 20 8.11467 20 8.39233V10.1997C20 10.477 19.8693 10.7298 19.6594 10.9131L19.6567 10.9154C19.4465 11.0985 19.1569 11.2124 18.8384 11.2124Z" fill="#353944" />
                <path fillRule="evenodd" clipRule="evenodd" d="M13.3521 10.6209H18.8384C19.1042 10.6209 19.3215 10.4314 19.3215 10.1997V8.39233C19.3215 8.16061 19.1042 7.97115 18.8384 7.97115H13.3521V10.6209Z" fill="white" />
                <path fillRule="evenodd" clipRule="evenodd" d="M14.5522 7.88135H15.1912V10.7107H14.5522V7.88135Z" fill="#353944" />
                <path d="M17.8977 9.66696C18.1327 9.66696 18.3232 9.50089 18.3232 9.29602C18.3232 9.09116 18.1327 8.92508 17.8977 8.92508C17.6627 8.92508 17.4722 9.09116 17.4722 9.29602C17.4722 9.50089 17.6627 9.66696 17.8977 9.66696Z" fill="#353944" />
                <path fillRule="evenodd" clipRule="evenodd" d="M6.2722 18.2396H16.0712C16.4476 18.2396 16.7556 17.9698 16.7556 17.6429V14.3414C16.7556 14.0145 16.4463 13.7447 16.0712 13.7447H6.2722C5.89713 13.7447 5.5878 14.0132 5.5878 14.3414V17.6429C5.5878 17.9712 5.89587 18.2396 6.2722 18.2396Z" fill="#FDFEFF" />
                <path d="M6.90045 15.16C6.83796 15.1593 6.77833 15.1371 6.73444 15.0983C6.69056 15.0595 6.66596 15.0072 6.66596 14.9527C6.66596 14.8983 6.69056 14.846 6.73444 14.8072C6.77833 14.7684 6.83796 14.7462 6.90045 14.7455H12.7474C12.8098 14.7462 12.8695 14.7684 12.9134 14.8072C12.9572 14.846 12.9818 14.8983 12.9818 14.9527C12.9818 15.0072 12.9572 15.0595 12.9134 15.0983C12.8695 15.1371 12.8098 15.1593 12.7474 15.16H6.90045ZM6.90036 16.1996C6.8373 16.1996 6.77683 16.1777 6.73224 16.1388C6.68765 16.1 6.6626 16.0472 6.6626 15.9923C6.6626 15.9373 6.68765 15.8846 6.73224 15.8457C6.77683 15.8068 6.8373 15.785 6.90036 15.785H15.7146C15.7777 15.785 15.8382 15.8068 15.8827 15.8457C15.9273 15.8846 15.9524 15.9373 15.9524 15.9923C15.9524 16.0472 15.9273 16.1 15.8827 16.1388C15.8382 16.1777 15.7777 16.1996 15.7146 16.1996H6.90036ZM6.90036 17.2389C6.8373 17.2389 6.77683 17.2171 6.73224 17.1782C6.68765 17.1393 6.6626 17.0866 6.6626 17.0316C6.6626 16.9766 6.68765 16.9239 6.73224 16.8851C6.77683 16.8462 6.8373 16.8243 6.90036 16.8243H15.7146C15.7777 16.8243 15.8382 16.8462 15.8827 16.8851C15.9273 16.9239 15.9524 16.9766 15.9524 17.0316C15.9524 17.0866 15.9273 17.1393 15.8827 17.1782C15.8382 17.2171 15.7777 17.2389 15.7146 17.2389H6.90036Z" fill="#E8E7E8" />
            </svg>
        } {...props} />
    );
}

export const Terminal: FC<IIconProps> = (props) => {
    return (
        <IconWrapper icon={
            <svg width="1em" height="1em" viewBox="0 0 20 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19.6094 0H0.390625C0.174889 0 0 0.192481 0 0.429918V17.5701C0 17.8075 0.174889 18 0.390625 18H19.6094C19.8251 18 20 17.8075 20 17.5701V0.429918C20 0.192481 19.8251 0 19.6094 0Z" fill="black" />
                <path d="M2.20642 1.87707C2.13956 1.79531 2.05888 1.75443 1.96438 1.75443C1.86988 1.75443 1.78887 1.7957 1.72137 1.87825C1.65483 1.95961 1.62108 2.05867 1.62108 2.17424C1.62108 2.2898 1.65483 2.38886 1.72137 2.47023L2.77152 3.75443L1.72234 5.03745C1.65483 5.11999 1.62108 5.21905 1.62012 5.33462C1.62108 5.45018 1.65483 5.54924 1.72137 5.63061C1.78887 5.71197 1.86988 5.75325 1.96342 5.75443C2.05888 5.75443 2.13989 5.71315 2.20739 5.63061L3.37422 4.20254C3.61915 3.90419 3.61915 3.60466 3.37422 3.30513L2.20642 1.87707ZM6.78019 5.0398C6.71269 4.95726 6.63072 4.91598 6.53526 4.91598V4.91539H4.28261V4.91598C4.18714 4.91598 4.10613 4.95726 4.03863 5.0398C3.97113 5.12235 3.93738 5.22141 3.93738 5.33815C3.93738 5.4549 3.97113 5.55513 4.03863 5.63768C4.10613 5.72023 4.18714 5.7615 4.28261 5.7615V5.76091H6.53526V5.7615C6.63072 5.7615 6.71269 5.72023 6.78019 5.63768C6.8477 5.55513 6.88145 5.4549 6.88145 5.33815C6.88145 5.22141 6.8477 5.12235 6.78019 5.0398Z" fill="white" />
            </svg>
        } {...props} />
    );
}

export const Home: FC<IIconProps> = (props) => {
    return (
        <IconWrapper icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" className="bi bi-house-door" viewBox="0 0 16 16">
                <path d="M8.354 1.146a.5.5 0 0 0-.708 0l-6 6A.5.5 0 0 0 1.5 7.5v7a.5.5 0 0 0 .5.5h4.5a.5.5 0 0 0 .5-.5v-4h2v4a.5.5 0 0 0 .5.5H14a.5.5 0 0 0 .5-.5v-7a.5.5 0 0 0-.146-.354L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293zM2.5 14V7.707l5.5-5.5 5.5 5.5V14H10v-4a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5v4z" />
            </svg>
        } {...props} />
    );
}

export const Chat: FC<IIconProps> = (props) => {
    return (
        <IconWrapper icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" className="bi bi-chat-dots" viewBox="0 0 16 16">
                <path d="M5 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0m4 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0m3 1a1 1 0 1 0 0-2 1 1 0 0 0 0 2" />
                <path d="m2.165 15.803.02-.004c1.83-.363 2.948-.842 3.468-1.105A9 9 0 0 0 8 15c4.418 0 8-3.134 8-7s-3.582-7-8-7-8 3.134-8 7c0 1.76.743 3.37 1.97 4.6a10.4 10.4 0 0 1-.524 2.318l-.003.011a11 11 0 0 1-.244.637c-.079.186.074.394.273.362a22 22 0 0 0 .693-.125m.8-3.108a1 1 0 0 0-.287-.801C1.618 10.83 1 9.468 1 8c0-3.192 3.004-6 7-6s7 2.808 7 6-3.004 6-7 6a8 8 0 0 1-2.088-.272 1 1 0 0 0-.711.074c-.387.196-1.24.57-2.634.893a11 11 0 0 0 .398-2" />
            </svg>
        } {...props} />
    );
}

export const Gear: FC<IIconProps> = (props) => {
    return (
        <IconWrapper icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" className="bi bi-gear" viewBox="0 0 16 16">
                <path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492M5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0" />
                <path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115z" />
            </svg>
        } {...props} />
    );
}

export const Leave: FC<IIconProps> = (props) => {
    return (
        <IconWrapper icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" className="bi bi-box-arrow-left" viewBox="0 0 16 16">
                <path fillRule="evenodd" d="M6 12.5a.5.5 0 0 0 .5.5h8a.5.5 0 0 0 .5-.5v-9a.5.5 0 0 0-.5-.5h-8a.5.5 0 0 0-.5.5v2a.5.5 0 0 1-1 0v-2A1.5 1.5 0 0 1 6.5 2h8A1.5 1.5 0 0 1 16 3.5v9a1.5 1.5 0 0 1-1.5 1.5h-8A1.5 1.5 0 0 1 5 12.5v-2a.5.5 0 0 1 1 0z" />
                <path fillRule="evenodd" d="M.146 8.354a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L1.707 7.5H10.5a.5.5 0 0 1 0 1H1.707l2.147 2.146a.5.5 0 0 1-.708.708z" />
            </svg>
        } {...props} />
    );
}
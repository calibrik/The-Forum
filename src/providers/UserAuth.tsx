import { createContext, useContext, useRef, useState, type FC, type ReactNode, type RefObject } from "react";
interface IUserProviderProps {
    children: ReactNode,
};
interface IUser {
    isRealLoggedIn: RefObject<boolean> //means story is on
    userLoggedIn: string
    storyId:RefObject<number>
    startStory:RefObject<boolean>
    setUserLoggedIn: (user: string) => void,
}

const UserContext = createContext<IUser | null>(null);

export const UserProvider: FC<IUserProviderProps> = (props) => {
    const isRealLoggedIn = useRef<boolean>(false);
    const startStory=useRef<boolean>(false);
    const [userLoggedIn, setUserLoggedIn] = useState<string>("");
    const storyId=useRef<number>(1);

    return (
        <UserContext.Provider value={{ isRealLoggedIn, userLoggedIn, storyId, setUserLoggedIn,startStory }}>
            {props.children}
        </UserContext.Provider>
    );
}

export function useUserState() {
    const context = useContext(UserContext);

    if (!context)
        throw new Error('useUserState must be used within the ModalsProvider!');

    return context;
}
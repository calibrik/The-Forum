import { createContext, useContext, useRef, type FC, type ReactNode, type RefObject } from "react";
interface IUserProviderProps {
    children: ReactNode,
};
interface IUser {
    isRealLoggedIn: RefObject<boolean> //means story is on
    userLoggedIn: RefObject<string>
}

const UserContext = createContext<IUser | null>(null);

export const UserProvider: FC<IUserProviderProps> = (props) => {
    const isRealLoggedIn = useRef<boolean>(false);
    const userLoggedIn = useRef<string>("");

    return (
        <UserContext.Provider value={{ isRealLoggedIn, userLoggedIn }}>
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
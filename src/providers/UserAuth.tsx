import { createContext, useContext, useState, type FC, type ReactNode } from "react";
interface IUserProviderProps {
    children: ReactNode,
};
interface IUser {
    isRealLoggedIn: boolean //means story is on
    userLoggedIn: string
    setUserLoggedIn: (user: string) => void,
    setIsRealLoggedIn: (val: boolean) => void
}

const UserContext = createContext<IUser | null>(null);

export const UserProvider: FC<IUserProviderProps> = (props) => {
    const [isRealLoggedIn, setIsRealLoggedIn] = useState<boolean>(false);
    const [userLoggedIn, setUserLoggedIn] = useState<string>("")

    return (
        <UserContext.Provider value={{ isRealLoggedIn, setIsRealLoggedIn, userLoggedIn, setUserLoggedIn }}>
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
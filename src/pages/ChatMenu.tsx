import { useEffect, useState, type FC } from "react";
import styles from "../scss/chatMenu.module.scss";
import { addHashToUserNickname, bridge, formatTime, getImageUrl, resolveChatView, sanitizeDbFetch } from "../utils";
import { Dot } from "../components/Icons";
import { useNavigate } from "react-router";
import { useStory, useStoryInit } from "../providers/StoryProvider";
import { db, type IChat, type IMessage } from "../backend/db";
import { useUserState } from "../providers/UserAuth";
import { HintHolder, useHintHolders } from "../components/HintHolder";
interface IChatMenuProps { };
interface IDialogProps {
    chat: IChat
};

const Dialog: FC<IDialogProps> = (props) => {
    let navigate = useNavigate();
    const userState = useUserState();
    const [lastMessage, setLastMessage] = useState<IMessage | undefined>(undefined);
    const story = useStory();

    async function init() {
        const user = await db.users.where("nickname").equals(userState.userLoggedIn.current).first();
        if (!user)
            return;
        const msgs = await story.getMessages(props.chat.id);
        setLastMessage(msgs[msgs.length - 1]);
    }

    async function onClick() {
        await db.chats.where("id").equals(props.chat.id).modify({ isRead: true });//that's irreversible btw 
        navigate(`/chat/${props.chat.id}`)
    }

    useEffect(() => {
        init();
    }, []);

    return (
        <div onClick={onClick} id={props.chat.id} className={styles.dialog}>
            <img src={getImageUrl(props.chat.imageName ?? "placeholder.png")} alt="" className={styles.pfp} />
            <div className={styles.info}>
                <h3 className={styles.nickname}>{props.chat.name}</h3>
                <div className={styles.lastMessageDiv}>
                    {props.chat.isRead ? "" : <Dot className={styles.dot} />}
                    <p className={`${styles.lastMessage} ${props.chat.isRead ? styles.read : ""}`}><span className={styles.from}>{lastMessage?.from ?? ""}: </span>{lastMessage?.content ?? ""}</p>
                </div>
            </div>
            <span className={`${styles.timeSent} ${props.chat.isRead ? styles.read : ""}`}>{formatTime(lastMessage?.timeSent ?? new Date())}</span>
        </div>
    );
}


export const ChatMenu: FC<IChatMenuProps> = () => {
    const storyInit = useStoryInit();
    const [chats, setChats] = useState<IChat[]>([]);
    const userState = useUserState();
    let navigate = useNavigate();
    const { transferHints, setHintHolder } = useHintHolders();

    async function init() {
        if (!userState.isRealLoggedIn.current || userState.userLoggedIn.current === "") {
            navigate("/")
            return;
        }
        const nickname = userState.userLoggedIn.current;
        const owner = await addHashToUserNickname(nickname);
        const [buffered, saved] = await Promise.all([db.chatsBuffer.where("owner").equals(owner).toArray(), db.chats.where("owner").equals(owner).toArray()]);
        const chats = await sanitizeDbFetch([...buffered, ...saved]);
        setChats(await Promise.all(chats.map((chat) => resolveChatView(chat, nickname))));
    }

    useEffect(() => {
        bridge.exec(storyInit, 1, [], init);
    }, [])

    useEffect(() => {
        if (chats.length==0)
            return;
        transferHints();
    }, [chats])


    return (
        <div className={styles.container}>
            <div className={styles.headerContainer}>
                <h1 className={styles.header}>Chats</h1>
            </div>
            <div className={styles.dialogsContainer}>
                {chats.map((chat) => (
                    <Dialog key={chat.id} chat={chat} />
                ))}
                <HintHolder id="cyberdivers" ref={setHintHolder("cyberdivers")}/>
            </div>
        </div>
    );
}

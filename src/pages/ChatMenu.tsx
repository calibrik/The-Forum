import { useEffect, useState, type FC } from "react";
import styles from "../scss/chatMenu.module.scss";
import { formatTime, getImageUrl } from "../utils";
import { Dot } from "../components/Icons";
import { useNavigate } from "react-router";
import { useStoryInit } from "../providers/StoryProvider";
import { db, type IChat } from "../backend/db";
import { useUserState } from "../providers/UserAuth";
interface IChatMenuProps { };
interface IDialogProps {
    chat:IChat
};

const Dialog: FC<IDialogProps> = (props) => {
    let navigate = useNavigate();
    const [timeSent,setTimeSent]=useState<string>("");
    const userState=useUserState();

    async function init(){
        const user=await db.users.where("nickname").equals(userState.userLoggedIn.current).first();
        if(!user)
            return;
        const lastMessage=await db.storyMessages.where("chatId").equals(props.chat.id).last();
        setTimeSent(formatTime(lastMessage?.timeSent??new Date()));
    }

    async function onClick(){
        await db.chats.where("id").equals(props.chat.id).modify({isRead:true});//that's irreversible btw 
        navigate(`/chat/${props.chat.id}`)
    }

    useEffect(()=>{
        init();
    },[]);

    const lastMessage=props.chat.pregenMessages[props.chat.pregenMessages.length-1];

    return (
        <div onClick={onClick} id={props.chat.id} className={styles.dialog}>
            <img src={getImageUrl(props.chat.imageName)} alt="" className={styles.pfp} />
            <div className={styles.info}>
                <h3 className={styles.nickname}>{props.chat.name}</h3>
                <div className={styles.lastMessageDiv}>
                    {props.chat.isRead ? "" : <Dot className={styles.dot} />}
                    <p className={`${styles.lastMessage} ${props.chat.isRead ? styles.read : ""}`}><span className={styles.from}>{lastMessage.from}: </span>{lastMessage.content}</p>
                </div>
            </div>
            <span className={`${styles.timeSent} ${props.chat.isRead ? styles.read : ""}`}>{timeSent}</span>
        </div>
    );
}


export const ChatMenu: FC<IChatMenuProps> = () => {
    const storyInit = useStoryInit();
    const [chats, setChats] = useState<IChat[]>([]);
    const userState = useUserState();
    let navigate = useNavigate();

    async function init() {
        if (!userState.isRealLoggedIn.current || userState.userLoggedIn.current === "") {
            navigate("/")
            return;
        }
        setChats(await db.chats.where("owner").equals(userState.userLoggedIn.current).toArray());
    }


    useEffect(() => {
        storyInit(1, [], init);
    }, [])

    return (
        <div className={styles.container}>
            <div className={styles.headerContainer}>
                <h1 className={styles.header}>Chats</h1>
            </div>
            <div className={styles.dialogsContainer}>
                {chats.map((chat) => (
                    <Dialog key={chat.id} chat={chat} />
                ))}
            </div>
        </div>
    );
}

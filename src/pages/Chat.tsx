import { useEffect, useRef, useState, type FC, type ReactNode } from "react";
import { Dot, Reply, SendIcon } from "../components/Icons";
import { formatDate, getImageUrl } from "../utils";
import { InputField, type InputFieldHandle } from "../components/InputField";
import { BaseButton } from "../components/BaseButton";
import styles from "../scss/chat.module.scss";
import buttonStyles from "../scss/baseButton.module.scss";
import gsap from 'gsap';
import { useGSAP } from "@gsap/react";
import { BackButton } from "../components/BackButton";
import { Spinner } from "../components/Spinner";
import { useStory, useStoryInit } from "../providers/StoryProvider";
import { Divider } from "../components/Divider";
import { db, type IChat, type IMessage } from "../backend/db";
import { useUserState } from "../providers/UserAuth";
import { useNavigate, useParams } from "react-router";

interface IChatProps { };
interface IMessageProps {
    initChatTime: Date
    message: IMessage;
    replyTo?: {
        from: string;
        content: string;
    }
};
interface ITextingIndicatorProps {
    names: string[];
};

const TypingIndicator: FC<ITextingIndicatorProps> = (props) => {
    const indicatorRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        const icons: Element[] = gsap.utils.toArray(`.${styles.indicatorIcon}`);
        const tl = gsap.timeline({
            repeat: -1,
            repeatDelay: 0.3,
        })
            .set("[data-istransition='true']", {
                transition: "none"
            });

        icons.forEach((icon, index) => {
            tl
                .to(icon, {
                    scale: 1.5,
                    duration: 0.2,
                }, index === 0 ? "+=0" : "-=0.3")
                .to(icon, {
                    scale: 1,
                    duration: 0.2,
                });
        });

        tl.set("[data-istransition='true']", {
            clearProps: "transition"
        });
    }, [indicatorRef]);

    let names = `${props.names.join(", ")} typing...`;
    if (props.names.length > 2)
        names = `${props.names.length} people typing...`;

    return (
        <div className={styles.indicatorDiv}>
            <div ref={indicatorRef} className={styles.indicator}>
                <Dot className={styles.indicatorIcon} />
                <Dot className={styles.indicatorIcon} />
                <Dot className={styles.indicatorIcon} />
            </div>
            <span className={styles.indicatorText}>{names}</span>
        </div>
    );
}


const Message: FC<IMessageProps> = (props) => {
    const userState = useUserState();

    const content: ReactNode = props.message.content.split(/(@[a-zA-Z0-9_]+)/g).map((part, index) =>
        part.startsWith("@") ? <span key={index} className={styles.ping}>{part}</span> : part
    );
    const replyContent: ReactNode = props.replyTo?.content.split(/(@[a-zA-Z0-9_]+)/g).map((part, index) =>
        part.startsWith("@") ? <span key={index} className={styles.ping}>{part}</span> : part
    );
    const isPinged = props.replyTo?.from == userState.userLoggedIn.current || props.message.content.includes(`@${userState.userLoggedIn.current}`);
    const initChatTime = new Date(props.initChatTime);
    initChatTime.setMinutes(initChatTime.getMinutes() + props.message.timeDiff);
    const timeSent = formatDate(initChatTime);

    return (
        <div className={`${styles.messageDiv} ${isPinged ? styles.pinged : ""}`}>
            <div className={styles.authorDiv}>
                <img src={getImageUrl("placeholder.png")} className={styles.authorPfp} />
                <span className={styles.authorName}>{props.message.from}</span>
                <span className={styles.messageTime}>{timeSent}</span>
            </div>
            {props.replyTo ?
                <div className={styles.replyDiv}>
                    <Reply className={styles.replyArrow} />
                    <div className={styles.replyMessageDiv}>
                        <div className={styles.replyAuthorDiv}>
                            <img src={getImageUrl("placeholder.png")} className={styles.replyAuthorPfp} />
                            <span className={styles.replyAuthorName}>{props.replyTo.from}</span>
                        </div>
                        <p className={styles.replyMessage}>{replyContent}</p>
                    </div>
                </div>
                : ""}
            <p className={styles.message}>{content}</p>
        </div>
    );
}

export const Chat: FC<IChatProps> = () => {
    const [messages, setMessages] = useState<IMessage[]>([]);
    const [typing, setTyping] = useState<Set<string>>(new Set());
    const [chat, setChat] = useState<IChat>();
    const [initChatTime, setInitChatTime] = useState<Date>(new Date());
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const storyInit = useStoryInit();
    const userState = useUserState();
    let navigate = useNavigate();
    const { chatId } = useParams<{ chatId: string }>();
    const inputRef=useRef<InputFieldHandle>(null);
    const story=useStory();
    const stringToType=useRef<string>("");

    useEffect(() => {
        chatContainerRef.current?.scrollTo({ behavior: "smooth", top: chatContainerRef.current.scrollHeight });
    }, [messages]);

    function onSendMessage(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        const message = data.get("message");
        console.log("Sent message: ", message);
        e.currentTarget.reset();
    }

    async function init() {
        if (!userState.isRealLoggedIn.current || userState.userLoggedIn.current === "") {
            navigate("/");
            return;
        }
        const chat = await db.chats.where("id").equals(chatId ?? "").first();
        if (!chat) {
            navigate("/404");
            return;
        }
        const user = await db.users.where("nickname").equals(userState.userLoggedIn.current).first();
        if (!user) {
            navigate("/");
            return;
        }
        setChat(chat);
        setMessages(chat.pregenMessages);
        const chatTime=user.createdAt;
        chatTime.setMinutes(chatTime.getMinutes()+chat.initTimeDiff);
        setInitChatTime(chatTime);
    }

    useEffect(() => {
        storyInit(2, [], init);
    }, [])

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <BackButton id="back-text" />
                <img src={getImageUrl("placeholder.png")} className={styles.pfp} />
                <div className={styles.chatDiv}>
                    <p className={styles.nickname}>{chat?.name}</p>
                    {typing.length > 0 ? <TypingIndicator names={typing} /> : <span className={styles.membersCount}>{chat?.membersAmount} members</span>}
                </div>
            </div>
            <div ref={chatContainerRef} className={styles.chatContainer}>
                <Spinner />
                {messages.map((msg, index) => (
                    <Message key={index} message={msg} replyTo={msg.isReply?messages.find((v)=>v.id==msg.isReply):undefined} initChatTime={initChatTime} />
                ))}
                <Divider>3 February, 2026</Divider>
            </div>
            <form onSubmit={onSendMessage} className={styles.inputContainer}>
                <InputField ref={inputRef} scripted id="chat-input" name="message" placeholder="Message" className={styles.input} type={"text"} />
                <BaseButton type="submit" className={`${buttonStyles.primaryButton} ${styles.sendButton}`} icon={<SendIcon />} />
            </form>
        </div>
    );
}

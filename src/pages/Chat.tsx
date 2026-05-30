import { useEffect, useRef, useState, type FC, type ReactNode } from "react";
import { Dot, Reply, SendIcon } from "../components/Icons";
import { formatDay, formatTime, getImageUrl } from "../utils";
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
import { type ITypingTextBoxHandle, TypingTextBox } from "../components/TypingTextBox";

interface IChatProps { };
interface IMessageProps {
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
        <div className={`${styles.indicatorDiv} ${props.names.length > 0 ? styles.active : styles.disabled}`}>
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
    const [fromImage, setFromImage] = useState<string | undefined>(undefined)
    const [replyImage, setReplyImage] = useState<string | undefined>(undefined)
    let navigate = useNavigate();

    const content: ReactNode = props.message.content.split(/(@[a-zA-Z0-9_]+)/g).map((part, index) =>
        part.startsWith("@") ? <span key={index} className={styles.ping}>{part}</span> : part
    );
    const replyContent: ReactNode = props.replyTo?.content.split(/(@[a-zA-Z0-9_]+)/g).map((part, index) =>
        part.startsWith("@") ? <span key={index} className={styles.ping}>{part}</span> : part
    );
    const isPinged = props.replyTo?.from == userState.userLoggedIn.current || props.message.content.includes(`@${userState.userLoggedIn.current}`);
    const timeSent = formatTime(props.message.timeSent);

    async function init() {
        let user = await db.users.where("nickname").equals(props.message.from).first();
        setFromImage(user?.imageName);
        if (props.replyTo) {
            let user = await db.users.where("nickname").equals(props.replyTo.from).first();
            setReplyImage(user?.imageName);
        }
    }

    useEffect(() => {
        init();
    }, [])

    function onReplyClick() {
        if (!props.message.isReply)
            return;
        const el = document.getElementById(props.message.isReply?.toString())
        el?.classList.remove(styles.messagePulse);
        requestAnimationFrame(() => el?.classList.add(styles.messagePulse))
        el?.scrollIntoView({
            behavior: "smooth",
            block: "center",
            inline: "nearest"
        })
    }

    return (
        <div id={props.message.id.toString()} className={`${styles.messageDiv} ${isPinged ? styles.pinged : ""}`}>
            <div className={styles.authorDiv}>
                <img onClick={() => navigate(`/user/${props.message.from}`)} src={getImageUrl(fromImage ?? "placeholder.png")} className={styles.authorPfp} />
                <span onClick={() => navigate(`/user/${props.message.from}`)} className={styles.authorName}>{props.message.from}</span>
                <span className={styles.messageTime}>{timeSent}</span>
            </div>
            {props.replyTo ?
                <div onClick={onReplyClick} className={styles.replyDiv}>
                    <Reply className={styles.replyArrow} />
                    <div className={styles.replyMessageDiv}>
                        <div className={styles.replyAuthorDiv}>
                            <img src={getImageUrl(replyImage ?? "placeholder.png")} className={styles.replyAuthorPfp} />
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
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const storyInit = useStoryInit();
    const userState = useUserState();
    let navigate = useNavigate();
    const { chatId } = useParams<{ chatId: string }>();
    const inputRef = useRef<InputFieldHandle>(null);
    const story = useStory();
    const textBox = useRef<ITypingTextBoxHandle>(null);

    useEffect(() => {
        chatContainerRef.current?.scrollTo({ behavior: "smooth", top: chatContainerRef.current.scrollHeight });
    }, [messages]);

    async function onSendMessage(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!inputRef.current || !inputRef.current.isStringTyped())
            return;
        const data = new FormData(e.currentTarget);
        const message = data.get("message");
        e.currentTarget.reset();
        inputRef.current.setStringToType("");
        await story.addMessageFromUser(message as string);
        story.resumeStoryFromHint("chat-send");
    }

    function onInputChange() {
        if (!inputRef.current || !inputRef.current.isStringTyped())
            story.goBackHint("chat-send");
        else
            story.goForwardHint("chat-input")
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
        const msgs = await db.storyMessages.where("chatId").equals(chat.id).toArray();
        setMessages(msgs);
        await story.setChatHandle({
            setStringToType: function (string: string): void {
                inputRef.current?.setStringToType(string);
            },
            addTypingUser: function (username: string): void {
                setTyping(prev => new Set(prev).add(username));
            },
            removeTypingUser: function (username: string): void {
                setTyping(prev => {
                    const res = new Set(prev);
                    res.delete(username);
                    return res;
                });
            },
            addMessage: function (message: IMessage): void {
                setMessages(prev => [...prev, message]);
            },
            getMessage(id) {
                return messages.find(m => m.id == id);
            },
            getId() {
                return chatId ?? "";
            },
        });
    }

    useEffect(() => {
        storyInit(2, [textBox], init);
        return ()=>{
            story.setChatHandle(undefined);
        }
    }, [])

    const typingArray = Array.from(typing);

    return (
        <>
            <TypingTextBox ref={textBox} type={"terminal"} />
            <div className={styles.container}>
                <div className={styles.header}>
                    <BackButton id="back-text" />
                    <img src={getImageUrl("placeholder.png")} className={styles.pfp} />
                    <div className={styles.chatDiv}>
                        <p className={styles.nickname}>{chat?.name}</p>
                        <span className={styles.membersCount}>{chat?.membersAmount} members</span>
                    </div>
                </div>
                <div ref={chatContainerRef} className={styles.chatContainer}>
                    <Spinner />
                    {messages.map((msg, index) => {
                        let message = <Message key={index} message={msg} replyTo={msg.isReply ? messages.find((v) => v.id == msg.isReply) : undefined} />;
                        if (index == 0)
                            return message;
                        const prevMsg = messages[index - 1];
                        if (msg.timeSent.getDay() != prevMsg.timeSent.getDay())
                            message = <><Divider key={"divider" + index}>{formatDay(msg.timeSent)}</Divider>{message}</>;
                        return message;
                    })}
                    <TypingIndicator names={typingArray} />
                </div>
                <form onSubmit={onSendMessage} className={styles.inputContainer}>
                    <InputField onChange={onInputChange} ref={inputRef} scripted id="chat-input" name="message" placeholder="Message" className={styles.input} type={"text"} />
                    <BaseButton type="submit" id="chat-send" className={`${buttonStyles.primaryButton} ${styles.sendButton}`} icon={<SendIcon />} />
                </form>
            </div>
        </>
    );
}

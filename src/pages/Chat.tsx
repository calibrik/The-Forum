import { useRef, type FC, type ReactNode } from "react";
import { ArrowLeft, Dot, Reply, SendIcon } from "../components/Icons";
import { getImageUrl } from "../utils";
import { InputField } from "../components/InputField";
import { BaseButton } from "../components/BaseButton";
import styles from "../scss/chat.module.scss";
import buttonStyles from "../scss/baseButton.module.scss";
import { Divider } from "../components/Divider";
import gsap from 'gsap';
import { useGSAP } from "@gsap/react";

interface IChatMessage {
    author: string;
    content: string;
    time: Date;
    replyTo?: {
        author: string;
        content: string;
    }
}
interface IChatProps { };
interface IMessageProps {
    isPinged?: boolean;
    message: IChatMessage;
};
interface ITextingIndicatorProps {
    names: string[];
};

export const TypingIndicator: FC<ITextingIndicatorProps> = (props) => {
    const indicatorRef = useRef<HTMLDivElement>(null);
    useGSAP(() => {
        const icons:Element[] = gsap.utils.toArray(`.${styles.indicatorIcon}`);
        const tl = gsap.timeline({
            repeat: -1,
        })
            .set("[data-istransition='true']", {
                transition: "none"
            });

        icons.forEach((icon,index) => {
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

    if (props.names.length === 0)
        return null;
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
    const content: ReactNode = props.message.content.split(/(@[a-zA-Z0-9_]+)/g).map((part, index) =>
        part.startsWith("@") ? <span key={index} className={styles.ping}>{part}</span> : part
    );
    const replyContent: ReactNode = props.message.replyTo?.content.split(/(@[a-zA-Z0-9_]+)/g).map((part, index) =>
        part.startsWith("@") ? <span key={index} className={styles.ping}>{part}</span> : part
    );

    return (
        <div className={`${styles.messageDiv} ${props.isPinged ? styles.pinged : ""}`}>
            <div className={styles.authorDiv}>
                <img src={getImageUrl("placeholder")} className={styles.authorPfp} />
                <span className={styles.authorName}>{props.message.author}</span>
                <span className={styles.messageTime}>{new Intl.DateTimeFormat('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                }).format(props.message.time).toLowerCase()}</span>
            </div>
            {props.message.replyTo ?
                <div className={styles.replyDiv}>
                    <Reply className={styles.replyArrow} />
                    <div className={styles.replyMessageDiv}>
                        <div className={styles.replyAuthorDiv}>
                            <img src={getImageUrl("placeholder")} className={styles.replyAuthorPfp} />
                            <span className={styles.replyAuthorName}>{props.message.replyTo.author}</span>
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
    const messages: IChatMessage[] = [
        { author: "player1", content: "Just got to Global Elite, CS2 hit different", time: new Date(2026, 1, 3, 14, 23) },
        { author: "noob_gamer", content: "Congrats @player1! How long did it take you?", time: new Date(2026, 1, 3, 14, 25) },
        { author: "player1", content: "About 800 hours total, but improved a lot recently", time: new Date(2026, 1, 3, 14, 27), replyTo: { author: "noob_gamer", content: "Congrats @player1! How long did it take you?" } },
        { author: "noob_gamer", content: "That's insane. Any tips for someone stuck in Silver?", time: new Date(2026, 1, 3, 14, 29), replyTo: { author: "player1", content: "About 800 hours total, but improved a lot recently" } },
        { author: "player1", content: "Focus on crosshair placement and spray control first", time: new Date(2026, 1, 3, 14, 31), replyTo: { author: "noob_gamer", content: "That's insane. Any tips for someone stuck in Silver?" } },
        { author: "pro_awper", content: "Don't forget utility usage, that's what separates tiers", time: new Date(2026, 1, 3, 14, 33), replyTo: { author: "player1", content: "Focus on crosshair placement and spray control first" } },
        { author: "noob_gamer", content: "Utility usage? I just run and gun lol", time: new Date(2026, 1, 3, 14, 35), replyTo: { author: "pro_awper", content: "Don't forget utility usage, that's what separates tiers" } },
        { author: "pro_awper", content: "Yeah that's why you're stuck haha. Learn smokes and flashes", time: new Date(2026, 1, 3, 14, 37), replyTo: { author: "noob_gamer", content: "Utility usage? I just run and gun lol" } },
        { author: "player1", content: "The new 128 tick servers in CS2 feel so smooth", time: new Date(2026, 1, 3, 14, 39) },
        { author: "pro_awper", content: "True, but my PC can barely handle it", time: new Date(2026, 1, 3, 14, 41), replyTo: { author: "player1", content: "The new 128 tick servers in CS2 feel so smooth" } },
        { author: "noob_gamer", content: "What's your setup?", time: new Date(2026, 1, 3, 14, 43), replyTo: { author: "pro_awper", content: "True, but my PC can barely handle it" } },
        { author: "pro_awper", content: "RTX 4080, i9-13900K, 360hz monitor", time: new Date(2026, 1, 3, 14, 45), replyTo: { author: "noob_gamer", content: "What's your setup?" } },
        { author: "player1", content: "Overkill but I respect it", time: new Date(2026, 1, 3, 14, 47), replyTo: { author: "pro_awper", content: "RTX 4080, i9-13900K, 360hz monitor" } },
        { author: "noob_gamer", content: "Anyone playing the new map tomorrow?", time: new Date(2026, 1, 3, 14, 49) },
        { author: "pro_awper", content: "I'm down, let's stack a team", time: new Date(2026, 1, 3, 14, 51), replyTo: { author: "noob_gamer", content: "Anyone playing the new map tomorrow?" } }
    ];

    function onSendMessage(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        const message = data.get("message");
        console.log("Sent message: ", message);
        e.currentTarget.reset();
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <ArrowLeft interactive className={styles.arrow} />
                <img src={getImageUrl("placeholder")} className={styles.pfp} />
                <div className={styles.chatDiv}>
                    <p className={styles.nickname}>Chat Name</p>
                    <TypingIndicator names={["noob_gamer", "player1"]} />
                </div>
            </div>
            <div className={styles.chatContainer}>
                {messages.map((msg, index) => (
                    <Message key={index} message={msg} isPinged={msg.replyTo?.author == "noob_gamer"} />
                ))}
                <Divider>3 February, 2026</Divider>
            </div>
            <form onSubmit={onSendMessage} className={styles.inputContainer}>
                <InputField name="message" placeholder="Message" className={styles.input} type={"text"} />
                <BaseButton type="submit" className={`${buttonStyles.primaryButton} ${styles.sendButton}`} icon={<SendIcon />} />
            </form>
        </div>
    );
}

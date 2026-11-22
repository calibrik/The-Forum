import { useRef } from "react";
import { db, type IChat, type IMessage } from "../misc/db";
import { delay } from "../misc/utils";
import { useUserState } from "../providers/UserAuth";

export interface IChatHandle {
    setStringToType: (string: string) => void;
    addTypingUser: (username: string) => void;
    removeTypingUser: (username: string) => void;
    addMessage: (message: IMessage) => void;
    getMessage: (id: number) => IMessage | undefined
    getId: () => string
}

export function useChat() {
    const chatHandle = useRef<IChatHandle>(undefined);
    const userState = useUserState();
    const lastId = useRef<number>(0);

    async function addChat(id: string, owner: string[], type: IChat["type"]) {
        const chat: IChat = {
            id: id,
            owner: owner,
            type: type,
            pregenMessages: [],
            isRead: true,
            initTimeDiff: 0,
        }
        await db.chatsBuffer.put(chat);
    }

    async function addMessageFromUser(content: string) {
        const message: IMessage = {
            id: lastId.current++,
            from: userState.userLoggedIn.current,
            content: content,
            timeSent: new Date(),
            chatId: chatHandle.current?.getId() ?? ""
        }
        await db.storyMessagesBuffer.put(message);
        chatHandle.current?.addMessage(message);
    }

    async function addMessageFromNPC(from: string, content: string, timeToType?: number, isReplyDiff?: number) {
        const message: IMessage = {
            id: lastId.current++,
            from: from,
            content: content,
            chatId: chatHandle.current?.getId() ?? "",
            timeSent: new Date()
        }
        message.isReply = isReplyDiff ? message.id + isReplyDiff : undefined;
        chatHandle.current?.addTypingUser(message.from);
        if (timeToType)
            await delay(timeToType);
        message.timeSent = new Date();
        await db.storyMessagesBuffer.put(message);
        chatHandle.current?.removeTypingUser(message.from);
        chatHandle.current?.addMessage(message);
    }

    async function addMessagesToDb(msgs: IMessage[]) {
        await db.storyMessages.bulkAdd(msgs);
    }

    async function setChatHandle(ch?: IChatHandle) {
        chatHandle.current = ch;
        lastId.current = await db.storyMessages.count() + await db.storyMessagesBuffer.count() + 1;
    }

    async function getMessages(chatId: string) {
        const messages = await db.storyMessages.where("chatId").equals(chatId).toArray();
        const bufferedMessages = await db.storyMessagesBuffer.where("chatId").equals(chatId).toArray();
        return [...messages, ...bufferedMessages];
    }

    function promptMessage(content: string) {
        chatHandle.current?.setStringToType(content);
    }

    return { addMessageFromNPC, addMessageFromUser, addChat, setChatHandle, addMessagesToDb, getMessages, promptMessage }
}

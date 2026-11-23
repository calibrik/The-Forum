import { useRef } from "react";
import { db, type IChat, type IMessage } from "../misc/db";
import { delay } from "../misc/utils";

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
    const pendingPlayerMessage = useRef<number>(undefined);

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

    async function addMessageFromUser() {
        const messageRef = pendingPlayerMessage.current;
        if (messageRef == undefined)
            return;
        pendingPlayerMessage.current = undefined;
        const template = await db.messages.get(messageRef);
        if (!template) {
            console.error(`No message with id ${messageRef}.`);
            return;
        }
        const message: IMessage = { ...template, timeSent: new Date(), isVisible: true };
        await db.messagesBuffer.put(message);
        chatHandle.current?.addMessage(message);
    }

    async function addMessageFromNPC(messageRef: number, timeToType?: number) {
        const template = await db.messages.get(messageRef);
        if (!template) {
            console.error(`No message with id ${messageRef}.`);
            return;
        }
        chatHandle.current?.addTypingUser(template.from);
        if (timeToType)
            await delay(timeToType);
        const message: IMessage = { ...template, timeSent: new Date(), isVisible: true };
        await db.messagesBuffer.put(message);
        chatHandle.current?.removeTypingUser(template.from);
        chatHandle.current?.addMessage(message);
    }

    async function setChatHandle(ch?: IChatHandle) {
        chatHandle.current = ch;
        if (!ch)
            pendingPlayerMessage.current = undefined;
    }

    async function getMessages(chatId: string) {
        const messages = await db.messages.where("chatId").equals(chatId).toArray();
        const bufferedMessages = await db.messagesBuffer.where("chatId").equals(chatId).toArray();
        const merged = new Map<number, IMessage>();
        for (const message of messages) {
            if (message.isVisible)
                merged.set(message.id, message);
        }
        for (const message of bufferedMessages)
            merged.set(message.id, message);
        return Array.from(merged.values()).sort((a, b) => a.id - b.id);
    }

    async function promptMessage(messageRef: number) {
        const message = await db.messages.get(messageRef);
        if (!message) {
            console.error(`No message with id ${messageRef}.`);
            return;
        }
        chatHandle.current?.setStringToType(message.isLink ? window.location.origin + message.content : message.content);
        pendingPlayerMessage.current = messageRef;
    }

    return { addMessageFromNPC, addMessageFromUser, addChat, setChatHandle, getMessages, promptMessage }
}

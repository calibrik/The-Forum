import { Dexie, type EntityTable } from "dexie"
import type { RefObject } from "react";
import { getJsonUrl, seededRandom } from "./utils";
import type { ITypingTextBoxHandle, TTypingSpeed } from "../components/TypingTextBox";
import type { TLocale } from "./locales";

export interface IStoryLine {
	content: string,
	speed: TTypingSpeed,
	delim?: string,
	typingBoxId: string,
	style?: React.CSSProperties
	clearAfter?: string
	hideCursorAfter?: boolean
	clearBefore?: boolean
}

export interface IEffectsOptions {
	typingBoxes?: RefObject<Map<string, ITypingTextBoxHandle>>,
	duration?: number,
	opacity?: number
	backgroundColor?: string
	overlayNumber?: string[]
	fromOpacity?: number,
	blurPx?: number
	zIndex?: number
	persistOverNavigation?: boolean
}

export interface IEffect {
	name: string,
	options?: IEffectsOptions
}

export interface IMessage {
	id: number,
	from: string,
	content: string,
	isReply?: number,//id of message to which reply
	timeSent: Date
	chatId: string,
	isVisible?: boolean,
	isLink?: boolean
}

export interface IPregenMessage {
	messageRef: number,
	timeDiff: number//time diff to init time diff in mins
}

export interface IChat {
	id: string,
	imageName?: string,
	owner: string[],
	type: "gc" | "dm",
	membersAmount?: number,
	name?: string,
	pregenMessages: IPregenMessage[],
	isRead: boolean,
	initTimeDiff: number,//time diff to sign up time, in mins
}

export interface ISubforum {
	id: number,
	name: string,
	followers: number,
	description: string,
	imageName: string,
	admin: string,
	mods: string[],
	members: string[],
}

export interface IComment {
	author: string,
	content: string,
	likes: number
}

export interface IPost {
	id: string,
	author: string,
	subforum: string,
	title: string,
	content: string,
	imageName?: string
	likes: number
	comments: number
	views: number,
	commentsDetailed: IComment[],
	dateCreated: Date,
	isVisible?: boolean
}

export interface IAddPostsAction {
	postRefs: string[]
}

export interface IAddParallelExec {
	name: string
	branches: IScriptLine[][]
}

export interface INavigateAction {
	dest: IDestination
	navigate: boolean
}

export interface ISaveAction {
	dest: IDestination
	// hintActionPos?: number
	lastNavPos?: number
}

export type IShowPlaceholderField = "nickname" | "password";

export interface ISetShowPlaceholdersAction {
	field: IShowPlaceholderField,
	show: boolean,
}

export interface ISetModsToRemoveAction {
	subforum: string,
}

export interface ISetTransferToAction {
	subforum: string,
	user: string,
}

export interface IHintAction {
	ids: string[],
}

export interface IPromptMessage {
	messageRef: number
}

export interface ISendMessageAction {
	messageRef: number,
	timeToType: number
}

export interface IAddNewChatAction {
	id: string,
	owner: string[],
	type: "gc" | "dm",
}

export interface IAddPasswordForAction {
	nickname: string,
	password: string,
}

export interface IBanUserAction {
	nickname: string,
}

export interface ISetTerminalCommandAction {
	command: string,
	output?: string,
}

export interface IVimTypeAction {
	content: string,
}

export interface ISetTypingBoxContentAction {
	content: string,
	typingBoxId: string,
}

export interface IHistoryEntry {
	type: "cmd" | "out",
	text: string,
}

export interface IAddTerminalHistoryAction {
	history: IHistoryEntry[],
}

export interface ISetPromptVisibilityAction {
	visible: boolean,
}

export interface IDeleteTextFromTypingBoxAction {
	symbolsCount: number,
	speed: number,
	typingBoxId: string,
}

export interface IClearTypingTextBoxes {
	ids: string[]
}

export interface IAction {
	navigateAction?: INavigateAction,
	saveAction?: ISaveAction
	hintAction?: IHintAction
	sendMessageAction?: ISendMessageAction,
	promptMessageAction?: IPromptMessage,
	addNewChat?: IAddNewChatAction,
	addPosts?: IAddPostsAction,
	addPasswordFor?: IAddPasswordForAction,
	banUser?: IBanUserAction,
	setShowPlaceholdersAction?: ISetShowPlaceholdersAction,
	setModsToRemove?: ISetModsToRemoveAction,
	setTransferTo?: ISetTransferToAction,
	setTerminalCommandAction?: ISetTerminalCommandAction,
	vimTypeAction?: IVimTypeAction,
	setTypingBoxContentAction?: ISetTypingBoxContentAction,
	addTerminalHistoryAction?: IAddTerminalHistoryAction,
	setPromptVisibilityAction?: ISetPromptVisibilityAction,
}

export interface IScriptLine {
	id: number,
	storyline?: IStoryLine,
	effect?: IEffect,
	action?: IAction,
	addParallelExec?: IAddParallelExec
	clearTypingTextBoxes?: IClearTypingTextBoxes
	deleteTextFromTypingBox?: IDeleteTextFromTypingBoxAction
	hint?: string,//what the player is expected to do while the story waits on this scriptline (isActionAwait)
	isActionAwait?: boolean,
	offset: string,
}

export interface IUser {
	id: number,
	nickname: string,
	password?: string,
	savedStoryId?: number
	description?: string
	imageName?: string
	isBanned?: boolean
}

export interface IDestination {
	where: string
	level: number //i.e. 1 means match at least /user, 2 means match /user/comments etc.
	user: string //nickname of the user that is expected to be logged in at this destination
	from?: IDestination
}

function withLastNavPos(script: IScriptLine[]): IScriptLine[] {
	let lastNavActionId: number | undefined = undefined;
	return script.map((v, i) => {
		const id = i + 1;
		const scl = { ...v, id };
		if (scl.action?.navigateAction)
			lastNavActionId = id;
		if (scl.action?.saveAction && lastNavActionId != undefined)
			return { ...scl, action: { ...scl.action, saveAction: { ...scl.action.saveAction, lastNavPos: lastNavActionId - id } } };
		return scl;
	});
}

export type IBufferItem<T> = T & {
	isPreserved?: boolean
}

const db = new Dexie("TheForumDB") as Dexie & {
	subforums: EntityTable<ISubforum, "id">
	story: EntityTable<IScriptLine, "id">
	users: EntityTable<IUser, "id"> //doesn't store user nickname with #
	posts: EntityTable<IPost, "id">
	chats: EntityTable<IChat, "id">
	messages: EntityTable<IMessage, "id"> //doesn't store user nickname with #
	postsBuffer: EntityTable<IBufferItem<IPost>, "id">
	chatsBuffer: EntityTable<IBufferItem<IChat>, "id">
	usersBuffer: EntityTable<IBufferItem<IUser>, "id">
	messagesBuffer: EntityTable<IBufferItem<IMessage>, "id">
	subforumsBuffer: EntityTable<IBufferItem<ISubforum>, "id">
}

db.version(274).stores({
	posts: "id, author, subforum",
	story: "++id",
	users: "++id, nickname, savedStoryId",
	subforums: "++id, name",
	chats: "id, *owner",
	messages: "id,chatId",
	postsBuffer: "id, author, subforum",
	chatsBuffer: "id, *owner",
	usersBuffer: "++id, nickname, savedStoryId",
	messagesBuffer: "id,chatId",
	subforumsBuffer: "++id, name"
}).upgrade(async () => {
	console.log("Upgrading database to new version");
	if (process.env.NODE_ENV == 'test')
		return;
	await Promise.all(db.tables.map((table) => table.clear()));
	await seedUsers();
})

type IMessageSeed = Omit<IMessage, "timeSent" | "isVisible">;

async function fetchSeed<T>(name: string, locale: TLocale, nickname?: string) {
	const response = await fetch(getJsonUrl(name, locale));
	const json = JSON.stringify(await response.json());
	return JSON.parse(nickname == undefined ? json : json.replace(/#main_hero/g, nickname)) as T;
}

function mapUsers(users: IUser[]): IUser[] {
	let seed = 3;
	return users.map((v, i) => ({ ...v, id: i + 1, imageName: v.imageName ?? `pfp${Math.floor(seededRandom(seed++) * 9.9)}.png` }));
}

export async function seedUsers() {
	await db.users.clear();
	await db.users.bulkAdd(mapUsers(await fetchSeed<IUser[]>("users.json", "en")));
}

export function mapPosts(posts: IPost[], startNumber = 1): IPost[] {
	const now = Date.now();
	let n = startNumber;
	return posts.map((v, i) => ({ ...v, id: v.id ?? `p${n++}`, isVisible: v.isVisible ?? true, dateCreated: new Date(now - i) }));
}

export async function seedTables(nickname: string, locale: TLocale) {
	await db.story.clear();
	await db.story.bulkAdd(withLastNavPos(await fetchSeed<IScriptLine[]>("script.json", locale, nickname)));
	await db.users.clear();
	await db.users.bulkAdd(mapUsers(await fetchSeed<IUser[]>("users.json", locale, nickname)));
	await db.posts.clear();
	await db.posts.bulkAdd(mapPosts(await fetchSeed<IPost[]>("posts.json", locale, nickname)));
	await db.subforums.clear();
	await db.subforums.bulkAdd((await fetchSeed<ISubforum[]>("subforums.json", locale, nickname)).map((v, i) => ({ ...v, id: i + 1 })));
	await db.chats.clear();
	await db.chats.bulkAdd(await fetchSeed<IChat[]>("chats.json", locale, nickname));
	await db.messages.clear();
	const messages = await fetchSeed<IMessageSeed[]>("messages.json", locale, nickname);
	await db.messages.bulkAdd(messages.map((m) => ({ ...m, timeSent: new Date(0), isVisible: false })));
}

export async function retranslateTables(locale: TLocale, nickname: string) {
	const [script, users, posts, subforums, chats, messages] = await Promise.all([
		fetchSeed<IScriptLine[]>("script.json", locale, nickname),
		fetchSeed<IUser[]>("users.json", locale, nickname),
		fetchSeed<IPost[]>("posts.json", locale, nickname),
		fetchSeed<ISubforum[]>("subforums.json", locale, nickname),
		fetchSeed<IChat[]>("chats.json", locale, nickname),
		fetchSeed<IMessageSeed[]>("messages.json", locale, nickname),
	]);
	const usersById = new Map(users.map((u, i) => [i + 1, u.description]));
	const postsById = new Map(mapPosts(posts).map((p) => [p.id, p]));
	const subforumsById = new Map(subforums.map((s, i) => [i + 1, s.description]));
	const chatsById = new Map(chats.map((c) => [c.id, c.name]));
	const messagesById = new Map(messages.map((m) => [m.id, m]));

	await db.story.clear();
	await db.story.bulkAdd(withLastNavPos(script));
	const updateUsers = (u: IUser) => {
		const description = usersById.get(u.id);
		if (description != undefined)
			u.description = description;
	};
	await db.users.toCollection().modify(updateUsers);
	await db.usersBuffer.toCollection().modify(updateUsers);
	const updatePosts = (p: IPost) => {
		const translated = postsById.get(p.id);
		if (!translated)
			return;
		p.title = translated.title;
		p.content = translated.content;
		p.commentsDetailed = translated.commentsDetailed;
	};
	await db.posts.toCollection().modify(updatePosts);
	await db.postsBuffer.toCollection().modify(updatePosts);
	const updateSubforums = (s: ISubforum) => {
		const description = subforumsById.get(s.id);
		if (description != undefined)
			s.description = description;
	};
	await db.subforums.toCollection().modify(updateSubforums);
	await db.subforumsBuffer.toCollection().modify(updateSubforums);
	const updateChats = (c: IChat) => {
		const name = chatsById.get(c.id);
		if (name != undefined)
			c.name = name;
	};
	await db.chats.toCollection().modify(updateChats);
	await db.chatsBuffer.toCollection().modify(updateChats);
	const updateMessages = (m: IMessage) => {
		const translated = messagesById.get(m.id);
		if (!translated)
			return;
		m.content = translated.content;
		// if (translated.isLink != undefined)
		// 	m.isLink = translated.isLink;
	};
	await db.messages.toCollection().modify(updateMessages);
	await db.messagesBuffer.toCollection().modify(updateMessages);
}

db.on("populate", async () => {
	if (process.env.NODE_ENV == 'test')
		return;
	await seedUsers();
})

await db.open()

export { db }

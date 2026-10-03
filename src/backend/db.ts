import { Dexie, type EntityTable } from "dexie"
import { getJsonUrl, seededRandom } from "../utils";
import type { IEffectsOptions } from "../providers/StoryProvider";

export interface IStoryLine {
	content: string,
	speed: number,
	delim?: string,
	typingBoxId: string,
	clearAfter?: string
	hideCursorAfter?: boolean
	clearBefore?: boolean
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
	chatId: string
}

export interface IPregenMessage {
	id: number,
	from: string,
	content: string,
	timeDiff: number//time diff to init time diff in mins
	isReply?: number,//relative pos of the reply to message
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

export interface IComment{
	author: string,
	content: string,
	likes:number
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
	commentsDetailed:IComment[]
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

export interface ISetTextBoxStyleAction {
	id: string,
	style: React.CSSProperties
}

export type IShowPlaceholderField = "nickname" | "password";

export interface ISetShowPlaceholdersAction {
	field: IShowPlaceholderField,
	show: boolean,
}

export interface IHintAction {
	ids: string[],
}

export interface IPromptMessage {
	content: string,
	isLink?:boolean
}

export interface ISendMessageAction {
	from: string,
	content: string,
	isReplyDiff?: number,//relative id of the message
	timeToType: number
}

export interface IAddNewChatAction {
	id: string,
	owner: string[],
	type: "gc" | "dm",
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
	setTextBoxStyleAction?: ISetTextBoxStyleAction
	hintAction?: IHintAction
	sendMessageAction?: ISendMessageAction,
	promptMessageAction?: IPromptMessage,
	addNewChat?: IAddNewChatAction,
	setShowPlaceholdersAction?: ISetShowPlaceholdersAction,
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
}

export interface IDestination {
	where: string
	level: number //i.e. 1 means match at least /user, 2 means match /user/comments etc.
	from?:IDestination
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

const db = new Dexie("TheForumDB") as Dexie & {
	subforums: EntityTable<ISubforum, "id">
	story: EntityTable<IScriptLine, "id">
	users: EntityTable<IUser, "id"> //doesn't store user nickname with #
	posts: EntityTable<IPost, "id">
	chats: EntityTable<IChat, "id">
	storyMessages: EntityTable<IMessage, "id"> //doesn't store user nickname with #
	postsBuffer: EntityTable<IPost, "id">
	chatsBuffer: EntityTable<IChat, "id">
	usersBuffer: EntityTable<IUser, "id">
	storyMessagesBuffer: EntityTable<IMessage, "id">
}

db.version(222).stores({
	posts: "id, author, subforum",
	story: "++id",
	users: "++id, nickname, savedStoryId",
	subforums: "++id, name",
	chats: "id, *owner",
	storyMessages: "id,chatId",
	postsBuffer: "id, author, subforum",
	chatsBuffer: "id, *owner",
	usersBuffer: "++id, nickname, savedStoryId",
	storyMessagesBuffer: "id,chatId"
}).upgrade(async () => {
	console.log("Upgrading database to new version");
	if (process.env.NODE_ENV == 'test')
		return;
	await Promise.all(db.tables.map((table) => table.clear()));
	await seedUsers();
})

async function fetchSeed<T>(name: string, nickname?: string) {
	const response = await fetch(getJsonUrl(name));
	const json = JSON.stringify(await response.json());
	return JSON.parse(nickname == undefined ? json : json.replace(/#main_hero/g, nickname)) as T;
}

function mapUsers(users: IUser[]): IUser[] {
	let seed = 0;
	return users.map((v, i) => ({ ...v, id: i + 1, imageName: v.imageName ?? `pfp${Math.floor(seededRandom(seed++) * 9.9)}.png` }));
}

export async function seedUsers() {
	await db.users.clear();
	await db.users.bulkAdd(mapUsers(await fetchSeed<IUser[]>("users.json")));
}

export async function seedTables(nickname: string) {
	await db.story.clear();
	await db.story.bulkAdd(withLastNavPos(await fetchSeed<IScriptLine[]>("script.json", nickname)));
	await db.users.clear();
	await db.users.bulkAdd(mapUsers(await fetchSeed<IUser[]>("users.json", nickname)));
	await db.posts.clear();
	await db.posts.bulkAdd((await fetchSeed<IPost[]>("posts.json", nickname)).map((v, i) => ({ ...v, id: v.id ?? `p${i + 1}` })));
	await db.subforums.clear();
	await db.subforums.bulkAdd((await fetchSeed<ISubforum[]>("subforums.json", nickname)).map((v, i) => ({ ...v, id: i + 1 })));
	await db.chats.clear();
	await db.chats.bulkAdd(await fetchSeed<IChat[]>("chats.json", nickname));
}

db.on("populate", async () => {
	if (process.env.NODE_ENV == 'test') 
		return;
	await seedUsers();
})

await db.open()

export { db }

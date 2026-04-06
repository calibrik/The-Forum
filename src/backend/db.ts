import { Dexie, type EntityTable } from "dexie"
import { getJsonUrl } from "../utils";

export interface IStoryLine {
	content: string,
	speed: number,
	delim?: string,
	typingBoxId: number,
	clearAfter?: string
}

export interface IEffect {
	name: string,
}

export interface IMessage {
	id: number,
	from: string,
	content: string,
	isReply?: number,
	timeDiff: number //time diff to initTimeDiff, in mins
	chatName?:string
}

export interface IChat {
	id: string,
	imageName:string,
	owner: string,
	type: "gc" | "dm",
	membersAmount: number,
	name: string,
	pregenMessages: IMessage[],
	isRead: boolean,
	initTimeDiff:number,//time diff to sign up time, in mins
}

export interface ISubforum {
	id: number,
	name: string,
	followers: number,
	description: string,
	imageName: string,
	admin: string,
	mods: string[]
}

export interface IPost {
	id: number,
	author: string,
	subforum: string,
	title: string,
	content: string,
	imageName?: string
	likes: number
	comments: number
	views: number
}

export interface IAction {
	name: string,
	dest?: IDestination
	navigate?: boolean
	storyId?: number
	id?: string | number//confusing as hell btw (string for hint id, number for index in typingBoxes)
	style?: React.CSSProperties
	message?:IMessage
	timeToType?:number
}

export interface IScriptLine {
	id: number,
	storyline?: IStoryLine,
	effect?: IEffect,
	action?: IAction,
	isActionAwait?: boolean,
	offset: string,
	dest?: IDestination,
	hintActionPos?: number
}

export interface IUser {
	id: number,
	nickname: string,
	password?: string,
	savedStoryId?: number
	description?: string
	imageName?: string,
	createdAt: Date
}

export interface IDestination {
	where: string
	level: number //i.e. 1 means match at least /user, 2 means match /user/comments etc.
}

const db = new Dexie("TheForumDB") as Dexie & {
	subforums: EntityTable<ISubforum, "id">
	story: EntityTable<IScriptLine, "id">
	users: EntityTable<IUser, "id">
	posts: EntityTable<IPost, "id">
	chats: EntityTable<IChat, "id">
	storyMessages: EntityTable<IMessage, "id">
}

db.version(89).stores({
	posts: "++id, author, subforum",
	story: "++id",
	users: "++id, nickname, savedStoryId",
	subforums: "++id, name",
	chats: "id, owner",
	storyMessages: "id,chatName"
}).upgrade(async () => {
	await db.story.clear();
	let response = await fetch(getJsonUrl("script.json"));
	const newScript: IScriptLine[] = (await response.json() as IScriptLine[]).map((v, i) => ({ ...v, id: i + 1 }));
	await db.story.bulkAdd(newScript);
	// const users = await tx.table("users").where("savedStoryId").aboveOrEqual(1).toArray() as IUser[];
	// if (users.length != 0) {
	// 	const lastSave = await tx.table("story")
	// 		.toCollection()
	// 		.reverse()
	// 		.filter(scl => scl.action?.name === "SAVE"&&scl.id<=(users[0].savedStoryId??0))
	// 		.first() as IScriptLine;
	// 	users[0].savedStoryId=lastSave.id;
	// }
	await db.users.clear();
	response = await fetch(getJsonUrl("users.json"));
	const newUsers: IUser[] = (await response.json() as IUser[]).map((v, i) => ({ ...v, id: i + 1 }));
	await db.users.bulkAdd(newUsers);
	// if (users.length != 0) {
	// 	await tx.table("users").where("savedStoryId").equals(0).modify(users[0]);
	// }
	await db.posts.clear();
	response = await fetch(getJsonUrl("posts.json"));
	const newPosts: IPost[] = (await response.json() as IPost[]).map((v, i) => ({ ...v, id: i + 1 }));
	await db.posts.bulkAdd(newPosts);

	await db.subforums.clear();
	response = await fetch(getJsonUrl("subforums.json"));
	const newSubforums: ISubforum[] = (await response.json() as ISubforum[]).map((v, i) => ({ ...v, id: i + 1 }));
	await db.subforums.bulkAdd(newSubforums);

	await db.chats.clear();
	response = await fetch(getJsonUrl("chats.json"));
	const newChats: IChat[] = (await response.json() as IChat[]);
	await db.chats.bulkAdd(newChats);

	await db.storyMessages.clear();
})

db.on("populate", async () => {
	let response = await fetch(getJsonUrl("script.json"));
	await db.story.bulkAdd(await response.json() as IScriptLine[]);
	response = await fetch(getJsonUrl("users.json"));
	await db.users.bulkAdd(await response.json() as IUser[]);
	response = await fetch(getJsonUrl("posts.json"));
	await db.posts.bulkAdd(await response.json() as IPost[]);
	response = await fetch(getJsonUrl("subforums.json"));
	await db.subforums.bulkAdd(await response.json() as ISubforum[]);
	response = await fetch(getJsonUrl("chats.json"));
	await db.chats.bulkAdd(await response.json() as IChat[]);
})

await db.open()

export { db }

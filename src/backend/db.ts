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

export interface IAction {
	name: string,
	dest?: IDestination
	storyId?: number
	id?: string | number
	style?: React.CSSProperties
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
	imageName?: string
}

export interface IDestination {
	where: string
	level: number //i.e. 1 means match at least /user, 2 means match /user/comments etc.
}

const db = new Dexie("TheForumDB") as Dexie & {
	story: EntityTable<IScriptLine, "id">
	users: EntityTable<IUser, "id">
}

db.version(62).stores({
	story: "++id",
	users: "++id, nickname,savedStoryId",
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
	const newUserst: IUser[] = (await response.json() as IUser[]).map((v, i) => ({ ...v, id: i + 1 }));
	await db.users.bulkAdd(newUserst);
	// if (users.length != 0) {
	// 	await tx.table("users").where("savedStoryId").equals(0).modify(users[0]);
	// }
})

db.on("populate", async () => {
	let response = await fetch(getJsonUrl("script.json"));
	await db.story.bulkAdd(await response.json() as IScriptLine[]);
	response = await fetch(getJsonUrl("users.json"));
	await db.users.bulkAdd(await response.json() as IUser[]);
})

export { db }

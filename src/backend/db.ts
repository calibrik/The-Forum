import { Dexie, type EntityTable } from "dexie"
import script from "../assets/jsons/script.json";
import users from "../assets/jsons/users.json";

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

db.version(61).stores({
	story: "++id",
	users: "++id, nickname,savedStoryId",
}).upgrade(async (tx) => {
	await tx.table("story").clear();
	const newScript: IScriptLine[] = (script as IScriptLine[]).map((v, i) => ({ ...v, id: i + 1 }));
	await tx.table("story").bulkAdd(newScript);
	// const users = await tx.table("users").where("savedStoryId").aboveOrEqual(1).toArray() as IUser[];
	// if (users.length != 0) {
	// 	const lastSave = await tx.table("story")
	// 		.toCollection()
	// 		.reverse()
	// 		.filter(scl => scl.action?.name === "SAVE"&&scl.id<=(users[0].savedStoryId??0))
	// 		.first() as IScriptLine;
	// 	users[0].savedStoryId=lastSave.id;
	// }
	await tx.table("users").clear();
	const newUserst: IUser[] = (users as IUser[]).map((v, i) => ({ ...v, id: i + 1 }));
	await tx.table("users").bulkAdd(newUserst);
	// if (users.length != 0) {
	// 	await tx.table("users").where("savedStoryId").equals(0).modify(users[0]);
	// }
})

db.on("populate", async (tx) => {
	await tx.table("story").bulkAdd(script as IScriptLine[]);
	await tx.table("users").bulkAdd(users as IUser[]);
})

export { db }

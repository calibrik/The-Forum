import { Dexie, type EntityTable } from "dexie"
import script from "../assets/jsons/script.json";
import users from "../assets/jsons/users.json";

export interface IStoryLine {
	content: string,
	speed: number,
	delim?: string,
	typingBoxId:number,
	cleanAfter?:string
}

export interface IEffect {
	name: string,
}

export interface IAction {
	name: string,
	dest?: string
	storyId?:number
}

export interface IScriptLine {
	id: number,
	storyline?: IStoryLine,
	effect?: IEffect,
	action?:IAction,
	isActionAwait?: boolean,
	offset: string,
	where?: string,
}

export interface IUser {
	id: number,
	nickname: string,
	password?: string,
	storyId?: number
}

const db = new Dexie("TheForumDB") as Dexie & {
	story: EntityTable<IScriptLine, "id">
	users: EntityTable<IUser, "id">
}

db.version(30).stores({
	story: "++id",
	users: "++id, nickname,storyId",
}).upgrade(async (tx) => {
	await tx.table("story").clear();
	const newScript: IScriptLine[] = (script as IScriptLine[]).map((v, i) => ({ ...v, id: i + 1 }));
	await tx.table("story").bulkAdd(newScript);
	await tx.table("users").clear();
	const newUserst: IUser[] = (users as IUser[]).map((v, i) => ({ ...v, id: i + 1 }));
	await tx.table("users").bulkAdd(newUserst);
})

db.on("populate", async (tx) => {
	await tx.table("story").bulkAdd(script as IScriptLine[]);
	await tx.table("users").bulkAdd(users as IUser[]);
})

export { db }

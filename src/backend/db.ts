import { Dexie, type EntityTable } from "dexie"

export interface StoryLine {
  id: number
  content:string,
  delay:number,
  speed:number,
  isActionAwait?:boolean,
}

const db = new Dexie("TheForumDB") as Dexie & {
  story: EntityTable<StoryLine,"id">
}

db.version(1).stores({
  story: "++id",
})

db.on("populate",()=>{
    db.story.bulkAdd([
        {
            content:"Hi. I am main_hero. I’m starting this file cuz I need to save my thoughts somewhere. I’ll maybe use them for the book. Or a game, like a visual novel, that’d be cool. Stuff in my head just feels too important to let it go like that, you know.",
            delay:1,
            speed:20,
        },
        {
            content:"So, a little about me, I love gaming, especially a game called Striking Countries 2, I have more than 1000 hours and, boy, lemme tell you, I am very good at that game, I can show you.",
            delay:0,
            speed:20,
            isActionAwait:true,
        },
    ])
})

export { db }

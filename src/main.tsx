import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.scss'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>
)


//TODO: issue with browser suggesting to save password even tho user just presses the link (not that serious tho)
//TODO: add some delays on some actions to make it believable
//TODO: consider throwing out the px for padding/gaps and move to cqw and clamps (and replace all px in clamps with rem) 
// (maybe i need to clamp every gap/padding but it's batshit insane, there's should be a better way) (it might be the best way lol)
// (also some of them look good without scalable units, which is good but at the same time frustrating, cuz there is no rule)
//TODO: consider merging chatmenu into chat on desktop only, cuz it looks like hot garbage rn
//TODO: the whole fake backend:
//we read what step we r at rn-> we read and execute items(either effects or lines) until we hit the isAwaitingAction flag-> we react to the action by loading more items
//TODO: ditch scss colors for vars to be able to use them in anims
//TODO: tables for users, posts, comments, subforums
//TODO: proper db update
//TODO: start learning ph lil bro, we need to fill the pages with actual data and images
//TODO: header hints breaks if resize occured
//TODO: block user in chat
//current chat saving idea: pregenMessages are always there, all sent messages are stored in the list in storyprovider, until game is saved or story navigates away and we sink the messages into storyMessages table
//TODO: fetch images for authors (posts, chats)
//TODO: we can get rid of hintPos in saving
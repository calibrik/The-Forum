import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.scss'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
)


//TODO: issue with browser suggesting to save password even tho user just presses the link (not that serious tho)
//TODO: modals
//TODO: add some delays on some actions to make it believable
//TODO: consider throwing out the px for padding/gaps and move to cqw and clamps (and replace all px in clamps with rem) 
// (maybe i need to clamp every gap/padding but it's batshit insane, there's should be a better way) (it might be the best way lol)
// (also some of them look good without scalable units, which is good but at the same time frustrating, cuz there is no rule)
//TODO: consider merging chatmenu into chat on desktop only, cuz it looks like hot garbage rn
//TODO: move from custom events to custom event bus
//TODO: the whole fake backend:
//we read what step we r at rn-> we read and execute items(either effects or lines) until we hit the isAwaitingAction flag-> we react to the action by loading more items
//need some general read and execute function, gsap involvment would be cool
//repo for db abstracting
//TODO: ditch scss colors for vars to be able to use them in anims
//TODO: tables for users, posts, comments
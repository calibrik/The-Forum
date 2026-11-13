# Description

This is a small linear visual novel on a simulated social network called The Forum that offers you to take role of your average terminally online forumer and dive into his thoughts, experiences and relationships with other forumers on the platform.

This website is purely a static website, there is no backend, nothing is stored on cloud. App makes use of browser's local IndexedDB to store info, including your account. The novel is fully playable on mobile, but desktop version offers better experience.

With this project I wanted to push the boundaries of what websites usually offer, from something that is purely functional to the form of entertainment, that uses same tools like HTML, CSS and JavaScript to tell a story.

I've spent a year developing this and, while it's my first time writing a plot, I'm pretty proud with what came out of it.

**AI use disclosure:** Until August 2026 I was developing this project by hand only, but then I started using AI tools to generate code to speed up development, since it was taking me way longer than I expected to complete this project and I kinda always wanted to try AI in development. I still made all the decisions myself and I understand 100% of the codebase and can explain every line of code in it.

# Screenshots
<img width="2560" height="1440" alt="Screenshot 2026-11-13 151513" src="https://github.com/user-attachments/assets/90c7b597-ab6b-4e0b-8d97-fd158a662d47" />
<img width="2560" height="1440" alt="Screenshot 2026-11-13 151603" src="https://github.com/user-attachments/assets/a69f694e-32a2-4cee-a077-d486051ccfa6" />
<img width="2560" height="1440" alt="Screenshot 2026-11-13 153324" src="https://github.com/user-attachments/assets/a5d3544d-3fea-48e3-9087-7ade54bd1814" />
<img width="2560" height="1440" alt="Screenshot 2026-11-13 152950" src="https://github.com/user-attachments/assets/90266eef-6357-4993-90e5-285ae6befbed" />
<img width="2560" height="1440" alt="Screenshot 2026-11-13 152803" src="https://github.com/user-attachments/assets/7276d9f6-851c-47e6-abd4-67549dc67b8f" />
<img width="2560" height="1440" alt="Screenshot 2026-11-13 152056" src="https://github.com/user-attachments/assets/b9e1e231-1423-4c09-8b36-d452e410b3d2" />
<img width="2560" height="1440" alt="Screenshot 2026-11-13 151846" src="https://github.com/user-attachments/assets/44add264-6433-4cc8-970d-baccf3a4410c" />

# Future plans
- Background music
- Different sound effects
- Introduce more visual effects
- Do a Feed page that changes depending on what happened in the story so far
- Add more posts, comments and other subforums to make The Forum more alive as a platform

# Live Link
https://the-forum.netlify.app

# Build locally using docker

1. You need to install Docker.

2. In the project folder run ```docker compose up --build``` in terminal or click on [dockerComposeLocal.bat](dockerComposeLocal.bat) to build images and run containers. Server will start on [localhost:80](http://localhost:80).


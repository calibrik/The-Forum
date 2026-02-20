import { createBrowserRouter, RouterProvider } from 'react-router';
import { TestPage } from './pages/TestPage';
import { Layout } from './pages/Layout';
import { Welcome } from './pages/Welcome';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { Subforum } from './pages/Subforum';
import { Error } from './pages/Error';
import { SubforumPosts } from './pages/SubforumPosts';
import { SubforumMembers } from './pages/SubforumMembers';
import { SubforumSettings } from './pages/SubforumSettings';
import { PostPage } from './pages/PostPage';
import { User } from './pages/User';
import { UserPosts } from './pages/UserPosts';
import { UserComments } from './pages/UserComments';
import { ChatMenu } from './pages/ChatMenu';
import { Chat } from './pages/Chat';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { Notepad } from './pages/Notepad';
import { EmptyLayout } from './pages/EmptyLayout';
import { Terminal } from './pages/Terminal';
import { TextPlugin } from 'gsap/all';
import { UserProvider } from './providers/UserAuth';
import { StoryProvider } from './providers/StoryProvider';

gsap.registerPlugin(useGSAP, TextPlugin);

const router = createBrowserRouter([
	{
		path: "/",
		Component: StoryProvider,
		children: [
			{
				path: "/",
				Component: Layout,
				children: [
					{
						index: true,
						Component: Welcome,
					},
					{ path: "*", element: <Error /> },
					{
						path: "/test",
						Component: TestPage,
					},
					{
						path: "/login",
						Component: Login,
					},
					{
						path: "/signup",
						Component: Signup,
					},
					{
						path: "/post",
						Component: PostPage,
					},
					{
						path: "/chat",
						Component: ChatMenu,
					},
					{
						path: "/chat/:id",
						Component: Chat,
					},
					{
						path: "/user",
						Component: User,
						children: [
							{
								path: "",
								Component: UserPosts,
							},
							{
								path: "comments",
								Component: UserComments,
							},
						]
					},
					{
						path: "/subforum",
						Component: Subforum,
						children: [
							{
								path: "",
								Component: SubforumPosts,
							},
							{
								path: "members",
								Component: SubforumMembers,
							},
							{
								path: "settings",
								Component: SubforumSettings,
							},
						]
					}
				]
			},
			{
				path: "/",
				Component: EmptyLayout,
				children: [
					{
						path: "/start",
						Component: Notepad,
					},
					{
						path: "/console",
						Component: Terminal,
					},
				]
			},
		]
	}
]);

function App() {

	return (
		<UserProvider>
			<RouterProvider router={router} />
		</UserProvider>
	)
}

export default App


import { createBrowserRouter, createMemoryRouter, Outlet, RouterProvider, type RouteObject } from 'react-router';
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
import type { FC, ReactNode } from 'react';

gsap.registerPlugin(useGSAP, TextPlugin);

export const appRoutes: RouteObject[] = [
	{
		path: "/",
		Component: StoryProvider,
		children: [
			{
				path: "/",
				Component: Layout,
				children: [
					{ index: true, Component: Welcome },
					{ path: "*", element: <Error /> },
					{ path: "/test", Component: TestPage },
					{ path: "/login", Component: Login },
					{ path: "/signup", Component: Signup },
					{ path: "/post/:id", Component: PostPage },
					{ path: "/chat", Component: ChatMenu },
					{ path: "/chat/:chatId", Component: Chat },
					{
						path: "/user/:username",
						Component: User,
						children: [
							{ path: "", Component: UserPosts },
							{ path: "comments", Component: UserComments },
						]
					},
					{
						path: "/subforum/:name",
						Component: Subforum,
						children: [
							{ path: "", Component: SubforumPosts },
							{ path: "members", Component: SubforumMembers },
							{ path: "settings", Component: SubforumSettings },
						]
					}
				]
			},
			{
				path: "/",
				Component: EmptyLayout,
				children: [
					{ path: "/start", Component: Notepad },
					{ path: "/console", Component: Terminal },
				]
			},
		]
	}
];

const router = createBrowserRouter(appRoutes);

function App() {
	return (
		<UserProvider>
			<RouterProvider router={router} />
		</UserProvider>
	);
}

interface IAllTheProvidersForMockProps {
	children: ReactNode;
};

export const AllTheProvidersForMock: FC<IAllTheProvidersForMockProps> = (props) => {
	const testRoutes: RouteObject[] = [
		{
			path: "/",
			element: (
				<StoryProvider>
					<Outlet />
				</StoryProvider>
			),
			children: [
				{
					path: "/",
					element: props.children
				}
			],
		},
	];

	const router = createMemoryRouter(testRoutes, {
		initialEntries: ["/"]
	});

	return (
		<UserProvider>
			<RouterProvider router={router} />
		</UserProvider>
	);
}

export default App


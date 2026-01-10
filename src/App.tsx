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

const router = createBrowserRouter([
	{
		path: "/",
		Component: Layout,
		// errorElement: <Error />,
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
				path: "/subforum",
				Component: Subforum,
				children: [
					{
						path:"",
						Component: SubforumPosts,
					},
					{
						path: "members",
						Component: SubforumMembers,
					},
					{
						path: "settings",
						Component: Welcome,
					},
				]
			}
		]
	}
]);

function App() {

	return (
		<RouterProvider router={router} />
	)
}

export default App

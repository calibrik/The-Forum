import { createBrowserRouter, RouterProvider } from 'react-router';
import { TestPage } from './pages/TestPage';
import { Layout } from './pages/Layout';
import { Welcome } from './pages/Welcome';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';

const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    // errorElement: <ErrorPage/>,
    children: [
      {
        index: true,
        Component: Welcome,
      },
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

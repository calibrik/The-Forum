import { createBrowserRouter, RouterProvider } from 'react-router';
import { TestPage } from './pages/TestPage';
import { Layout } from './pages/Layout';
import { WelcomePage } from './pages/WelcomPage';

const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    // errorElement: <ErrorPage/>,
    children: [
      {
        index: true,
        Component: WelcomePage,
      },
      {
        path: "test",
        Component: TestPage,
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

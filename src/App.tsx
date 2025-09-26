import { createBrowserRouter, RouterProvider } from 'react-router';
import { TestPage } from './pages/TestPage';

const router = createBrowserRouter([
  {
    path: "/",
    Component: TestPage,
    // errorElement: <ErrorPage/>,
    // children: [
    //   {
    //     index: true,
    //     Component: WelcomePage,
    //   }
    // ]
  }
]);

function App() {

  return (
    <RouterProvider router={router} />
  )
}

export default App

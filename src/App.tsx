import { createBrowserRouter, createRoutesFromElements, RouterProvider, Route } from "react-router-dom";
import { requireAuth } from '@/lib/requireAuth';
import HomeLayout from '@/Layouts/HomeLayout';
import Home from '@/components/Home';
import Error from '@/components/Error';
import Login, { loader as loginLoader, action as loginAction } from "@/components/Login";
import Register, { action as registerAction } from "@/components/Register";
import About from "@/components/About";
import Contact from "@/components/Contact";
import ChatLayout, { loader as chatlayoutLoader, action as chatlayoutAction } from "./Layouts/ChatLayout";
import UpdateChat, { loader as updateChatLoader, action as updateChatAction } from "@/components/UpdateChat";
import ChatHome from "@/components/ChatHome";
import Whiteboard from "./components/Whiteboard";

function App() {
  const router = createBrowserRouter(createRoutesFromElements(
    <>
      <Route path="/" element={<HomeLayout />}>
        <Route index element={<Home />} />
        <Route path="about" element={<About />} />
        <Route path="contact" element={<Contact />} />
        <Route path="login" element={<Login />} loader={loginLoader} action={loginAction} />
        <Route path="register" element={<Register />} action={registerAction} />
        <Route path="board" element={<Whiteboard/>} loader={async ({ request }) => {
          await requireAuth(request);
          return null;
        }} />
      </Route>
      <Route path="/chats" element={<ChatLayout />} errorElement={<Error />} loader={chatlayoutLoader} action={chatlayoutAction}>
        <Route index element={<ChatHome />} loader={async ({ request }) => {
          await requireAuth(request);
          return null;
        }} />
        <Route path=":id" element={<UpdateChat />} errorElement={<Error />} loader={updateChatLoader} action={updateChatAction} />
      </Route>
      <Route path="*" element={<Error />} />
    </>
  ));

  return (
    <RouterProvider router={router} />
  );
}

export default App;

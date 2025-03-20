import { createBrowserRouter, createRoutesFromElements, RouterProvider, Route } from "react-router-dom";
import { requireAuth } from '@/lib/requireAuth';
import HomeLayout from '@/Layouts/HomeLayout';
import Home from '@/components/Home';
import Error from '@/components/Error';
import Login from "@/components/Login";
import { loader as loginLoader } from "@/loaders/Login.loader";
import { action as loginAction } from "@/actions/Login.action";
import Register from "@/components/Register";
import { action as registerAction } from "@/actions/Register.action";
import About from "@/components/About";
import Contact from "@/components/Contact";
import ChatLayout from "./Layouts/ChatLayout";
import { loader as chatlayoutLoader } from "@/loaders/ChatLayout.loader";
import { action as chatlayoutAction } from "@/actions/ChatLayout.action";
import UpdateChat from "@/components/UpdateChat";
import { loader as updateChatLoader } from "@/loaders/UpdateChat.loader";
import { action as updateChatAction } from "@/actions/UpdateChat.action";
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

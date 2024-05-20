import { createBrowserRouter, createRoutesFromElements, RouterProvider, Route } from "react-router-dom";
import {requireAuth}  from '@/utils/requireAuth'
import HomeLayout from '@/Layouts/HomeLayout'
import Home from '@/components/Home'
import Error from '@/components/Error'
import Login, {loader as loginLoader, action as loginAction} from "@/components/Login";
import Register,{ action as registerAction} from "@/components/Register";
import About from "@/components/About";
import Contact from "@/components/Contact";
import ChatLayout from "./Layouts/ChatLayout";
import Chats from "@/components/Chats";
function App() {

  const router = createBrowserRouter(createRoutesFromElements(
    <Route path="/" element={<HomeLayout />}>
      <Route index element={<Home />} /> 
      <Route path="about" element={<About />} />
      <Route path="contact" element={<Contact />} />
      <Route path="login" element={<Login />} loader={loginLoader} action={loginAction} />
      <Route path="register" element={<Register />} action={registerAction} />

      {/* <Route path='account' element={<Account />} /> */}
      <Route path="chats" element={<ChatLayout />} loader={async ({ request }) => await requireAuth(request)}>
        <Route index element={<Chats />}/>
        <Route path="*" element={<Error />} />
      </Route>
      <Route path="*" element={<Error />} />
    </Route>
  )
  )
  return (
    <RouterProvider router={router} />
  )
}
export default App

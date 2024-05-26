import { Suspense, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MdOutlineEmojiEmotions } from "react-icons/md";
import { LuPaperclip, LuMic } from "react-icons/lu";
import { Input } from "./ui/input";
import SentMsg from "./SentMsg";
import RecievedMsg from "./RecievedMsg";
import { getChat, sendMessage } from "@/lib/api";
import { defer, useLoaderData, Await, Form } from "react-router-dom";
import { store } from "@/rtk/store";
import {  DetailedChatData, Message } from "@/lib/types";
import { useAppSelector } from "@/rtk/hooks";
import { requireAuth } from "@/lib/requireAuth";

export async function loader({ params, request }: { params: any, request: Request }) {
  await requireAuth(request)
  const token: (string | null) = store.getState().auth.token
  if (!token) return { data: [] }
  const data = getChat(params.id, token)
  return defer({ data })
}

export async function action({ request, params }: { request: Request, params: any }) {
  try {
    const form: FormData = await request.formData()
    const message: (FormDataEntryValue | null) = form.get('message')
    const token: (string | null) = store.getState().auth.token

    const chatId = params.id
    if (!token) throw new Error('Unauthorized')
      
    // const res = await sendMessage(recieverId, message, chatId, token)
    // console.log(res);
    
    return null
  } catch (error: any) {
    return error.message
  }

}

export default function Chats() {
  const results: any = useLoaderData()
  const currentUser = useAppSelector((state) => state.auth.userId)

  const renderCards = ({data}:{data: DetailedChatData}) => {
    
    const messages: JSX.Element[] = data.chat.messages.map((message: Message) => (
      <div key={message._id} className={`flex gap-4 ${currentUser === message.sender._id ? 'justify-end' : 'justify-start'}`}>
        {
          currentUser === message.sender._id ?
            <SentMsg text={message.message} time={message.createdAt} participant={message.sender.username} />
            :
            <RecievedMsg text={message.message} time={message.createdAt} participant={message.sender.username} />
        }
      </div>
    ));


    return (
      <>
        {
          messages.length > 0 ?
            messages
            :
            <div className="flex flex-col gap-2 justify-center items-center h-96">
              <p className="text-muted-foreground">No messages found</p>
            </div>
        }
      </>
    )
  }
  return (
    <div className='flex-1 flex flex-col'>
      <section className="flex gap-4 justify-start py-5 px-4 md:px-6 lg:px-8 items-center border-b-2">
        <Avatar>
          <AvatarImage src="https://github.com/shadcn.png" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-md font-semibold text-card-foreground">RAZOR</h1>
          <p className="text-md font-medium text-card-foreground flex items-center">
            123 Members 🞄 200 Online
          </p>
        </div>
      </section>
      <section className="bg-slate-100 flex-1 p-3 space-y-8 overflow-y-scroll scrollbar">
        <Suspense fallback={
          <>
            {
              Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="py-4 px-4 md:px-6 lg:px-8  border-b-2 border-r-2 bg-card flex items-center gap-4 hover:bg-secondary hover:cursor-pointer">
                  <span className="rounded-full p-3" />
                  <div>
                    <span className="text-md font-semibold text-card-foreground" />
                    <span className="text-sm font-medium text-card-foreground" />
                  </div>
                </div>
              ))
            }
          </>
        }>
          <Await resolve={results.data}>
            {renderCards}
          </Await>
        </Suspense>

      </section>
      <Form className="flex gap-2 justify-start py-5 px-4 md:px-6 lg:px-8 items-center" method="put">
        <span className="p-2 bg-secondary rounded-full">
          <MdOutlineEmojiEmotions size={23} />
        </span>
        <span className="p-2 bg-secondary rounded-full">
          <LuPaperclip size={20} />
        </span>
        <Input className="rounded-full bg-slate-100 border-none px-5" placeholder="Type a message" name="message" />
        <span className="p-2 bg-primary rounded-full">
          <LuMic size={20} color="aliceblue" />
        </span>
      </Form>
    </div>
  )
}

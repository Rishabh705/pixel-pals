import { useRouteError } from "react-router-dom"
import { BiSolidMessageAltError } from "react-icons/bi";

export default function Error() {
  const error: any = useRouteError()

  return (
    <div className="flex justify-center items-center w-full relative">
      <span className="absolute bg-secondary w-[500px] h-[500px] z-0 rounded-full " />
      <div className="flex flex-col justify-center items-center gap-4 z-10">
        <BiSolidMessageAltError color="red" size={70} />
        <h1 className=" text-xl font-medium">{error.message}</h1>
        <pre>{error.status} - {error.statusText}</pre>
      </div>
    </div>
  )
}
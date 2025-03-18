import { NavigateFunction, useNavigate, useRouteError } from "react-router-dom"
import { Button } from "./ui/button";

export default function Error() {
  const error: any = useRouteError()
  const navigate:NavigateFunction = useNavigate(); 
  const handleGoBack = () => {
    navigate(-1); // Goes back one step in history
  }; 
  return (
    <div className="relative h-screen w-screen bg-gray-100 flex justify-center items-center">
      <div className="text-center max-w-lg w-full">
        <div className="absolute inset-0 flex justify-center items-center -z-10">
          <div className="space-y-4 transform translate-y-1/2">
            <div className="bg-white rounded-full h-32 w-full shadow-lg"></div>
            <div className="bg-white rounded-full h-32 w-full scale-125 relative z-10 shadow-lg"></div>
            <div className="bg-white rounded-full h-32 w-full shadow-lg"></div>
          </div>
        </div>
        <h1 className="text-6xl md:text-7xl font-bold uppercase text-gray-800 mb-2">Oops!</h1>
        <h2 className=" text-base md:text-lg font-semibold text-gray-800 mb-6">
          Error {error?.status}: {error?.message}
        </h2>
        <Button
          onClick={handleGoBack}
          className="text-sm uppercase bg-primary text-white font-bold py-3 px-6 rounded hover:bg-primary-hover transition duration-200"
        >
          Go Back
        </Button>
      </div>
    </div>
  )
}
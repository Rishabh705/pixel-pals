import { Link, Form, useLoaderData, useActionData, useNavigation, Navigation , redirect } from "react-router-dom"
import { loginUser } from "../lib/api"
import { BiSolidError } from "react-icons/bi"
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import { FaFacebook } from "react-icons/fa";
import { AuthState, JWTPayload } from "@/utils/types";
import { login } from "@/rtk/slices/authSlice";
import { jwtDecode } from "jwt-decode";
import { store } from "@/rtk/store";


export async function loader({ request }: { request: Request }) {
    const url: URL = new URL(request.url)
    const searchParams: (string | null) = url.searchParams.get('message')
    return searchParams
}

export async function action({ request }: { request: Request }) {

    try {
        const pathname: string = new URL(request.url).searchParams.get("redirectTo") || '/'
        const form: FormData = await request.formData()

        const email: (FormDataEntryValue | null) = form.get('email')
        const password: (FormDataEntryValue | null) = form.get('password')

        const res = await loginUser({ email, password })
        
        //decode the token
        const decoded: JWTPayload = jwtDecode(res.accessToken)

        const authData: AuthState = {
            userId : decoded.UserInfo._id,
            email : decoded.UserInfo.email,
            username : decoded.UserInfo.username,
            accessToken: res.accessToken,
        }
            

        //store the data in the store
        store.dispatch(login(authData))
        
        localStorage.setItem("loggedin", JSON.stringify(authData))

        return redirect(pathname)

    } catch (error:any) {
        return error.message
    }

}

export default function Login() {

    const message:any = useLoaderData()
    const error:any = useActionData()
    const status:Navigation = useNavigation()

    return (
        <div className="flex flex-col items-center pt-16 pb-20 gap-8 px-7">
            <p className="text-2xl font-medium text-aliceblue">Sign in to your account</p>
            <Form method="post" className="flex flex-col w-full gap-5 max-w-md" replace>
                <input

                    name="email"
                    type="text"
                    placeholder="Email"

                    required
                    className="border border-gray-300 h-10 px-3 shadow-sm font-sans font-normal rounded-md focus:outline-none"
                />
                <input
                    name="password"
                    type="password"
                    placeholder="Password"
                    required
                    className="border border-gray-300 h-10 px-3 shadow-sm font-sans font-normal rounded-md focus:outline-none"
                />
                <button
                    disabled={status.state === "submitting"}
                    className={`bg-orange-500 border-none rounded-md h-10 text-white font-sans ${status.state !== "submitting" && "hover:bg-orange-600 cursor-pointer"} ${status.state === "submitting" && "opacity-40"}`}
                >
                    {status.state === "submitting" ? "Logging in..." : "Log in"}
                </button>
                {message && (
                    <section className="flex gap-4 p-2.5 bg-red-200 rounded-md">
                        <BiSolidError className="h-5 w-5 text-red-600" />
                        <p className="text-sm leading-5 text-red-600">{message}</p>
                    </section>
                )}
                {error && (
                    <section className="flex gap-4 p-2.5 bg-red-200 rounded-md">
                        <BiSolidError className="h-5 w-5 text-red-600" />
                        <p className="text-sm leading-5 text-red-600">{error}</p>
                    </section>
                )}
                <section className="text-sm text-center pt-5 pb-2.5">
                    <span>Or Signin Using</span>
                </section>
                <section className="flex gap-5 justify-center">
                    <Link to="#" className="bg1">
                        <FcGoogle size={25} />
                    </Link>
                    <Link to="#" className="bg2">
                        <FaGithub size={25} />
                    </Link>
                    <Link to="#" className="bg3">
                        <FaFacebook color="#2486fd" size={25} />
                    </Link>
                </section>
            </Form>
            <Link to='/register' className="text-sm text-muted-foreground hover:underline">No account? Create one here.</Link>
        </div>
    )
}
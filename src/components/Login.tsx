import { Link, Form, useLoaderData, useActionData, useNavigation, Navigation, redirect } from "react-router-dom"
import { loginUser } from "../lib/api"
import { BiSolidError } from "react-icons/bi"
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import { FaFacebook } from "react-icons/fa";
import { AuthState, JWTPayload } from "@/utils/types";
import { login } from "@/rtk/slices/authSlice";
import { jwtDecode } from "jwt-decode";
import { store } from "@/rtk/store";
import { useAuth0 } from "@auth0/auth0-react";
import { storeKey } from "@/lib/helpers";


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
            userId: decoded.UserInfo._id,
            email: decoded.UserInfo.email,
            username: decoded.UserInfo.username,
            accessToken: res.accessToken,
        }


        //store the data in the store
        store.dispatch(login(authData))

        localStorage.setItem("loggedin", JSON.stringify(authData))

        // get public key from DB
        const encryptedBase64PrivateKey: string = res.data2; // encrypted

        // Store private key in IndexedDB as data2
        await storeKey(encryptedBase64PrivateKey, 'data2');

        return redirect(pathname)

    } catch (error: any) {
        return error.message
    }

}

export default function Login() {

    const message: any = useLoaderData()
    const error: any = useActionData()
    const status: Navigation = useNavigation()
    const { loginWithRedirect } = useAuth0();

    return (
        <div className="flex flex-col items-center pt-16 pb-20 gap-8 px-7">
            <p className="text-2xl font-medium text-aliceblue">Sign in to your account</p>
            <Form method="post" className="flex flex-col w-full gap-5 max-w-md" replace>
                <input

                    name="email"
                    type="text"
                    placeholder="Email"
                    defaultValue='guest1@gmail.com'
                    required
                    className="border border-gray-300 h-10 px-3 shadow-sm font-sans font-normal rounded-md focus:outline-none"
                />
                <input
                    name="password"
                    type="password"
                    placeholder="Password"
                    defaultValue='guest1'
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
                <section className="py-2 px-3 rounded-full bg-gradient-to-r from-blue-300 to-blue-800">
                    <em className="text-sm text-center text-white">Deployed on Free Tier, so increased response time may be experienced</em>
                </section>
                <section className="text-xs text-center p-2">
                    <span>Or Signin Using</span>
                </section>
            </Form>
            <section className="flex gap-5 justify-center">
                <button className="bg1" onClick={() => loginWithRedirect()}>
                    <FcGoogle size={25} />
                </button>
                <button className="bg2">
                    <FaGithub size={25} />
                </button>
                <button className="bg3">
                    <FaFacebook color="#2486fd" size={25} />
                </button>
            </section>
            <Link to='/register' className="text-sm text-muted-foreground hover:underline">No account? Create one here.</Link>
        </div>
    )
}

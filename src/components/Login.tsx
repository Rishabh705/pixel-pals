import { Link, Form, useLoaderData, useActionData, useNavigation, Navigation } from "react-router-dom"
import { BiSolidError } from "react-icons/bi"
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import { FaFacebook } from "react-icons/fa";
import { useAuth0 } from "@auth0/auth0-react";

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
                    defaultValue='Guest1@123'
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
                    <em className="text-sm text-center text-white">New Users first create an account to get key</em>
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

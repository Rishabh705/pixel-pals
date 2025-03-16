import { Link, Form, redirect, useActionData, useNavigation, Navigation } from "react-router-dom"
import { registerUser } from "../lib/api"
import { BiSolidError } from "react-icons/bi"
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import { FaFacebook } from "react-icons/fa";
import { generateKeyPair, storeKey } from "@/lib/helpers";

export async function action({ request }: { request: Request }) {
  try {
    const formdata: FormData = await request.formData()

    const username: string = formdata.get('username')?.toString() || ''
    const email: string = formdata.get('email')?.toString() || ''
    const password1: string = formdata.get('password1')?.toString() || ''
    const password2: string = formdata.get('password2')?.toString() || ''


    if (password1 !== password2)
      throw new Error("Passwords should match")

    const passwordSpecial = /[@#$%^&*()!+-]/;

    if (!passwordSpecial.test(password1))
      throw new Error("Password should contain at least one special character.")

    const passwordLower = /[a-z]/;

    if (!passwordLower.test(password1))
      throw new Error("Password should contain at least one lowercase character.")

    const passwordUpper = /[A-Z]/;

    if (!passwordUpper.test(password1))
      throw new Error("Password should contain at least one uppercase character.")

    const passwordDigit = /[0-9]/;

    if (!passwordDigit.test(password1))
      throw new Error("Password should contain at least one digit.")

    // generate keypair after successful login
    const {publicKey, privateKey}: CryptoKeyPair = await generateKeyPair();
    await Promise.all([
      storeKey(privateKey, "privateKey"),
      storeKey(publicKey, "publicKey"),
      registerUser({ username, email, password: password1, publicKey })
    ])
    return redirect('/login')

  } catch (error: any) {
    console.log(error)
    return error.message
  }
}


export default function Register() {
  const error: any = useActionData()
  const status: Navigation = useNavigation()

  return (
    <div className="flex flex-col items-center pt-16 pb-20 gap-8 px-7">
      <p className="text-2xl font-medium text-aliceblue">Create your account</p>
      <Form className="flex flex-col w-full gap-5 max-w-md" method='post' replace>
        <input

          name="email"
          type="email"
          placeholder="Email"
          className="border border-gray-300 h-10 px-3 shadow-sm font-sans font-normal rounded-md focus:outline-none"
        />
        <input

          name="username"
          type="text"
          placeholder="Username"
          className="border border-gray-300 h-10 px-3 shadow-sm font-sans font-normal rounded-md focus:outline-none"
        />
        <input
          name="password1"
          type="password"
          minLength={8}
          placeholder="Password"
          className="border border-gray-300 h-10 px-3 shadow-sm font-sans font-normal rounded-md focus:outline-none"
        />
        <input
          name="password2"
          type="password"
          minLength={8}
          placeholder="Password again"
          className="border border-gray-300 h-10 px-3 shadow-sm font-sans font-normal rounded-md focus:outline-none"
        />
        <button
          disabled={status.state === "submitting"}
          className={`bg-orange-500 border-none rounded-md h-10 text-white font-sans ${status.state !== "submitting" && "hover:bg-orange-600 cursor-pointer"} ${status.state === "submitting" && "opacity-40"}`}
        >
          {status.state === "submitting" ? "Registering..." : "Register"}
        </button>
        {error && (
          <div className="flex gap-4 p-2.5 bg-red-200 rounded-md">
            <BiSolidError className="h-5 w-5 text-red-600" />
            <p className="text-sm leading-5 text-red-600">{error}</p>
          </div>
        )}
        <section className="text-sm text-center pt-5 pb-2.5">
          <span>Or Signup Using</span>
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
      <Link to='/login' className="text-sm text-muted-foreground hover:underline">Already have an account? Login here.</Link>
    </div>
  )
}
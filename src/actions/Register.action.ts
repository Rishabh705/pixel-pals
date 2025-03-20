import { redirect } from "react-router-dom"
import { registerUser } from "../lib/api"
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
      return error.message;
  }
}
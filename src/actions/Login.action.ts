import { redirect } from "react-router-dom"
import { loginUser } from "../lib/api"
import { AuthState, JWTPayload } from "@/utils/types";
import { login } from "@/rtk/slices/authSlice";
import { jwtDecode } from "jwt-decode";
import { store } from "@/rtk/store";

export async function action({ request }: { request: Request }) {

  try {
      const pathname: string = new URL(request.url).searchParams.get("redirectTo") || '/'
      const form: FormData = await request.formData()

      const email: (FormDataEntryValue | null) = form.get('email')
      const password: (FormDataEntryValue | null) = form.get('password')

      const res = await loginUser({ email, password })
      //decode the token
      const decoded: JWTPayload = jwtDecode(res.data.accessToken)
      const authData: AuthState = {
          userId: decoded.UserInfo._id,
          email: decoded.UserInfo.email,
          username: decoded.UserInfo.username,
          accessToken: res.data.accessToken,
      }


      //store the data in the store
      store.dispatch(login(authData))

      localStorage.setItem("loggedin", JSON.stringify(authData))

      return redirect(pathname)

  } catch (error: any) {
      return error.message;
  }

}
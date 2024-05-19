import { createBrowserRouter, createRoutesFromElements, RouterProvider, Route } from "react-router-dom";
// import {requireAuth}  from '@/utils/requireAuth'
import HomeLayout from '@/Layouts/HomeLayout'
import Home from '@/components/Home'
import Error from '@/components/Error'

function App() {

  const router = createBrowserRouter(createRoutesFromElements(
    <Route path="/" element={<HomeLayout />}>
      <Route index element={<Home />} /> {/* done */}
      {/* <Route path="about" element={<About />} />
      <Route path="contact" element={<Contact />} />
      <Route path="login" element={<Login />} loader={loginLoader} action={loginAction} />
      <Route path="register" element={<Register />} action={registerAction} />
      <Route path='account' element={<Account />} loader={async ({ request }) => await requireAuth(request)} />
      <Route path='favorites' element={<Favorites />} loader={async ({ request }) => await requireAuth(request)} />
      <Route path="search" element={<SearchLayout />}>
        <Route index element={<Search />} loader={loadSearches} />
        <Route path='movie' element={<Movie />} loader={loadMovies} />
        <Route path='tv' element={<TV />} loader={loadTvShows} />
        <Route path="*" element={<Error />} />
      </Route>
      <Route path="movie/:id" element={<Detail />} loader={loadDetail} />
      <Route path="tv/:id" element={<Detail />} loader={loadDetail} /> */}
      <Route path="*" element={<Error />} />
    </Route>
  )
  )
  return (
    <RouterProvider router={router} />
  )
}
export default App

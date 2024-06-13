import { Outlet } from "react-router-dom";
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function HomeLayout() {
  return (
    <>
      <Header />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </>
  );
}

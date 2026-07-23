import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar/Navbar";

function MainLayout() {

  const location = useLocation();

  const hideNavbar = location.pathname === "/chat";

  return (
    <>
      {!hideNavbar && <Navbar />}

      <Outlet />
    </>
  );
}

export default MainLayout;
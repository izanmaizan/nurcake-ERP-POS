import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa";
import {
  RiShieldUserFill,
  RiMapPinUserFill,
  RiLogoutBoxRLine,
} from "react-icons/ri";
import "../index.css";
import axios from "axios";

const Nav = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState("");
  const dropdownRef = useRef(null);

  useEffect(() => {
    const refreshToken = localStorage.getItem("refresh_token");
    if (refreshToken) {
      setIsAuthenticated(true);
      fetchUserData();
    }
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await axios.get("http://localhost:3000/me", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("refresh_token")}`,
        },
      });
      setUsername(response.data.username);
      setName(response.data.name);
      setRole(response.data.role);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("role");
    localStorage.removeItem("username");
    localStorage.removeItem("name");
    localStorage.removeItem("selectedLocation");
    localStorage.removeItem("tanggal");
    setIsAuthenticated(false);
    setName("");
    setRole("");
    navigate("/login");
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleDropdown = (dropdownName) => {
    setActiveDropdown((prevDropdown) =>
      prevDropdown === dropdownName ? "" : dropdownName
    );
  };

  // Menu items for each role
  const nurCakeMenus = [
    { to: "/produk-nc", label: "Produk" },
    { to: "/pos-nc", label: "POS" },
    { to: "/lacak-pesanan-kue", label: "Lacak Pesanan" },
    { to: "/buku-pesanan-nc", label: "Buku Pesanan" },
    // { to: "/gudang-nc", label: "Gudang Persediaan" },
    { to: "/keuangan-nc", label: "Keuangan" },
  ];

  const nurBouquetMenus = [
    { to: "/produk-nba", label: "Produk" },
    { to: "/pos-nba", label: "POS" },
    { to: "/keuangan-nba", label: "Keuangan" },
  ];

  const nurMakeupMenus = [
    { to: "/layanan-nmua", label: "Layanan MUA" },
    { to: "/jadwal-nmua", label: "Jadwal MUA" },
    { to: "/persediaan-nmua", label: "Persediaan MUA" },
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdown("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  return (
    <header className="bg-[#121212] p-4 fixed top-0 left-0 w-full z-50 shadow-lg backdrop-blur-sm">
      <nav className="max-w-screen-xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-4">
          <img
            src="../assets/logo_ng.png"
            alt="logo"
            className="w-12 h-12 sm:w-12 sm:h-12 rounded-full object-cover"
          />
          {isAuthenticated && (
            <div className="text-[#FFD700] flex items-center gap-2">
              {role === "admin" ? (
                <RiShieldUserFill size={20} />
              ) : (
                <RiMapPinUserFill size={20} />
              )}
              <div>
                <p className="font-bold">{name}</p>
                <p className="text-sm">
                  @{username} {role}
                </p>
              </div>
            </div>
          )}
        </div>

        {isAuthenticated && (
          <>
            <ul className="hidden lg:flex gap-8 items-center text-white">
              <li>
                <Link
                  to="/"
                  className="text-[#FFD700] font-bold hover:text-gray-300 border-b-2 border-transparent hover:border-[#FFD700] transition-all duration-300">
                  Dashboard
                </Link>
              </li>

              {role === "admin" ? (
                <>
                  <li>
                    <Link
                      to="/daftarakun"
                      className="text-[#FFD700] font-bold hover:text-gray-300 border-b-2 border-transparent hover:border-[#FFD700] transition-all duration-300">
                      Daftar Akun
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/keuangan-ng"
                      className="text-[#FFD700] font-bold hover:text-gray-300 border-b-2 border-transparent hover:border-[#FFD700] transition-all duration-300">
                      Keuangan
                    </Link>
                  </li>

                  {/* Dropdown Nur Cake */}
                  <li className="relative">
                    <button
                      onClick={() => toggleDropdown("nurcake")}
                      className="text-[#FFD700] font-bold hover:text-gray-300 border-b-2 border-transparent hover:border-[#FFD700] transition-all duration-300 flex items-center">
                      Nur Cake <span className="ml-1">▼</span>
                    </button>
                    {activeDropdown === "nurcake" && (
                      <div className="absolute left-0 bg-black/90 rounded-lg shadow-lg mt-2 py-2 w-48">
                        {nurCakeMenus.map((item) => (
                          <Link
                            key={item.to}
                            to={item.to}
                            className="block px-4 py-2 text-[#FFD700] hover:bg-gray-800">
                            {item.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </li>

                  {/* Dropdown Nur Bouquet */}
                  <li className="relative">
                    <button
                      onClick={() => toggleDropdown("nurbouquet")}
                      className="text-[#FFD700] font-bold hover:text-gray-300 border-b-2 border-transparent hover:border-[#FFD700] transition-all duration-300 flex items-center">
                      Nur Bouquet <span className="ml-1">▼</span>
                    </button>
                    {activeDropdown === "nurbouquet" && (
                      <div className="absolute left-0 bg-black/90 rounded-lg shadow-lg mt-2 py-2 w-48">
                        {nurBouquetMenus.map((item) => (
                          <Link
                            key={item.to}
                            to={item.to}
                            className="block px-4 py-2 text-[#FFD700] hover:bg-gray-800">
                            {item.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </li>

                  {/* Dropdown Nur Makeup */}
                  {/* <li className="relative" ref={dropdownRef}> */}
                  <li className="relative">
                    <button
                      onClick={() => toggleDropdown("nurmakeup")}
                      className="text-[#FFD700] font-bold hover:text-gray-300 border-b-2 border-transparent hover:border-[#FFD700] transition-all duration-300 flex items-center">
                      Nur Makeup <span className="ml-1">▼</span>
                    </button>
                    {activeDropdown === "nurmakeup" && (
                      <div className="absolute left-0 bg-black/90 rounded-lg shadow-lg mt-2 py-2 w-48">
                        {nurMakeupMenus.map((item) => (
                          <Link
                            key={item.to}
                            to={item.to}
                            className="block px-4 py-2 text-[#FFD700] hover:bg-gray-800">
                            {item.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </li>

                  {/* <li>
                    <Link
                      to="/laporan-ng"
                      className="text-[#FFD700] font-bold hover:text-gray-300 border-b-2 border-transparent hover:border-[#FFD700] transition-all duration-300">
                      Laporan
                    </Link>
                  </li> */}
                </>
              ) : role === "nurcake" ? (
                nurCakeMenus.map((item) => (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      className="text-[#FFD700] font-bold hover:text-gray-300 border-b-2 border-transparent hover:border-[#FFD700] transition-all duration-300">
                      {item.label}
                    </Link>
                  </li>
                ))
              ) : role === "nurbouquet" ? (
                nurBouquetMenus.map((item) => (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      className="text-[#FFD700] font-bold hover:text-gray-300 border-b-2 border-transparent hover:border-[#FFD700] transition-all duration-300">
                      {item.label}
                    </Link>
                  </li>
                ))
              ) : (
                role === "nurmakeup" &&
                nurMakeupMenus.map((item) => (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      className="text-[#FFD700] font-bold hover:text-gray-300 border-b-2 border-transparent hover:border-[#FFD700] transition-all duration-300">
                      {item.label}
                    </Link>
                  </li>
                ))
              )}

              <li>
                <button
                  onClick={handleLogout}
                  className="bg-red-700 text-white hover:bg-red-800 px-4 py-2 rounded transition-all duration-300 flex items-center gap-2">
                  <span>Keluar</span>
                  {/* <RiLogoutBoxRLine size={20} /> */}
                </button>
              </li>
            </ul>
          </>
        )}

        <div className="lg:hidden">
          <button onClick={toggleMenu} className="text-[#FFD700]">
            {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && isAuthenticated && (
        <div className="lg:hidden bg-black/80 rounded-lg mt-4 p-4">
          <ul className="flex flex-col gap-4">
            <li>
              <Link
                to="/"
                onClick={toggleMenu}
                className="text-[#FFD700] hover:text-gray-300 block">
                Dashboard
              </Link>
            </li>

            {role === "admin" ? (
              <>
                <li>
                  <Link
                    to="/daftar-akun"
                    onClick={toggleMenu}
                    className="text-[#FFD700] hover:text-gray-300 block">
                    Daftar Akun
                  </Link>
                </li>
                <li>
                  <Link
                    to="/keuangan-nc"
                    onClick={toggleMenu}
                    className="text-[#FFD700] hover:text-gray-300 block">
                    Keuangan
                  </Link>
                </li>

                {/* Mobile Dropdowns */}
                <li>
                  <button
                    onClick={() => toggleDropdown("nurcake")}
                    className="text-[#FFD700] hover:text-gray-300 block w-full text-left">
                    Nur Cake ▼
                  </button>
                  {activeDropdown === "nurcake" && (
                    <div className="ml-4 mt-2 space-y-2">
                      {nurCakeMenus.map((item) => (
                        <Link
                          key={item.to}
                          to={item.to}
                          onClick={toggleMenu}
                          className="text-[#FFD700] hover:text-gray-300 block">
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </li>

                <li>
                  <button
                    onClick={() => toggleDropdown("nurbouquet")}
                    className="text-[#FFD700] hover:text-gray-300 block w-full text-left">
                    Nur Bouquet ▼
                  </button>
                  {activeDropdown === "nurbouquet" && (
                    <div className="ml-4 mt-2 space-y-2">
                      {nurBouquetMenus.map((item) => (
                        <Link
                          key={item.to}
                          to={item.to}
                          onClick={toggleMenu}
                          className="text-[#FFD700] hover:text-gray-300 block">
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </li>

                <li>
                  <button
                    onClick={() => toggleDropdown("nurmakeup")}
                    className="text-[#FFD700] hover:text-gray-300 block w-full text-left">
                    Nur Makeup ▼
                  </button>
                  {activeDropdown === "nurmakeup" && (
                    <div className="ml-4 mt-2 space-y-2">
                      {nurMakeupMenus.map((item) => (
                        <Link
                          key={item.to}
                          to={item.to}
                          onClick={toggleMenu}
                          className="text-[#FFD700] hover:text-gray-300 block">
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </li>
              </>
            ) : role === "nurcake" ? (
              nurCakeMenus.map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    onClick={toggleMenu}
                    className="text-[#FFD700] hover:text-gray-300 block">
                    {item.label}
                  </Link>
                </li>
              ))
            ) : role === "nurbouquet" ? (
              nurBouquetMenus.map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    onClick={toggleMenu}
                    className="text-[#FFD700] hover:text-gray-300 block">
                    {item.label}
                  </Link>
                </li>
              ))
            ) : (
              role === "nurmakeup" &&
              nurMakeupMenus.map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    onClick={toggleMenu}
                    className="text-[#FFD700] hover:text-gray-300 block">
                    {item.label}
                  </Link>
                </li>
              ))
            )}

            <li>
              <Link
                to="/keuangan-nc"
                className="text-[#FFD700] font-bold hover:text-gray-300 border-b-2 border-transparent hover:border-[#FFD700] transition-all duration-300">
                Keuangan
              </Link>
            </li>

            <li>
              <button
                onClick={() => {
                  handleLogout();
                  toggleMenu();
                }}
                className="bg-red-600 text-white hover:bg-red-700 px-4 py-2 rounded transition-all duration-300 w-full mt-4">
                Keluar
              </button>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
};

export default Nav;

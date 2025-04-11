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

// Warna tema krem/emas
const COLORS = ["#D4AF37", "#C5B358", "#E6BE8A"]; // Variasi warna krem/emas
const bgColor = "#FAF3E0"; // Krem muda/background utama
const textColor = "#8B7D3F"; // Emas gelap untuk teks
const secondaryTextColor = "#B8A361"; // Emas sedang untuk teks sekunder
const cardBgColor = "#FFF8E7"; // Krem sangat muda untuk kartu
const API = import.meta.env.VITE_API;

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
      const response = await axios.get(`${API}/me`, {
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
      <header className="bg-[#FAF3E0] p-4 fixed top-0 left-0 w-full z-50 shadow-lg backdrop-blur-sm">
        <nav className="max-w-screen-xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <img
                src="../assets/logo_ng.png"
                alt="logo"
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover"
            />
            {isAuthenticated && (
                <div className="text-[#D4AF37] flex items-center gap-2">
                  {role === "admin" ? (
                      <RiShieldUserFill size={20} className="text-[#8B7D3F]" />
                  ) : (
                      <RiMapPinUserFill size={20} className="text-[#8B7D3F]" />
                  )}
                  <div>
                    <p className="font-bold text-[#8B7D3F]">{name}</p>
                    <p className="text-sm text-[#B8A361]">
                      @{username} {role}
                    </p>
                  </div>
                </div>
            )}
          </div>

          {isAuthenticated && (
              <>
                <ul className="hidden lg:flex gap-6 items-center text-[#8B7D3F]">
                  <li>
                    <Link
                        to="/"
                        className="text-[#8B7D3F] font-bold hover:text-[#D4AF37] border-b-2 border-transparent hover:border-[#D4AF37] transition-all duration-300">
                      Dashboard
                    </Link>
                  </li>

                  {role === "admin" ? (
                      <>
                        <li>
                          <Link
                              to="/daftarakun"
                              className="text-[#8B7D3F] font-bold hover:text-[#D4AF37] border-b-2 border-transparent hover:border-[#D4AF37] transition-all duration-300">
                            Daftar Akun
                          </Link>
                        </li>
                        <li>
                          <Link
                              to="/keuangan-ng"
                              className="text-[#8B7D3F] font-bold hover:text-[#D4AF37] border-b-2 border-transparent hover:border-[#D4AF37] transition-all duration-300">
                            Keuangan
                          </Link>
                        </li>

                        {/* Dropdown Nur Cake */}
                        <li className="relative">
                          <button
                              onClick={() => toggleDropdown("nurcake")}
                              className="text-[#8B7D3F] font-bold hover:text-[#D4AF37] border-b-2 border-transparent hover:border-[#D4AF37] transition-all duration-300 flex items-center">
                            Nur Cake <span className="ml-1">▼</span>
                          </button>
                          {activeDropdown === "nurcake" && (
                              <div className="absolute left-0 bg-[#FFF8E7] rounded-lg shadow-lg mt-2 py-2 w-48">
                                {nurCakeMenus.map((item) => (
                                    <Link
                                        key={item.to}
                                        to={item.to}
                                        className="block px-4 py-2 text-[#8B7D3F] hover:bg-[#F5E9C9] hover:text-[#D4AF37]">
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
                              className="text-[#8B7D3F] font-bold hover:text-[#D4AF37] border-b-2 border-transparent hover:border-[#D4AF37] transition-all duration-300 flex items-center">
                            Nur Bouquet <span className="ml-1">▼</span>
                          </button>
                          {activeDropdown === "nurbouquet" && (
                              <div className="absolute left-0 bg-[#FFF8E7] rounded-lg shadow-lg mt-2 py-2 w-48">
                                {nurBouquetMenus.map((item) => (
                                    <Link
                                        key={item.to}
                                        to={item.to}
                                        className="block px-4 py-2 text-[#8B7D3F] hover:bg-[#F5E9C9] hover:text-[#D4AF37]">
                                      {item.label}
                                    </Link>
                                ))}
                              </div>
                          )}
                        </li>

                        {/* Dropdown Nur Makeup */}
                        <li className="relative">
                          <button
                              onClick={() => toggleDropdown("nurmakeup")}
                              className="text-[#8B7D3F] font-bold hover:text-[#D4AF37] border-b-2 border-transparent hover:border-[#D4AF37] transition-all duration-300 flex items-center">
                            Nur Makeup <span className="ml-1">▼</span>
                          </button>
                          {activeDropdown === "nurmakeup" && (
                              <div className="absolute left-0 bg-[#FFF8E7] rounded-lg shadow-lg mt-2 py-2 w-48">
                                {nurMakeupMenus.map((item) => (
                                    <Link
                                        key={item.to}
                                        to={item.to}
                                        className="block px-4 py-2 text-[#8B7D3F] hover:bg-[#F5E9C9] hover:text-[#D4AF37]">
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
                                className="text-[#8B7D3F] font-bold hover:text-[#D4AF37] border-b-2 border-transparent hover:border-[#D4AF37] transition-all duration-300">
                              {item.label}
                            </Link>
                          </li>
                      ))
                  ) : role === "nurbouquet" ? (
                      nurBouquetMenus.map((item) => (
                          <li key={item.to}>
                            <Link
                                to={item.to}
                                className="text-[#8B7D3F] font-bold hover:text-[#D4AF37] border-b-2 border-transparent hover:border-[#D4AF37] transition-all duration-300">
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
                                className="text-[#8B7D3F] font-bold hover:text-[#D4AF37] border-b-2 border-transparent hover:border-[#D4AF37] transition-all duration-300">
                              {item.label}
                            </Link>
                          </li>
                      ))
                  )}

                  <li>
                    <button
                        onClick={handleLogout}
                        className="bg-[#C5B358] text-white hover:bg-[#D4AF37] px-4 py-2 rounded transition-all duration-300 flex items-center gap-2">
                      <span>Keluar</span>
                      <RiLogoutBoxRLine size={18} />
                    </button>
                  </li>
                </ul>
              </>
          )}

          <div className="lg:hidden">
            <button onClick={toggleMenu} className="text-[#D4AF37]">
              {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
          </div>
        </nav>

        {/* Mobile Menu */}
        {isMenuOpen && isAuthenticated && (
            <div className="lg:hidden bg-[#FFF8E7] rounded-lg mt-4 p-4 shadow-md">
              <ul className="flex flex-col gap-3">
                <li>
                  <Link
                      to="/"
                      onClick={toggleMenu}
                      className="text-[#8B7D3F] hover:text-[#D4AF37] block py-2">
                    Dashboard
                  </Link>
                </li>

                {role === "admin" ? (
                    <>
                      <li>
                        <Link
                            to="/daftar-akun"
                            onClick={toggleMenu}
                            className="text-[#8B7D3F] hover:text-[#D4AF37] block py-2">
                          Daftar Akun
                        </Link>
                      </li>
                      <li>
                        <Link
                            to="/keuangan-nc"
                            onClick={toggleMenu}
                            className="text-[#8B7D3F] hover:text-[#D4AF37] block py-2">
                          Keuangan
                        </Link>
                      </li>

                      {/* Mobile Dropdowns */}
                      <li className="border-t border-[#E6BE8A]/30 pt-2">
                        <button
                            onClick={() => toggleDropdown("nurcake")}
                            className="text-[#8B7D3F] hover:text-[#D4AF37] block w-full text-left py-2 font-medium flex justify-between items-center">
                          Nur Cake <span>▼</span>
                        </button>
                        {activeDropdown === "nurcake" && (
                            <div className="ml-4 mt-1 space-y-2 pl-2 border-l-2 border-[#E6BE8A]/50">
                              {nurCakeMenus.map((item) => (
                                  <Link
                                      key={item.to}
                                      to={item.to}
                                      onClick={toggleMenu}
                                      className="text-[#B8A361] hover:text-[#D4AF37] block py-1">
                                    {item.label}
                                  </Link>
                              ))}
                            </div>
                        )}
                      </li>

                      <li className="border-t border-[#E6BE8A]/30 pt-2">
                        <button
                            onClick={() => toggleDropdown("nurbouquet")}
                            className="text-[#8B7D3F] hover:text-[#D4AF37] block w-full text-left py-2 font-medium flex justify-between items-center">
                          Nur Bouquet <span>▼</span>
                        </button>
                        {activeDropdown === "nurbouquet" && (
                            <div className="ml-4 mt-1 space-y-2 pl-2 border-l-2 border-[#E6BE8A]/50">
                              {nurBouquetMenus.map((item) => (
                                  <Link
                                      key={item.to}
                                      to={item.to}
                                      onClick={toggleMenu}
                                      className="text-[#B8A361] hover:text-[#D4AF37] block py-1">
                                    {item.label}
                                  </Link>
                              ))}
                            </div>
                        )}
                      </li>

                      <li className="border-t border-[#E6BE8A]/30 pt-2">
                        <button
                            onClick={() => toggleDropdown("nurmakeup")}
                            className="text-[#8B7D3F] hover:text-[#D4AF37] block w-full text-left py-2 font-medium flex justify-between items-center">
                          Nur Makeup <span>▼</span>
                        </button>
                        {activeDropdown === "nurmakeup" && (
                            <div className="ml-4 mt-1 space-y-2 pl-2 border-l-2 border-[#E6BE8A]/50">
                              {nurMakeupMenus.map((item) => (
                                  <Link
                                      key={item.to}
                                      to={item.to}
                                      onClick={toggleMenu}
                                      className="text-[#B8A361] hover:text-[#D4AF37] block py-1">
                                    {item.label}
                                  </Link>
                              ))}
                            </div>
                        )}
                      </li>
                    </>
                ) : role === "nurcake" ? (
                    nurCakeMenus.map((item) => (
                        <li key={item.to} className="border-t border-[#E6BE8A]/30 pt-2">
                          <Link
                              to={item.to}
                              onClick={toggleMenu}
                              className="text-[#8B7D3F] hover:text-[#D4AF37] block py-2">
                            {item.label}
                          </Link>
                        </li>
                    ))
                ) : role === "nurbouquet" ? (
                    nurBouquetMenus.map((item) => (
                        <li key={item.to} className="border-t border-[#E6BE8A]/30 pt-2">
                          <Link
                              to={item.to}
                              onClick={toggleMenu}
                              className="text-[#8B7D3F] hover:text-[#D4AF37] block py-2">
                            {item.label}
                          </Link>
                        </li>
                    ))
                ) : (
                    role === "nurmakeup" &&
                    nurMakeupMenus.map((item) => (
                        <li key={item.to} className="border-t border-[#E6BE8A]/30 pt-2">
                          <Link
                              to={item.to}
                              onClick={toggleMenu}
                              className="text-[#8B7D3F] hover:text-[#D4AF37] block py-2">
                            {item.label}
                          </Link>
                        </li>
                    ))
                )}

                <li className="mt-4">
                  <button
                      onClick={() => {
                        handleLogout();
                        toggleMenu();
                      }}
                      className="bg-[#D4AF37] text-white hover:bg-[#C5B358] px-4 py-2 rounded transition-all duration-300 w-full flex items-center justify-center gap-2">
                    <span>Keluar</span>
                    <RiLogoutBoxRLine size={18} />
                  </button>
                </li>
              </ul>
            </div>
        )}
      </header>
  );
};

export default Nav;
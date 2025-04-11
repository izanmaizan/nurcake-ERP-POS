import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  // Warna tema krem/emas
  const COLORS = ["#D4AF37", "#C5B358", "#E6BE8A"]; // Variasi warna krem/emas
  const bgColor = "#FAF3E0"; // Krem muda/background utama
  const textColor = "#8B7D3F"; // Emas gelap untuk teks
  const secondaryTextColor = "#B8A361"; // Emas sedang untuk teks sekunder
  const cardBgColor = "#FFF8E7"; // Krem sangat muda untuk kartu
  const API = import.meta.env.VITE_API;

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (!username || !password) {
      setMsg("Silakan isi semua field");
      setIsLoading(false);
      return;
    }

    try {
      console.log(`Mencoba login ke ${API}/login`);
      const response = await axios.post(`${API}/login`, {
        username: username,
        password: password,
      });

      const { accessToken } = response.data;
      localStorage.setItem("refresh_token", accessToken);

      navigate("/");
      window.location.reload();
    } catch (error) {
      console.error("Login error:", error);

      // Penanganan error yang lebih baik
      if (error.response) {
        // Server merespons dengan status error
        if (error.response.status === 401) {
          setMsg("Password salah");
        } else if (error.response.status === 404) {
          setMsg("Username belum terdaftar");
        } else {
          setMsg(`Error server: ${error.response.status} - ${error.response.data.message || 'Gagal untuk Login'}`);
        }
      } else if (error.request) {
        // Request dibuat tapi tidak ada respons dari server
        setMsg("Tidak dapat terhubung ke server. Pastikan server berjalan dan jaringan terhubung.");
      } else {
        // Error lainnya
        setMsg(`Error: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
      <div className="min-h-screen bg-[#FAF3E0] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-8 bg-[#FFF8E7] rounded-2xl shadow-lg border-2 border-[#D4AF37] p-6 sm:p-10">
          {/* Header */}
          <div className="text-center">
            <h2 className="text-4xl sm:text-5xl font-bold text-[#D4AF37] tracking-wide uppercase mb-4 drop-shadow-[0_0_10px_rgba(212,175,55,0.3)]">
              MASUK
            </h2>
            <p className="text-sm text-[#8B7D3F] opacity-80">
              Masukkan kredensial Anda
            </p>
            <p className="text-xs text-[#B8A361] opacity-70 mt-1">
              Terhubung ke: {API}
            </p>
          </div>

          {/* Error Message */}
          {msg && (
              <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg text-center">
                {msg}
              </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            {/* Username Input */}
            <div className="relative">
              <input
                  type="text"
                  name="username"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 text-[#8B7D3F] bg-[#FAF3E0] border-2 border-[#E6BE8A] rounded-xl
              focus:outline-none focus:border-[#D4AF37] transition duration-300
              hover:border-[#D4AF37]/50 placeholder-[#B8A361]"
                  placeholder="Username"
              />
            </div>

            {/* Password Input */}
            <div className="relative">
              <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 text-[#8B7D3F] bg-[#FAF3E0] border-2 border-[#E6BE8A] rounded-xl
              focus:outline-none focus:border-[#D4AF37] transition duration-300
              hover:border-[#D4AF37]/50 placeholder-[#B8A361]"
                  placeholder="Password"
              />

              {/* Password Visibility Toggle */}
              <div
                  className="absolute right-4 top-4 cursor-pointer text-[#B8A361] hover:text-[#D4AF37]"
                  onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? (
                    <AiFillEyeInvisible size={20} />
                ) : (
                    <AiFillEye size={20} />
                )}
              </div>
            </div>

            {/* Login Button */}
            <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-[#D4AF37] text-white font-bold rounded-xl
            hover:bg-[#C5B358] transition duration-300
            focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:ring-opacity-50
            disabled:opacity-50 disabled:cursor-not-allowed
            transform hover:scale-[1.02] active:scale-[0.98] shadow-md">
              {isLoading ? "Memuat..." : "Masuk"}
            </button>
          </form>
        </div>
      </div>
  );
};

export default Login;
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

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (!username || !password) {
      setMsg("Silakan isi semua field");
      setIsLoading(false);
      return;
    } else {
      try {
        const response = await axios.post("http://localhost:3000/login", {
          username: username,
          password: password,
        });

        const { accessToken } = response.data;
        localStorage.setItem("refresh_token", accessToken);

        navigate("/");
        window.location.reload();
      } catch (error) {
        if (error.response.status === 401) {
          setMsg("Password salah");
        } else if (error.response.status === 404) {
          setMsg("Username belum terdaftar");
        } else {
          setMsg("Gagal untuk Login, periksa kembali password");
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#1E1E1E] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8 bg-[#1E1E1E] rounded-2xl shadow-2xl border-2 border-[#D4AF37] p-10 ">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-5xl font-bold text-[#D4AF37] tracking-wide uppercase mb-4 drop-shadow-[0_0_10px_rgba(212,175,55,0.3)]">
            MASUK
          </h2>
          <p className="text-sm text-[#D4AF37] opacity-80">
            Masukkan kredensial Anda
          </p>
        </div>

        {/* Error Message */}
        {msg && (
          <div className="bg-red-900/40 border border-red-700 text-red-300 px-4 py-3 rounded-lg text-center">
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
              className="w-full px-4 py-3 text-[#D4AF37] bg-[#121212] border-2 border-[#333] rounded-xl 
              focus:outline-none focus:border-[#D4AF37] transition duration-300 
              hover:border-[#D4AF37]/50 placeholder-[#D4AF37]/50"
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
              className="w-full px-4 py-3 text-[#D4AF37] bg-[#121212] border-2 border-[#333] rounded-xl 
              focus:outline-none focus:border-[#D4AF37] transition duration-300 
              hover:border-[#D4AF37]/50 placeholder-[#D4AF37]/50"
              placeholder="Password"
            />

            {/* Password Visibility Toggle */}
            <div
              className="absolute right-4 top-4 cursor-pointer text-[#D4AF37]/70 hover:text-[#D4AF37]"
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
            className="w-full py-3 bg-[#D4AF37] text-black font-bold rounded-xl 
            hover:bg-[#D4AF37]/90 transition duration-300 
            focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:ring-opacity-50
            disabled:opacity-50 disabled:cursor-not-allowed
            transform hover:scale-[1.02] active:scale-[0.98]">
            {isLoading ? "Memuat..." : "Masuk"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;

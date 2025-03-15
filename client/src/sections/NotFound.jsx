import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="h-screen flex items-center justify-center bg-[#1a1a1a] text-[#FFD700]">
      <div className="text-center bg-[#2d2d2d] rounded-lg shadow-lg p-10 border border-[#FFD700]">
        <h1 className="text-[8rem] font-extrabold leading-tight text-[#FFD700]">
          404
        </h1>
        <h2 className="text-2xl font-semibold mb-4 text-[#DAA520]">
          Oops! Halaman Tidak Ditemukan!
        </h2>
        <p className="text-lg mb-6 text-[#DAA520]">
          Sepertinya halaman yang Anda cari <br />
          tidak ada atau mungkin telah dihapus.
        </p>
        <div className="flex justify-center gap-4">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="text-[#FFD700] border-[#FFD700] hover:bg-[#3d3d3d] hover:text-[#FFD700]">
            Kembali
          </Button>
          <Button
            onClick={() => navigate("/")}
            className="bg-[#3d3d3d] text-[#FFD700] hover:bg-[#4d4d4d] border border-[#FFD700] transition duration-200">
            Kembali ke Beranda
          </Button>
        </div>
      </div>
    </div>
  );
}

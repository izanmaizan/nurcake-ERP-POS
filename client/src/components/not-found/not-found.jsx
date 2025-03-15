import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="h-svh bg-[#1a1a1a]">
      <div className="m-auto flex h-full w-full flex-col items-center justify-center gap-2">
        <h1 className="text-[7rem] font-bold leading-tight text-[#FFD700]">
          404
        </h1>
        <span className="font-medium text-[#FFD700]">
          Oops! Page Not Found!
        </span>
        <p className="text-center text-[#DAA520]">
          It seems like the page {"you're"} looking for <br />
          does not exist or might have been removed.
        </p>
        <div className="mt-6 flex gap-4">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="border-[#FFD700] text-[#FFD700] hover:bg-[#3d3d3d] hover:text-[#FFD700]">
            Go Back
          </Button>
          <Button
            onClick={() => navigate("/")}
            className="bg-[#FFD700] text-[#1a1a1a] hover:bg-[#DAA520]">
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
}

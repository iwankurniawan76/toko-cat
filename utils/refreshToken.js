import axios from "axios";
import { useRouter } from "next/navigation";

export const refreshToken = async (setToken, setNama, setStatus, setExpire) => {
  const router = useRouter();
  try {
    const response = await axios.get("http://localhost:5500/token", {
      withCredentials: true,
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.data) {
      throw new Error("No accessToken received from server");
    }
    const accessToken = response.data;
    setToken(accessToken);
    const decoded = jwtDecode(accessToken);
    setNama(decoded.nama);
    setStatus(decoded.status);
    setExpire(decoded.exp);
    console.log("Token refreshed:", decoded);
  } catch (err) {
    console.log("Failed to refresh token:", err);
    router.push("login");
  }
};

// app/login/page.tsx
import Web3LoginWithConnectKit from "@/components/login/Web3LoginWithConnectKit";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#121212] p-4">
      <div className="w-full max-w-md">
        <h1 className="text-4xl font-bold text-center text-white mb-8">一灯教育</h1>
        <Web3LoginWithConnectKit />
      </div>
    </div>
  );
}
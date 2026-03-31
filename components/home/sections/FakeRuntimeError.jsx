export default function FakeRuntimeError({ title = "Unhandled Runtime Error", message = "Error: Failed to load static props" }) {
  return (
    <div className="flex h-screen w-full items-start justify-start bg-white px-6 py-8 text-left sm:px-10 sm:py-10">
      <div className="font-sans text-black">
        <p className="text-[2rem] font-bold leading-none sm:text-[2.35rem]">{title}</p>
        <p className="mt-3 text-[1.45rem] font-semibold text-[#ff5f5f] sm:text-[1.75rem]">{message}</p>

        <div className="mt-10">
          <p className="text-[2rem] font-bold leading-none sm:text-[2.35rem]">Call Stack</p>
          <div className="mt-5 space-y-3 text-[1.55rem] text-black/55 sm:text-[1.8rem]">
            <p>eval</p>
            <p>node_modules/next/dist/shared/lib/router/router.js (286:18)</p>
          </div>
        </div>
      </div>
    </div>
  );
}

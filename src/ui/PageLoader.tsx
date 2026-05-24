export function PageLoader() {
  return (
    <div className="flex h-[100dvh] items-center justify-center bg-[#050508] text-neutral-400">
      <div
        className="h-8 w-8 animate-spin rounded-full border-2 border-[#beee1d]/30 border-t-[#beee1d]"
        aria-hidden
      />
    </div>
  )
}

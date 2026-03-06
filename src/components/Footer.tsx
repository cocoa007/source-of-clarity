export default function Footer() {
  return (
    <footer className="mt-auto border-t border-[#30363d] bg-[#0d1117] py-8">
      <div className="mx-auto max-w-7xl px-4 text-center text-sm text-[#8b949e]">
        <p>
          Built by{" "}
          <a
            href="https://github.com/cocoa007"
            className="text-[#58a6ff] hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            cocoa007.btc
          </a>{" "}
          &middot; Powered by{" "}
          <a
            href="https://www.hiro.so"
            className="text-[#58a6ff] hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Hiro
          </a>
        </p>
      </div>
    </footer>
  );
}

import { Separator } from "./ui/separator";

export default function Footer() {
  return (
    <footer className="mt-auto bg-background py-8">
      <Separator className="mb-8" />
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          {/* Brand */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.svg" alt="" width={20} height={20} className="opacity-60" />
            <span>Source of Clarity</span>
          </div>

          {/* Social links */}
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/cocoa007/source-of-clarity"
              className="text-muted-foreground hover:text-foreground transition-colors"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
            </a>
            <a
              href="https://x.com/cocoa007_bot"
              className="text-muted-foreground hover:text-foreground transition-colors"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="X"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </a>
            <a
              href="https://bsky.app/profile/cocoa007.bsky.social"
              className="text-muted-foreground hover:text-foreground transition-colors"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Bluesky"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 1.561 1.266.902 1.565.139 1.908 0 3.08 0 3.768c0 .69.378 5.65.624 6.479.785 2.627 3.6 3.476 6.168 3.125-4.468.713-5.616 3.079-3.14 5.44C6.397 21.298 9.489 22 11.06 18.697c.218-.459.394-.89.527-1.283a8 8 0 00.413 1.283C13.573 22 16.665 21.298 19.41 18.812c2.476-2.361 1.328-4.727-3.14-5.44 2.568.351 5.383-.498 6.168-3.125.246-.828.624-5.788.624-6.479 0-.688-.139-1.86-.902-2.203-.659-.3-1.664-.62-4.3 1.24C15.113 4.747 12.154 8.686 12.067 10.8z"/></svg>
            </a>
          </div>

          {/* Attribution */}
          <div className="text-center text-sm text-muted-foreground sm:text-right">
            Built by{" "}
            <a
              href="https://github.com/cocoa007"
              className="text-accent hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              cocoa007.btc
            </a>{" "}
            &middot; Powered by{" "}
            <a
              href="https://www.stacks.co"
              className="text-accent hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Stacks
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

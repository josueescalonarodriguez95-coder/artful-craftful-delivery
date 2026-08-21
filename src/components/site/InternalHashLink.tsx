import { Link } from "react-router-dom";
import type { ReactNode } from "react";

const STORAGE_KEY = "rde-scroll-hash";

interface InternalHashLinkProps {
  to: string;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  ariaLabel?: string;
}

export const InternalHashLink = ({
  to,
  children,
  className,
  onClick,
  ariaLabel,
}: InternalHashLinkProps) => {
  return (
    <Link
      to={to}
      className={className}
      aria-label={ariaLabel}
      onClick={() => {
        try {
          const hash = to.split("#")[1];
          if (hash) {
            sessionStorage.setItem(STORAGE_KEY, `#${hash}`);
          }
        } catch {
          /* ignore */
        }
        onClick?.();
      }}
    >
      {children}
    </Link>
  );
};

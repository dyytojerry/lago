import { useRouter } from "next/navigation";
import { useLoading } from "../providers/LoadingProvider";
import { ReactNode } from "react";
import { useAuth } from "../providers/AuthProvider";

interface NavigationLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent) => any;
}

export function useNavigationRouter() {
  const router = useRouter();
  const { audio } = useAuth();

  const { startLoading, stopLoading } = useLoading();

  function navigationRoute(
    path: string,
    options: {
      scroll?: boolean;
      delay?: number;
      replace?: boolean;
    } = { delay: 0 }
  ) {
    const pathname = window.location.pathname;
    if (path === pathname) {
      window.location.href = path;
      return;
    }
    // Start loading immediately
    startLoading();

    // Use setTimeout to ensure loading state is visible
    setTimeout(() => {
      if (path.startsWith("/study")) {
        audio.playBackgroundMusic();
        audio.playClickSound();
      } else {
        audio.stopBackgroundMusic();
        audio.stopClickSound();
      }
      if (options.replace) {
        router.replace(path, options);
        stopLoading();
      } else {
        router.push(path, options);
        setTimeout(() => {
          // Stop loading after a short delay to ensure smooth transition
          const interval = setInterval(() => {
            if (pathname !== window.location.pathname) {
              clearInterval(interval);
              stopLoading();
            }
          }, 300);
        }, options.delay);
      }
    }, 100);
  }

  return {
    ...router,
    push: navigationRoute,
    replace: (
      path: string,
      options: {
        scroll?: boolean;
        delay?: number;
        replace?: boolean;
      }
    ) => navigationRoute(path, { ...options, replace: true }),
  };
}

function NavigationLink({
  href,
  children,
  className,
  onClick,
}: NavigationLinkProps) {
  const router = useNavigationRouter();
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const shouldRouter = onClick?.(e);
    if (shouldRouter !== false) {
      router.push(href);
    }
  };
  const Link = NavigationLink.Link;

  return (
    <Link href={href} onClick={handleClick} className={className} prefetch>
      {children}
    </Link>
  );
}

NavigationLink.Link = (props: any) => {
  return <a {...props} />;
};

export default NavigationLink;

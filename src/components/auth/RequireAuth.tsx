"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useMeQuery } from "@/store/api/authApi";
import { setCredentials } from "@/store/authSlice";

type RequireAuthProps = {
  children: React.ReactNode;
};

const RequireAuth: React.FC<RequireAuthProps> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { accessToken, user } = useAppSelector((state) => state.auth);

  // If we don't have an accessToken yet, try to hydrate from cookies via /me
  const {
    data: me,
    isLoading: isLoadingMe,
    isError: isMeError,
  } = useMeQuery(undefined, {
    skip: !!accessToken || !!user,
  });

  // When /me succeeds, hydrate auth state with user info (tokens stay in cookies)
  useEffect(() => {
    if (!accessToken && me) {
      dispatch(
        setCredentials({
          accessToken: "",
          refreshToken: "",
          expiresAt: "",
          user: me,
        })
      );
    }
  }, [accessToken, me, dispatch]);

  // Redirect to signin only when we are sure there is no valid session
  useEffect(() => {
    if (!accessToken && !isLoadingMe && (isMeError || !me)) {
      const redirect = encodeURIComponent(pathname || "/");
      router.replace(`/signin?redirect=${redirect}`);
    }
  }, [accessToken, isLoadingMe, isMeError, me, pathname, router]);

  if (!accessToken && isLoadingMe) {
    return (
      <div className="flex min-h-[400px] items-center justify-center text-sm text-gray-500">
        Đang tải phiên đăng nhập...
      </div>
    );
  }

  if (!accessToken && !isLoadingMe && (isMeError || !me)) {
    return (
      <div className="flex min-h-[400px] items-center justify-center text-sm text-gray-500">
        Vui lòng đăng nhập để bắt đầu luyện tập.
      </div>
    );
  }

  return <>{children}</>;
};

export default RequireAuth;


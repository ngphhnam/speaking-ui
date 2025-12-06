"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useMeQuery } from "@/store/api/authApi";
import { setCredentials } from "@/store/authSlice";
import { useTranslation } from "react-i18next";

type RequireAdminProps = {
  children: React.ReactNode;
};

const RequireAdmin: React.FC<RequireAdminProps> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { accessToken, user } = useAppSelector((state) => state.auth);
  const { t } = useTranslation();

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

  // Check admin access
  useEffect(() => {
    const currentUser = user ?? me;
    
    // Only redirect to signin if we're sure there's no valid session
    // Don't redirect if we're still loading or if we have user data
    if (!isLoadingMe && !currentUser && (isMeError || !me)) {
      const redirect = encodeURIComponent(pathname || "/");
      router.replace(`/signin?redirect=${redirect}`);
      return;
    }

    // If we have user data and they're not admin, redirect to home
    if (currentUser && currentUser.role !== "Admin") {
      router.replace("/");
    }
  }, [user, me, isLoadingMe, isMeError, pathname, router]);

  const currentUser = user ?? me;
  const isLoading = !currentUser && isLoadingMe;

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center text-sm text-gray-500">
        {t("auth.checkingAccess", "Đang kiểm tra quyền truy cập...")}
      </div>
    );
  }

  if (!currentUser && !isLoadingMe && (isMeError || !me)) {
    return (
      <div className="flex min-h-[400px] items-center justify-center text-sm text-gray-500">
        {t("auth.pleaseSignIn", "Vui lòng đăng nhập để tiếp tục.")}
      </div>
    );
  }

  if (!currentUser || currentUser.role !== "Admin") {
    return (
      <div className="flex min-h-[400px] items-center justify-center text-sm text-gray-500">
        {t("auth.accessDenied", "Bạn không có quyền truy cập trang này.")}
      </div>
    );
  }

  return <>{children}</>;
};

export default RequireAdmin;






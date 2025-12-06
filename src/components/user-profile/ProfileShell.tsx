"use client";

import RequireAdmin from "@/components/auth/RequireAdmin";
import UsersManage from "@/components/user-profile/UsersManage";
import { useTranslation } from "react-i18next";

const ProfileShell = () => {
  const { t } = useTranslation();

  return (
    <RequireAdmin>
      <UsersManage />
    </RequireAdmin>
  );
};

export default ProfileShell;



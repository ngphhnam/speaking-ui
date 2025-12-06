"use client";

import SpeakingCoach from "@/components/speaking/SpeakingCoach";
import { useMeQuery } from "@/store/api/authApi";
import { useAppSelector } from "@/store/hooks";

const HomeShell = () => {
  const { user } = useAppSelector((state) => state.auth);

  // Gọi lại API /me trên trang home nếu chưa có user trong Redux
  const { data: me } = useMeQuery(undefined, {
    skip: !!user,
  });

  const displayUser = user ?? me;
  const displayName = displayUser?.fullName || displayUser?.email;

  return (
    <div className="space-y-4">
      {displayName && (
        <p className="text-sm text-gray-700">
          Xin chào, <span className="font-semibold">{displayName}</span> 👋
        </p>
      )}
      <SpeakingCoach />
    </div>
  );
};

export default HomeShell;



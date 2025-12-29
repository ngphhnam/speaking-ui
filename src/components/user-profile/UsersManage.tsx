"use client";

import { useState, useEffect } from "react";
import { useGetUsersQuery } from "@/store/api/userApi";
import { useTranslation } from "react-i18next";
import Button from "@/components/ui/button/Button";

export default function UsersManage() {
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 20;

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data, isLoading, error } = useGetUsersQuery(
    { page, pageSize },
    { skip: !mounted }
  );

  const totalPages = data ? Math.ceil(data.totalCount / pageSize) : 0;

  if (!mounted || isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded dark:bg-gray-700 w-64 animate-pulse" />
        <div className="h-96 bg-gray-200 rounded dark:bg-gray-700 animate-pulse" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {t("users.loadingErrorTitle", "Error loading users")}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t("users.loadingError", "Unable to load users. Please try again later.")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900 dark:text-white">
            {t("users.manageUsers", "User Management")}
          </h1>
          <p className="text-base text-gray-600 dark:text-gray-300 mt-1">
            {t("users.manageUsersSubtitle", "View and manage all users")}
          </p>
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  {t("users.email", "Email")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  {t("users.fullName", "Full Name")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  {t("users.role", "Role")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:bg-gray-900">
              {data && data.items.length > 0 ? (
                data.items.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {user.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {user.fullName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          user.role === "Admin"
                            ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
                            : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-sm text-gray-500 dark:text-gray-400">
                    {t("users.noUsers", "No users found")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data && data.totalCount > 0 && (
          <div className="flex items-center justify-between border-t border-gray-200 bg-white px-6 py-4 dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <span>
                {t("users.showing", "Showing")} {(page - 1) * pageSize + 1} -{" "}
                {Math.min(page * pageSize, data.totalCount)} {t("users.of", "of")}{" "}
                {data.totalCount} {t("users.users", "users")}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                {t("users.previous", "Previous")}
              </Button>
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {t("users.page", "Page")} {page} {t("users.of", "of")} {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
              >
                {t("users.next", "Next")}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}





















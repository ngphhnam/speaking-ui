import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tự Luyện IELTS Speaking",
  description: "Luyện nói IELTS với chấm điểm, góp ý, mock test và sổ từ vựng.",
};

type Feature = {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  cta: string;
};

const IconWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600 shadow-theme-xs dark:bg-brand-500/15 dark:text-brand-300">
    {children}
  </div>
);

const FeatureCard = ({ feature }: { feature: Feature }) => (
  <div className="group rounded-2xl border-2 border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-theme-md dark:border-gray-800 dark:bg-gray-900">
    <div className="flex items-start gap-4">
      <IconWrapper>{feature.icon}</IconWrapper>
      <div className="min-w-0 flex-1">
        <div className="text-base font-semibold text-gray-900 dark:text-white">
          {feature.title}
        </div>
        <div className="mt-1 text-sm leading-6 text-gray-600 dark:text-gray-300">
          {feature.description}
        </div>
        <Link
          href={feature.href}
          className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-300 dark:hover:text-brand-200"
        >
          {feature.cta}
          <svg
            className="h-4 w-4 transition group-hover:translate-x-0.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 7l5 5m0 0l-5 5m5-5H6"
            />
          </svg>
        </Link>
      </div>
    </div>
  </div>
);

export default function PublicHomePage() {
  const features: Feature[] = [
    {
      title: "Luyện Speaking theo Part 1/2/3",
      description:
        "Chọn topic, trả lời theo câu hỏi, ghi âm hoặc upload file để theo dõi tiến bộ.",
      href: "/practice-by-questions",
      cta: "Bắt đầu luyện tập",
      icon: (
        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 1v22m6-11a6 6 0 11-12 0V7a6 6 0 1112 0v5z"
          />
        </svg>
      ),
    },
    {
      title: "Thi thử (Mock Test)",
      description:
        "Làm full test theo format IELTS, theo thời gian thực và xem kết quả sau khi hoàn thành.",
      href: "/mock-test",
      cta: "Vào mock test",
      icon: (
        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a3 3 0 006 0M9 5a3 3 0 016 0"
          />
        </svg>
      ),
    },
    {
      title: "Tạo sample answer & gợi ý cải thiện",
      description:
        "Tham khảo cách trả lời theo hướng mạch lạc hơn, từ vựng tốt hơn và phù hợp từng part.",
      href: "/topics",
      cta: "Khám phá bộ đề",
      icon: (
        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 10h8M8 14h5M10 3h4a2 2 0 012 2v16l-4-2-4 2V5a2 2 0 012-2z"
          />
        </svg>
      ),
    },
    {
      title: "Sổ từ vựng cá nhân",
      description:
        "Lưu từ vựng đã tạo (kèm nghĩa tiếng Việt) và ôn lại theo ngày/tuần để nhớ lâu.",
      href: "/vocabulary-book",
      cta: "Mở sổ từ vựng",
      icon: (
        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6h8M12 10h8M12 14h6M4 6h4v14H6a2 2 0 01-2-2V6z"
          />
        </svg>
      ),
    },
    {
      title: "Theo dõi tiến độ",
      description:
        "Xem lịch sử luyện tập, chuỗi ngày học, và những điểm mạnh/yếu để có kế hoạch cải thiện.",
      href: "/dashboard",
      cta: "Xem dashboard",
      icon: (
        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M11 3a1 1 0 011 1v16a1 1 0 11-2 0V4a1 1 0 011-1zm6 6a1 1 0 011 1v10a1 1 0 11-2 0V10a1 1 0 011-1zM5 13a1 1 0 011 1v6a1 1 0 11-2 0v-6a1 1 0 011-1z"
          />
        </svg>
      ),
    },
    {
      title: "Quản lý topic & câu hỏi",
      description:
        "Tạo/sửa topic, phân Part rõ ràng và bổ sung câu hỏi để học có hệ thống hơn.",
      href: "/topics",
      cta: "Khám phá topics",
      icon: (
        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 7a2 2 0 012-2h5l2 2h7a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"
          />
        </svg>
      ),
    },
  ];

  const stats = [
    { label: "Part luyện tập", value: "1 / 2 / 3" },
    { label: "Chế độ", value: "Practice + Mock Test" },
    { label: "Ghi âm", value: "Upload / Record" },
    { label: "Ôn từ vựng", value: "Vocabulary Book" },
  ];

  return (
    <main className="relative overflow-hidden">
      {/* Background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-20 left-1/2 h-[520px] w-[920px] -translate-x-1/2 rounded-full bg-gradient-to-r from-brand-200/50 via-purple-200/40 to-sky-200/40 blur-3xl dark:from-brand-900/35 dark:via-purple-900/25 dark:to-sky-900/20"
      />

      <div className="mx-auto max-w-6xl px-6 py-12">
        {/* HERO */}
        <section className="relative rounded-3xl border-2 border-gray-200 bg-white p-8 shadow-theme-sm dark:border-gray-800 dark:bg-gray-900 sm:p-10">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-wide text-brand-600 dark:text-brand-300">
                Tự luyện
              </p>
              <h1 className="mt-2 text-4xl font-bold text-gray-900 dark:text-white sm:text-5xl">
                IELTS Speaking Practice
              </h1>
              <p className="mt-4 text-base leading-7 text-gray-600 dark:text-gray-300">
                Luyện Speaking theo Part 1/2/3, thi thử full test, tham khảo sample
                answer, tạo từ vựng (kèm nghĩa tiếng Việt) và lưu vào sổ để ôn tập.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href="/signin"
                  className="rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-theme-xs transition hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-600"
                >
                  Đăng nhập
                </Link>
                <Link
                  href="/signup"
                  className="rounded-xl border-2 border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-700 transition hover:border-brand-300 hover:text-brand-600 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-200 dark:hover:border-brand-500 dark:hover:text-brand-300"
                >
                  Đăng ký
                </Link>
                <Link
                  href="/dashboard"
                  className="rounded-xl border-2 border-brand-200 bg-brand-50 px-6 py-3 text-sm font-semibold text-brand-700 transition hover:bg-brand-100 dark:border-brand-900/40 dark:bg-brand-900/20 dark:text-brand-200 dark:hover:bg-brand-900/30"
                >
                  Vào luyện tập
                </Link>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {stats.map((s) => (
                  <div
                    key={s.label}
                    className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-950"
                  >
                    <div className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                      {s.label}
                    </div>
                    <div className="mt-1 text-sm font-bold text-gray-900 dark:text-white">
                      {s.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right preview */}
            <div className="relative">
              <div className="rounded-3xl border-2 border-gray-200 bg-gradient-to-br from-white to-gray-50 p-6 shadow-theme-md dark:border-gray-800 dark:from-gray-950 dark:to-gray-900">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">
                    Lộ trình luyện Speaking
                  </div>
                  <span className="rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-700 dark:bg-brand-500/15 dark:text-brand-200">
                    5–15 phút/ngày
                  </span>
                </div>

                <div className="mt-5 space-y-3">
                  {[
                    {
                      title: "Chọn topic & part",
                      desc: "Part 1: warm-up • Part 2: long turn • Part 3: discussion",
                    },
                    {
                      title: "Ghi âm / Upload",
                      desc: "Lưu lại câu trả lời để so sánh theo thời gian",
                    },
                    {
                      title: "Xem góp ý & từ vựng",
                      desc: "Tổng hợp điểm mạnh/yếu và từ vựng cần ôn",
                    },
                  ].map((item, idx) => (
                    <div
                      key={item.title}
                      className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-950"
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-lg bg-brand-600 text-xs font-bold text-white dark:bg-brand-500">
                          {idx + 1}
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-gray-900 dark:text-white">
                            {item.title}
                          </div>
                          <div className="mt-1 text-xs leading-5 text-gray-600 dark:text-gray-300">
                            {item.desc}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 grid grid-cols-3 gap-3">
                  {[
                    { label: "Fluency", value: "↑" },
                    { label: "Vocabulary", value: "↑" },
                    { label: "Grammar", value: "↑" },
                  ].map((kpi) => (
                    <div
                      key={kpi.label}
                      className="rounded-2xl border border-gray-200 bg-white p-3 text-center dark:border-gray-800 dark:bg-gray-950"
                    >
                      <div className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                        {kpi.label}
                      </div>
                      <div className="mt-1 text-lg font-bold text-brand-600 dark:text-brand-300">
                        {kpi.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-brand-200/50 blur-2xl dark:bg-brand-900/30"
              />
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section className="mt-10">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Tính năng nổi bật
              </h2>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                Tập trung đúng chỗ để cải thiện nhanh và bền vững.
              </p>
            </div>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 self-start rounded-xl border-2 border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:border-brand-300 hover:text-brand-600 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200 dark:hover:border-brand-500 dark:hover:text-brand-300 sm:self-auto"
            >
              Xem tiến độ
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <FeatureCard key={feature.title} feature={feature} />
            ))}
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="mt-12 rounded-3xl border-2 border-gray-200 bg-white p-8 shadow-theme-sm dark:border-gray-800 dark:bg-gray-900 sm:p-10">
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-1">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Cách hoạt động
              </h2>
              <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">
                Một flow đơn giản để bạn luyện đều mỗi ngày và nhìn thấy kết quả.
              </p>
            </div>

            <div className="lg:col-span-2">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {[
                  {
                    title: "1) Chọn mục tiêu",
                    desc: "Chọn Part/Topic phù hợp và bắt đầu luyện.",
                  },
                  {
                    title: "2) Thực hành",
                    desc: "Ghi âm, upload, làm mock test theo thời gian.",
                  },
                  {
                    title: "3) Ôn & cải thiện",
                    desc: "Xem góp ý, lưu từ vựng và luyện lại.",
                  },
                ].map((step) => (
                  <div
                    key={step.title}
                    className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-950"
                  >
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">
                      {step.title}
                    </div>
                    <div className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                      {step.desc}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="mt-12">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Câu hỏi thường gặp
              </h2>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                Một vài câu hỏi phổ biến trước khi bạn bắt đầu.
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
            {[
              {
                q: "Mình nên luyện bao lâu mỗi ngày?",
                a: "Chỉ cần 5–15 phút/ngày. Quan trọng nhất là luyện đều và xem lại phần góp ý để sửa.",
              },
              {
                q: "Practice và Mock Test khác nhau thế nào?",
                a: "Practice giúp luyện theo từng câu/part; Mock Test mô phỏng full test theo thời gian để bạn làm quen áp lực.",
              },
              {
                q: "Từ vựng lưu ở đâu?",
                a: "Bạn có thể lưu vào sổ từ vựng và ôn lại bất cứ lúc nào trong mục Vocabulary Book.",
              },
              {
                q: "Mình có thể quản lý topic/câu hỏi không?",
                a: "Có. Bạn có thể tạo/sửa topic, quản lý câu hỏi theo Part để học theo hệ thống.",
              },
            ].map((item) => (
              <div
                key={item.q}
                className="rounded-2xl border-2 border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900"
              >
                <div className="text-base font-semibold text-gray-900 dark:text-white">
                  {item.q}
                </div>
                <div className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">
                  {item.a}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="mt-12">
          <div className="rounded-3xl border-2 border-brand-200 bg-gradient-to-br from-brand-50 to-white p-8 shadow-theme-sm dark:border-brand-900/40 dark:from-brand-900/25 dark:to-gray-900 sm:p-10">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Bắt đầu luyện ngay hôm nay
                </h2>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                  Đăng ký tài khoản để lưu lịch sử, theo dõi tiến độ và ôn từ vựng.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/signup"
                  className="rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-theme-xs transition hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-600"
                >
                  Tạo tài khoản
                </Link>
                <Link
                  href="/dashboard"
                  className="rounded-xl border-2 border-brand-200 bg-white px-6 py-3 text-sm font-semibold text-brand-700 transition hover:bg-brand-50 dark:border-brand-900/40 dark:bg-gray-950 dark:text-brand-200 dark:hover:bg-brand-900/20"
                >
                  Vào luyện tập
                </Link>
              </div>
            </div>
          </div>
        </section>

        <footer className="mt-10 pb-6 text-center text-xs text-gray-500 dark:text-gray-400">
          © {new Date().getFullYear()} Tự Luyện IELTS Speaking. All rights reserved.
        </footer>
      </div>
    </main>
  );
}


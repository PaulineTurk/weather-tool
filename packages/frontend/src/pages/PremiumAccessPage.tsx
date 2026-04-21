import { useNavigate } from 'react-router';
import styles from './PremiumAccessPage.module.css';

export function PremiumAccessPage() {
  const navigate = useNavigate();

  return (
    <main className="h-[100svh] overflow-hidden px-4 py-4 flex items-center justify-center">
      <section className="w-full max-w-5xl max-h-[calc(100svh-2rem)] rounded-2xl bg-white shadow-md overflow-hidden">
        <div className="grid gap-0 lg:grid-cols-2">
          <div className="p-6 sm:p-8 lg:p-10">
            <p className="text-xs font-semibold uppercase tracking-widest text-green-700">Premium access</p>
            <h1 className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl">
              Under construction — it&apos;s growing!
            </h1>
            <p className="mt-3 text-gray-600">
              We&apos;re building something new. Meanwhile, you can keep using the app as usual.
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="rounded-md bg-green-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                Back to home
              </button>
            </div>
          </div>

          <div className="relative bg-gradient-to-b from-gray-50 to-white">
            <div className={styles.scene} aria-hidden="true">
              <div className={styles.plotLines} />
              <div className={styles.tractorWrap}>
                <svg
                  className={styles.tractorSvg}
                  viewBox="0 0 420 160"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* ground */}
                  <path d="M10 125H410" stroke="currentColor" strokeWidth="2" opacity="0.25" />

                  {/* tractor body */}
                  <path
                    d="M235 104H312C325 104 335 94 335 81V64H290L275 40H245V104Z"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinejoin="round"
                  />
                  <path d="M290 64H350" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                  <path d="M350 64V90H330" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />

                  {/* cabin */}
                  <path
                    d="M255 40H290L305 64H255V40Z"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinejoin="round"
                  />
                  <path d="M268 46V64" stroke="currentColor" strokeWidth="2" opacity="0.7" />

                  {/* plow */}
                  <path d="M340 94L380 118" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                  <path d="M378 117L402 112" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />

                  {/* wheels */}
                  <g className={styles.wheelBig}>
                    <circle cx="265" cy="118" r="26" stroke="currentColor" strokeWidth="3" />
                    <circle cx="265" cy="118" r="10" stroke="currentColor" strokeWidth="3" opacity="0.7" />
                    <path d="M265 92V144" stroke="currentColor" strokeWidth="2" opacity="0.7" />
                    <path d="M239 118H291" stroke="currentColor" strokeWidth="2" opacity="0.7" />
                    <path d="M247 100L283 136" stroke="currentColor" strokeWidth="2" opacity="0.5" />
                    <path d="M283 100L247 136" stroke="currentColor" strokeWidth="2" opacity="0.5" />
                  </g>
                  <g className={styles.wheelSmall}>
                    <circle cx="335" cy="118" r="18" stroke="currentColor" strokeWidth="3" />
                    <circle cx="335" cy="118" r="7" stroke="currentColor" strokeWidth="3" opacity="0.7" />
                    <path d="M335 100V136" stroke="currentColor" strokeWidth="2" opacity="0.7" />
                    <path d="M317 118H353" stroke="currentColor" strokeWidth="2" opacity="0.7" />
                  </g>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

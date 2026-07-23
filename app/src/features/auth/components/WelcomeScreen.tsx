import Image from 'next/image'
import Link from 'next/link'
import { messages } from '@/constants/messages'

const stageEntries = Object.entries(messages.stages.stageNames)

export function WelcomeScreen() {
  return (
    <div className="flex min-h-screen flex-1 flex-col items-center bg-bg text-text">
      <div className="flex items-center gap-3 pt-7">
        <Image
          src="/icon.png"
          alt={messages.common.brand}
          width={80}
          height={80}
          className="block rounded-md"
        />
        <div className="flex flex-col">
          <span className="font-heading text-2xl font-medium tracking-[0.02em]">
            {messages.common.brand}
          </span>
          <span className="text-xs text-text/55">
            {messages.common.brandFullName}
          </span>
        </div>
      </div>

      <div className="flex max-w-170 flex-1 flex-col items-center justify-center px-8 py-10 text-center">
        <h1 className="mb-5 font-heading text-[56px] font-semibold leading-[1.1] tracking-[-0.02em]">
          {messages.welcome.headingLines.map((line, i) => (
            <span key={line}>
              {line}
              {i < messages.welcome.headingLines.length - 1 && <br />}
            </span>
          ))}
        </h1>
        <p className="mb-10 max-w-115 text-[17px] font-normal leading-relaxed text-text/55">
          {messages.welcome.descriptionLines.map((line, i) => (
            <span key={line}>
              {line}
              {i < messages.welcome.descriptionLines.length - 1 && <br />}
            </span>
          ))}
        </p>
        <Link
          href="/login"
          className="inline-flex items-center justify-center gap-1.5 rounded-full border border-accent px-7 py-2.75 font-heading text-sm font-medium text-accent transition-colors hover:bg-accent/12"
        >
          {messages.welcome.loginButton}
        </Link>
      </div>

      <div className="w-full max-w-230 px-8 pb-14">
        <div className="flex items-end">
          {stageEntries.map(([key, label], i) => (
            <div key={key} className="flex flex-1 items-end">
              <div className="flex min-w-0 flex-1 flex-col items-center gap-1.5">
                <span className="text-[10px] font-normal text-text/35">
                  0{i + 1}
                </span>
                <span className="whitespace-nowrap text-[13px] text-text/78">
                  {label}
                </span>
              </div>
              {i < stageEntries.length - 1 && (
                <div className="h-6 w-px flex-none bg-divider" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

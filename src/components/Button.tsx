import Link from "next/link";

type Variant = "primary" | "outline" | "outline-light" | "navy";

const base =
  "group/btn inline-flex min-h-12 whitespace-nowrap items-center justify-center gap-2 rounded-btn px-6 text-base font-medium transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50";

const variants: Record<Variant, string> = {
  primary: "bg-turquoise text-navy hover:bg-[#0FA3A9] active:bg-[#0E9398]",
  navy: "bg-navy text-white hover:bg-navy-deep",
  outline: "border border-navy/30 text-navy hover:border-navy hover:bg-navy/5",
  "outline-light": "border border-white/35 text-white hover:border-white hover:bg-white/10",
};

export function buttonClass(variant: Variant = "primary", extra = "") {
  return `${base} ${variants[variant]} ${extra}`;
}

export function ButtonLink({
  href,
  variant = "primary",
  className = "",
  children,
  ...rest
}: {
  href: string;
  variant?: Variant;
  className?: string;
  children: React.ReactNode;
} & Omit<React.ComponentProps<typeof Link>, "href" | "className" | "children">) {
  return (
    <Link href={href} className={buttonClass(variant, className)} {...rest}>
      {children}
    </Link>
  );
}

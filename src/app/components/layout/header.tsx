import Link from "next/link";

export default function Header() {
    return (
        <header className="w-full text-white z-50">
            <div className="flex items-center justify-between mx-auto py-4 w-[90%] lg:w-3/4">
                <Link href={"/"} className="w-87.5">
                    <img src="/logo-full-blue.png" alt="logo" className="w-full" />
                </Link>

                <div className="hidden lg:block">
                    <nav className="flex items-center gap-10 tracking-wider font-medium text-xl text-(--primary)">
                        <Link href={"https://phoenixagentics.com/#contact"}
                            className=" transition-all hover:text-(--gold)"
                        >
                            Contact
                        </Link>
                        <Link href={"https://phoenixagentics.com/privacy-policy"}
                            className=" transition-all hover:text-(--gold)"
                        >
                            Privacy Policy
                        </Link>
                        <Link href={"https://phoenixagentics.com/terms-of-use"}
                            className=" transition-all hover:text-(--gold)"
                        >
                            Terms of Use
                        </Link>
                    </nav>
                </div>
            </div>
        </header>
    )
}
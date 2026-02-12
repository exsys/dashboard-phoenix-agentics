import Link from "next/link";

export default function Footer() {
    return (
        <footer>
            <div className="w-[90%] lg:w-3/4 mx-auto pt-16">
                <div className="flex flex-col-reverse lg:flex-col">
                    <div className="flex flex-col xl:flex-row items-center gap-10 border-b border-(--primary) pb-6">
                        <Link href={"/"}>
                            <img src="/logo-full-blue.png" alt="logo" className="w-92" />
                        </Link>

                        <div className="w-full xl:w-3/5 text-center xl:text-start ml-auto text-lg">
                            Important Notice: This website is for informational purposes only and does not constitute
                            an offer or solicitation to sell interests in the Phoenix Agentics Commodity Pool.
                            Interests are offered privately only to persons who qualify as
                            Qualified Eligible Persons (QEPs) under CFTC Regulation 4.7. The Commodity Futures
                            Trading Commission has not passed upon the merits of participating in this pool
                            or the adequacy or accuracy of these materials.
                        </div>
                    </div>

                    <div className="flex flex-col-reverse lg:flex-row items-center justify-between pt-6 pb-6 lg:pb-12">
                        <div></div>

                        <div className="text-xl font-medium">
                            Copyright © 2025 Phoenix Agentics Capital Partners LLC
                        </div>

                        <div className="w-full xl:w-120 text-center mb-8 lg:mb-0 pb-10 lg:pb-0 border-b border-(--primary) lg:border-0">
                            <nav className="flex gap-10 text-xl">
                                <Link href={"https://phoenixagentics.com/#contact"}
                                    className="transition-all flex-1 underline lg:no-underline hover:text-(--gold)"
                                >
                                    Contact
                                </Link>
                                <Link href={"https://phoenixagentics.com/privacy-policy"}
                                    className="transition-all flex-1 underline lg:no-underline hover:text-(--gold)"
                                >
                                    Privacy Policy
                                </Link>
                                <Link href={"https://phoenixagentics.com/terms-of-use"}
                                    className="transition-all flex-1 underline lg:no-underline hover:text-(--gold)"
                                >
                                    Terms of Use
                                </Link>
                            </nav>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    )
}
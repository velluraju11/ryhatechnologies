import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button"; // Assuming ui setup exists as seen in other files
import { AlertTriangle, ArrowLeft } from "lucide-react";
import SEO from "../components/SEO";

export default function NotFoundPage() {
    return (
        <>
            <SEO
                title="404 - Page Not Found"
                description="The page you are looking for does not exist."
                robots="noindex, follow"
            />
            <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white px-4 text-center">
                <div className="space-y-6 max-w-lg">
                    <div className="flex justify-center mb-6">
                        <div className="h-24 w-24 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                            <AlertTriangle className="h-12 w-12 text-white/50" />
                        </div>
                    </div>

                    <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
                        404
                    </h1>

                    <div className="space-y-2">
                        <h2 className="text-xl md:text-2xl font-semibold text-white/90">
                            System Path Not Found
                        </h2>
                        <p className="text-white/60">
                            The requested resource is unavailable or has been moved securely.
                        </p>
                    </div>

                    <div className="pt-8">
                        <Link to="/">
                            <Button size="lg" className="bg-white text-black hover:bg-white/90 gap-2">
                                <ArrowLeft className="h-4 w-4" />
                                Return to Base System
                            </Button>
                        </Link>
                    </div>

                    <div className="mt-12 p-4 rounded-lg border border-white/5 bg-white/[0.02] text-xs font-mono text-white/30">
                        Error Code: 404_NOT_FOUND // ORIGIN: UNKNOWN
                    </div>
                </div>
            </div>
        </>
    );
}

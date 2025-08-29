import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertCircle, Home } from "lucide-react";

export default function NotFound() {
 return (
  <div className="h-[calc(100vh-200px)] flex items-center justify-center max-w-6xl bg-background border-x w-full mx-auto px-4 text-center">
   <div className="">
    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
     <AlertCircle className="w-8 h-8 text-muted-foreground" />
    </div>

    <h1 className="text-2xl font-bold text-foreground mb-2">Page Not Found</h1>

    <p className="text-muted-foreground mb-6">
     The page you&apos;re looking for doesn&apos;t exist or hasn&apos;t been
     added to our database yet.
    </p>

    <div className="mt-8">
     <Button asChild>
      <Link href="/" className="gap-2">
       <Home className="w-4 h-4" />
       Back to Home
      </Link>
     </Button>
    </div>
   </div>
  </div>
 );
}

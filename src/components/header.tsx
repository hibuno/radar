import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
 Dialog,
 DialogContent,
 DialogDescription,
 DialogHeader,
 DialogTitle,
 DialogTrigger,
} from "@/components/ui/dialog";
import Image from "next/image";

export function Header() {
 return (
  <div className="flex items-center justify-between border-b p-6 sticky top-0 z-50 max-w-6xl mx-auto border-x bg-background">
   <div className="flex items-center gap-4">
    <Link href="/" className="flex items-center gap-1">
     <Image
      src="/logo/logo-dark.svg"
      alt="The Spy Project"
      width={50}
      height={50}
     />
     <div>
      <h1 className="text-md font-serif font-bold text-foreground">
       <span>The Spy Project</span>
      </h1>
      <p className="text-muted-foreground text-xs">
       Discover rising stars and popular repositories
      </p>
     </div>
    </Link>
   </div>

   <Dialog>
    <DialogTrigger asChild>
     <Button variant="outline" size="sm">
      Contact Us
     </Button>
    </DialogTrigger>
    <DialogContent className="sm:max-w-md">
     <DialogHeader>
      <DialogTitle>Contact Us</DialogTitle>
      <DialogDescription asChild>
       <div className="space-y-2">
        <p>
         Have questions, want to report discrepancies or dislikes, or are you a
         promotion/sponsor looking to get in touch? We&apos;d love to hear from
         you!
        </p>
        <p className="text-sm text-muted-foreground">
         Reach out to us directly at:
        </p>
        <a
         href="mailto:muhibbudins1997@gmail.com"
         className="text-primary hover:underline font-medium"
        >
         muhibbudins1997@gmail.com
        </a>
       </div>
      </DialogDescription>
     </DialogHeader>
    </DialogContent>
   </Dialog>
  </div>
 );
}

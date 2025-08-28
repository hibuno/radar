export function Footer() {
 return (
  <footer className="border-t bg-background">
   <div className="container mx-auto px-4 py-6">
    <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
     <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
      <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
       Built with Next.js and Tailwind CSS. Discover trending GitHub
       repositories.
      </p>
     </div>
     <p className="text-center text-sm text-muted-foreground">
      © 2024 GitHub Trending. All rights reserved.
     </p>
    </div>
   </div>
  </footer>
 );
}

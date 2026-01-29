export function Footer() {
  return (
    <footer className="border-t py-6 md:py-8">
      <div className="container flex flex-col items-center gap-4 text-center">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} 오늘의 픽. All rights reserved.
        </p>
        <div className="flex gap-4 text-sm text-muted-foreground">
          <a href="#" className="hover:text-foreground transition-colors">
            소개
          </a>
          <a href="#" className="hover:text-foreground transition-colors">
            FAQ
          </a>
        </div>
      </div>
    </footer>
  );
}

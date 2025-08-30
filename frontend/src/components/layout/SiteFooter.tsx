// components/layout/SiteFooter.tsx
import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="mt-16 border-t bg-white">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <span className="h-6 w-6 rounded-sm bg-emerald-500 inline-block" />
              <span className="font-semibold">TPA</span>
            </div>
            <p className="text-sm text-neutral-600 max-w-sm">
              Yorem ipsum dolor sit amet, consectetur adipiscing elit.
            </p>
            <div className="mt-4 flex gap-3 text-neutral-500">
              <Link href="#" aria-label="LinkedIn">in</Link>
              <Link href="#" aria-label="Twitter">x</Link>
              <Link href="#" aria-label="Facebook">f</Link>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3 text-emerald-600">Solutions</h4>
            <ul className="space-y-2 text-sm text-neutral-600">
              <li><Link href="#">Yorem</Link></li>
              <li><Link href="#">Vorem</Link></li>
              <li><Link href="#">Corem</Link></li>
              <li><Link href="#">Sorem</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3 text-emerald-600">Company</h4>
            <ul className="space-y-2 text-sm text-neutral-600">
              <li><Link href="#">Jorem</Link></li>
              <li><Link href="#">Lorem</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3 text-emerald-600">Resources</h4>
            <ul className="space-y-2 text-sm text-neutral-600">
              <li><Link href="#">Vorem</Link></li>
              <li><Link href="#">Borem</Link></li>
              <li><Link href="#">Corem</Link></li>
              <li><Link href="#">Horem</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t pt-6 flex flex-col md:flex-row items-center justify-between text-sm text-neutral-500">
          <p>© {new Date().getFullYear()} TPA. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/terms">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

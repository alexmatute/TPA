import s from "./style/Footer.module.scss";

export default function Footer() {
  return (
    <footer className={s.root}>
      <div className={s.container}>
        <div className={s.grid}>
          <div>
            <a href="/" className={s.brand}>
              <img src="/logo_transparent@4x.png" alt="Brand" />
            </a>
            <p className={s.blurb}>
              Future-ready solutions for founders and teams. Content, growth and velocity.
            </p>
          </div>

          <nav className={s.cols}>
            <div>
              <div className={s.h}><h1 color="#00aa80">Solutions</h1></div>
              <ul>
                <li><a href="#">Discovery</a></li>
                <li><a href="#">Implementation</a></li>
                <li><a href="#">Training</a></li>
              </ul>
            </div>
            <div>
              <div className={s.h}>Company</div>
              <ul>
                <li><a href="#">About</a></li>
                <li><a href="#">Careers</a></li>
                <li><a href="#">Contact</a></li>
              </ul>
            </div>
            <div>
              <div className={s.h}>Resources</div>
              <ul>
                <li><a href="/learn">Blog</a></li>
                <li><a href="#">Docs</a></li>
                <li><a href="#">Guides</a></li>
              </ul>
            </div>
          </nav>
        </div>
      </div>
    </footer>
  );
}

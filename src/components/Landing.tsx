import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  LogIn,
  Sun,
  Moon,
  BookOpen,
  UsersRound,
  WifiOff,
  ChartNoAxesCombined,
  ShieldCheck,
  Globe,
  UserPlus,
  CirclePlus,
  TrendingUp,
  CircleCheck,
} from "lucide-react";
import { Button, IconButton, Menu, MenuItem } from "@mui/material";
import { useTranslation } from "react-i18next";
import ReferenceIcon from "./ReferenceIcon";
import "./Landing.css";

interface Props {
  dark: boolean;
  setMode: (mode: string) => void;
}

export default function Landing({ dark, setMode }: Props) {
  const { t, i18n } = useTranslation();
  const root = useRef<HTMLDivElement>(null);
  const [languageMenu, setLanguageMenu] = useState<HTMLElement | null>(null);
  const [currentYear] = useState(() => new Date().getFullYear());
  const featureIcons = [
    BookOpen,
    UsersRound,
    WifiOff,
    ChartNoAxesCombined,
    ShieldCheck,
    Globe,
  ];
  const stepIcons = [UserPlus, CirclePlus, TrendingUp, CircleCheck];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 },
    );
    root.current
      ?.querySelectorAll(".landing-reveal")
      .forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  const start = (
    <Button
      className="landing-primary"
      variant="contained"
      href="/register"
      endIcon={<ArrowRight size={19} />}
    >
      {t("landing.start")}
    </Button>
  );
  return (
    <div className={`landing ${dark ? "landing-dark" : ""}`} ref={root}>
      <div className="landing-grid-background" />
      <div className="landing-glow landing-glow-blue" />
      <div className="landing-glow landing-glow-gold" />
      <nav className="landing-nav landing-container">
        <a href="/" className="landing-brand">
          <img src="/adl5-8-logo.svg" alt="Adl 5:8" />
          Adl 5:8
        </a>
        <div className="landing-nav-actions">
          <Button
            className="landing-language"
            aria-label={t("language")}
            onClick={(event) => setLanguageMenu(event.currentTarget)}
          >
            <ReferenceIcon name="language" size={19} />
            <span>
              {i18n.language === "tg" ? "TJ" : i18n.language.toUpperCase()}
            </span>
          </Button>
          <IconButton
            className="landing-theme"
            aria-label={t(dark ? "light" : "dark")}
            onClick={() => setMode(dark ? "light" : "dark")}
          >
            {dark ? <Moon size={19} /> : <Sun size={19} />}
          </IconButton>
          <Button className="landing-register" href="/register">
            {t("register")}
          </Button>
          <Button
            className="landing-login"
            variant="outlined"
            href="/login"
            startIcon={<LogIn size={17} />}
          >
            {t("login")}
          </Button>
        </div>
      </nav>
      <section className="landing-hero landing-container">
        <div className="landing-badge">
          <i />
          {t("landing.badge")}
        </div>
        <h1>
          {t("landing.heroTitle")}
          <br />
          <span>{t("landing.heroAccent")}</span>
        </h1>
        <p className="landing-intro">{t("landing.intro")}</p>
        <div className="landing-hero-actions">
          {start}
          <Button href="/register">{t("landing.create")}</Button>
        </div>
        <div className="landing-tags">
          {["offline", "multilingual", "sync", "safe"].map((key) => (
            <span key={key}>{t(`landing.${key}`)}</span>
          ))}
        </div>
      </section>
      <section id="features" className="landing-features landing-container">
        <div className="landing-section-title landing-reveal">
          <p>{t("landing.features")}</p>
          <h2>
            {t("landing.featuresTitle")}{" "}
            <span>{t("landing.featuresAccent")}</span>
          </h2>
        </div>
        <div className="landing-feature-grid">
          {featureIcons.map((Icon, index) => (
            <article
              key={index}
              className={`landing-feature landing-reveal feature-${index}`}
              style={{ transitionDelay: `${(index % 3) * 70}ms` }}
            >
              <span className="landing-feature-icon">
                <Icon size={24} />
              </span>
              <h3>{t(`landing.feature${index}Title`)}</h3>
              <p>{t(`landing.feature${index}Text`)}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="landing-stats landing-reveal">
        <div className="landing-container landing-stat-grid">
          {["10K+", "50K+", "99.9%", "3"].map((value, index) => (
            <div key={value}>
              <strong>{value}</strong>
              <p>{t(`landing.stat${index}Title`)}</p>
              <small>{t(`landing.stat${index}Text`)}</small>
            </div>
          ))}
        </div>
      </section>
      <section id="steps" className="landing-steps landing-container">
        <div className="landing-section-title landing-reveal">
          <p>{t("landing.how")}</p>
          <h2>
            {t("landing.stepsTitle")} <span>{t("landing.stepsAccent")}</span>
          </h2>
        </div>
        <div className="landing-step-grid">
          {stepIcons.map((Icon, index) => (
            <article
              className="landing-step landing-reveal"
              key={index}
              style={{ transitionDelay: `${index * 70}ms` }}
            >
              <div className="landing-step-top">
                <b>0{index + 1}</b>
                <Icon size={25} />
              </div>
              <h3>{t(`landing.step${index}Title`)}</h3>
              <p>{t(`landing.step${index}Text`)}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="landing-cta landing-container landing-reveal">
        <div>
          <h2>
            {t("landing.ctaTitle")}
            <br />
            <span>{t("landing.ctaAccent")}</span>
          </h2>
          <p>{t("landing.ctaText")}</p>
          <div className="landing-hero-actions">
            {start}
            <Button variant="outlined" href="/login">
              {t("landing.signIn")}
            </Button>
          </div>
        </div>
      </section>
      <footer className="landing-footer landing-container">
        <div className="landing-footer-grid">
          <div className="landing-footer-about">
            <a href="/" className="landing-brand">
              Adl 5:8
            </a>
            <p>{t("landing.footerText")}</p>
          </div>
          {["product", "company", "support"].map((group, index) => (
            <div key={group}>
              <h4>{t(`landing.${group}`)}</h4>
              {[0, 1, 2, 3].map((item) => (
                <p className="landing-footer-item" key={item}>
                  {t(`landing.footer${index}${item}`)}
                </p>
              ))}
            </div>
          ))}
        </div>
        <div className="landing-footer-bottom">
          <p>
            © {currentYear} DebtBook. {t("landing.rights")}
          </p>
          <div>
            <span>{t("landing.privacy")}</span>
            <span>{t("landing.terms")}</span>
            <span>Cookies</span>
          </div>
        </div>
      </footer>
      <Menu
        anchorEl={languageMenu}
        open={!!languageMenu}
        onClose={() => setLanguageMenu(null)}
      >
        {[
          ["tg", "Тоҷикӣ (TJ)"],
          ["ru", "Русский (RU)"],
          ["en", "English (EN)"],
        ].map(([code, label]) => (
          <MenuItem
            key={code}
            selected={i18n.language === code}
            onClick={() => {
              i18n.changeLanguage(code);
              setLanguageMenu(null);
            }}
          >
            {label}
          </MenuItem>
        ))}
      </Menu>
    </div>
  );
}

import { useState } from "react";
import {
  Alert,
  Button,
  CircularProgress,
  IconButton,
  OutlinedInput,
} from "@mui/material";
import { Eye, EyeOff } from "lucide-react";
import { useTranslation } from "react-i18next";

interface Props {
  register: boolean;
  setRegister: (value: boolean) => void;
  form: Record<string, string>;
  field: (key: string, value: string) => void;
  busy: boolean;
  error: string;
  submit: (event: React.SubmitEvent) => void;
}

export default function Auth({
  register,
  setRegister,
  form,
  field,
  busy,
  error,
  submit,
}: Props) {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);
  const [forgot, setForgot] = useState(false);
  return (
    <div className="auth-page">
      <div className="auth-orb auth-orb-green" />
      <div className="auth-orb auth-orb-red" />
      <div className="auth-orb auth-orb-yellow" />
      <form className="auth-card panel" onSubmit={submit}>
        <a href="/" className="auth-logo">
          <img src="/adl5-8-logo.svg" alt="Adl 5:8" width="40" height="40" />
        </a>
        <div className="auth-heading">
          <h1>{t(register ? "register" : "login")}</h1>
          <button
            type="button"
            onClick={() => {
              setRegister(!register);
              setForgot(false);
              history.pushState({}, "", register ? "/login" : "/register");
            }}
          >
            {t(register ? "hasAccount" : "noAccount")}
          </button>
        </div>
        <div className="auth-fields">
          {register && (
            <label>
              {t("name")}
              <OutlinedInput
                fullWidth
                required
                value={form.name || ""}
                placeholder={t("usernamePlaceholder")}
                onChange={(e) => field("name", e.target.value)}
                inputProps={{ maxLength: 120 }}
              />
            </label>
          )}
          <label>
            {t("email")}
            <OutlinedInput
              fullWidth
              required
              type="email"
              autoComplete="email"
              placeholder={t("emailPlaceholder")}
              value={form.email || ""}
              onChange={(e) => field("email", e.target.value)}
            />
          </label>
          <label>
            {t("password")}
            <OutlinedInput
              fullWidth
              required
              type={visible ? "text" : "password"}
              autoComplete={register ? "new-password" : "current-password"}
              placeholder={t("passwordPlaceholder")}
              value={form.password || ""}
              onChange={(e) => field("password", e.target.value)}
              inputProps={{ minLength: register ? 6 : 1, maxLength: 128 }}
              endAdornment={
                <IconButton
                  aria-label={t("password")}
                  edge="end"
                  onClick={() => setVisible(!visible)}
                >
                  {visible ? <Eye size={20} /> : <EyeOff size={20} />}
                </IconButton>
              }
            />
          </label>
        </div>
        {!register && (
          <button
            type="button"
            className="forgot-link"
            onClick={() => setForgot(!forgot)}
          >
            {t("forgotPassword")}
          </button>
        )}
        {forgot && (
          <Alert severity="info" className="mb-4">
            {t("resetUnavailable")}
          </Alert>
        )}
        {error && (
          <Alert severity="error" className="mb-4">
            {error}
          </Alert>
        )}
        <Button
          fullWidth
          variant="contained"
          type="submit"
          disabled={busy}
          className="auth-submit"
        >
          {busy ? (
            <CircularProgress size={22} />
          ) : (
            t(register ? "register" : "login")
          )}
        </Button>
      </form>
    </div>
  );
}

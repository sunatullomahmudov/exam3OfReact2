import { useState } from "react";
import { IconButton, MenuItem } from "@mui/material";
import {
  UserRound,
  Settings,
  LogOut,
  Sun,
  Moon,
  Headset,
  LockKeyhole,
  Pencil,
  UsersRound,
  Eye,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import ReferenceIcon from "./ReferenceIcon";

interface Props {
  name: string;
  mode: string;
  setMode: (mode: string) => void;
  edit: () => void;
  view: () => void;
  logout: () => void;
}

export default function ProfileMenu({
  name,
  mode,
  setMode,
  edit,
  view,
  logout,
}: Props) {
  const { t } = useTranslation();
  const [tab, setTab] = useState("profile");
  return (
    <div className="account-menu">
      <div className="account-heading">
        <span className="avatar" />
        <div>
          <b>{name}</b>
          <small>Owner</small>
        </div>
        <IconButton
          aria-label={t("logout")}
          onClick={logout}
          className="account-logout"
        >
          <ReferenceIcon name="logout" size={24} />
        </IconButton>
      </div>
      <div className="account-tabs">
        <button
          className={tab === "profile" ? "selected" : ""}
          onClick={() => setTab("profile")}
        >
          <UserRound size={18} />
          Profile
        </button>
        <button
          className={tab === "settings" ? "selected" : ""}
          onClick={() => setTab("settings")}
        >
          <Settings size={18} />
          Setting
        </button>
      </div>
      {tab === "profile" ? (
        <div className="account-links">
          <MenuItem onClick={edit}>
            <Pencil size={18} />
            {t("editProfile")}
          </MenuItem>
          <MenuItem onClick={view}>
            <Eye size={18} />
            {t("viewProfile")}
          </MenuItem>
          <MenuItem onClick={view}>
            <UsersRound size={18} />
            {t("socialProfile")}
          </MenuItem>
          <MenuItem onClick={logout}>
            <LogOut size={18} />
            {t("logout")}
          </MenuItem>
        </div>
      ) : (
        <>
          <div className="account-theme">
            <p>Theme Mode</p>
            <div className="theme-choices">
              {[Sun, Moon, Settings].map((Icon, index) => {
                const value = ["light", "dark", "auto"][index];
                return (
                  <button
                    key={value}
                    aria-pressed={mode === value}
                    className={mode === value ? "selected" : ""}
                    onClick={() => setMode(value)}
                  >
                    <span>
                      {index === 0 ? (
                        <Icon size={21} fill="currentColor" />
                      ) : (
                        <ReferenceIcon
                          name={index === 1 ? "moon" : "auto"}
                          size={20}
                        />
                      )}
                    </span>
                    {["Light", "Dark", "Auto"][index]}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="account-links">
            <MenuItem
              component="a"
              href="https://phoenixcoded.authordesk.app/"
              target="_blank"
              rel="noreferrer"
            >
              <Headset size={19} />
              Support
            </MenuItem>
            <MenuItem onClick={view}>
              <LockKeyhole size={19} />
              Privacy Center
            </MenuItem>
          </div>
        </>
      )}
    </div>
  );
}

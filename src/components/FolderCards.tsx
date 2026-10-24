import { IconButton, Menu, MenuItem } from "@mui/material";
import { ArrowRight, MoreVertical } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { Contact, Debt, Folder, Payment } from "../types";

interface Props {
  folders: Folder[];
  contacts: Contact[];
  debts: Debt[];
  payments: Payment[];
  select: (id: string, name: string) => void;
  edit: (folder: Folder) => void;
  remove: (id: string) => void;
}
export default function FolderCards({
  folders,
  contacts,
  debts,
  payments,
  select,
  edit,
  remove,
}: Props) {
  const { t } = useTranslation();
  const [menu, setMenu] = useState<{
    anchor: HTMLElement;
    folder: Folder;
  } | null>(null);
  const cards = [...folders, { id: "unfiled", name: t("unfiled") }];
  return (
    <div className="folder-grid">
      {cards.map((folder) => {
        const list = debts.filter((d) => {
          if (d.status === "paid") return false;
          const c = contacts.find((c) => c.id === d.contact_id);
          return folder.id === "unfiled"
            ? !c?.folder_id
            : c?.folder_id === folder.id;
        });
        const total = (direction: string) =>
          list
            .filter((d) => d.direction === direction)
            .reduce(
              (sum, d) =>
                sum +
                Number(d.amount) -
                payments
                  .filter((p) => p.debt_id === d.id)
                  .reduce((a, p) => a + Number(p.amount), 0),
              0,
            );
        const lent = total("they_owe_me"),
          borrowed = total("i_owe_them");
        return (
          <div
            className="panel folder-summary"
            key={folder.id}
            onClick={() => select(folder.id, folder.name)}
          >
            <div className="flex items-center gap-3">
              <span className="folder-symbol">
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M21.017 7.992c.398.566-.076 1.258-.769 1.258H3a1 1 0 0 1-1-1V6.42C2 3.98 3.98 2 6.42 2h2.32c1.63 0 2.14.53 2.79 1.4l1.4 1.86c.31.41.35.46.93.46h2.79c1.805 0 3.402.897 4.367 2.272ZM20.983 10.75a1 1 0 0 1 1 .997L22 16.65C22 19.6 19.6 22 16.65 22h-9.3C4.4 22 2 19.6 2 16.65v-4.9a1 1 0 0 1 1-1h17.983Z" />
                </svg>
              </span>
              <button
                className="name-link"
                onClick={(e) => {
                  e.stopPropagation();
                  select(folder.id, folder.name);
                }}
              >
                {folder.name}
              </button>
              {folder.id !== "unfiled" && (
                <IconButton
                  sx={{ ml: "auto" }}
                  aria-label={t("actions")}
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenu({ anchor: e.currentTarget, folder });
                  }}
                >
                  <MoreVertical size={18} />
                </IconButton>
              )}
            </div>
            <div className="folder-totals">
              <p>
                {t("contactBalance")}
                <b className="green">
                  {lent - borrowed} <small>TJS</small>
                </b>
              </p>
              <p>
                {t("lent")}
                <span className="green">
                  +{lent} <small>TJS</small>
                </span>
              </p>
              <p>
                {t("borrowed")}
                <span className="red">
                  -{borrowed} <small>TJS</small>
                </span>
              </p>
            </div>
            <IconButton
              className="folder-arrow"
              aria-label={folder.name}
              onClick={(e) => {
                e.stopPropagation();
                select(folder.id, folder.name);
              }}
            >
              <ArrowRight size={20} />
            </IconButton>
          </div>
        );
      })}
      <Menu open={!!menu} anchorEl={menu?.anchor} onClose={() => setMenu(null)}>
        <MenuItem
          onClick={() => {
            if (menu) edit(menu.folder);
            setMenu(null);
          }}
        >
          {t("edit")}
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (menu) remove(menu.folder.id);
            setMenu(null);
          }}
        >
          {t("remove")}
        </MenuItem>
      </Menu>
    </div>
  );
}

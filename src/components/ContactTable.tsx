import { useState } from "react";
import { IconButton, Menu, MenuItem } from "@mui/material";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { Contact } from "../types";
interface Props {
  contacts: Contact[];
  balance: (id: string) => number;
  edit: (c: Contact) => void;
  remove: (c: Contact) => void;
}
export default function ContactTable({
  contacts,
  balance,
  edit,
  remove,
}: Props) {
  const { t } = useTranslation();
  const [menu, setMenu] = useState<{
    anchor: HTMLElement;
    contact: Contact;
  } | null>(null);
  return (
    <div className="table-scroll">
      <table className="reference-contact-table">
        <thead>
          <tr>
            {[
              "name",
              "phoneTitle",
              "contactBalance",
              "notesTitle",
              "actions",
            ].map((key) => (
              <th key={key}>{t(key)}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {contacts.map((c) => (
            <tr key={c.id}>
              <td>{c.name}</td>
              <td>{c.phone || "-"}</td>
              <td>
                <span>{balance(c.id).toLocaleString("ru-RU")}</span>{" "}
                <small className="inline-currency">TJS</small>
              </td>
              <td>{c.note || "-"}</td>
              <td>
                <IconButton
                  size="small"
                  aria-label={`${t("actions")}: ${c.name}`}
                  onClick={(e) =>
                    setMenu({ anchor: e.currentTarget, contact: c })
                  }
                >
                  <MoreVertical size={18} />
                </IconButton>
              </td>
            </tr>
          ))}
          {!contacts.length && (
            <tr>
              <td colSpan={5} className="empty-cell">
                {t("emptyContacts")}
              </td>
            </tr>
          )}
        </tbody>
      </table>
      <Menu open={!!menu} anchorEl={menu?.anchor} onClose={() => setMenu(null)}>
        <MenuItem
          onClick={() => {
            if (menu) edit(menu.contact);
            setMenu(null);
          }}
        >
          <Pencil size={17} />
          {t("edit")}
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (menu) remove(menu.contact);
            setMenu(null);
          }}
        >
          <Trash2 size={17} />
          {t("remove")}
        </MenuItem>
      </Menu>
    </div>
  );
}

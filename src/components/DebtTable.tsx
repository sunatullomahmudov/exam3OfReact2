import { useState } from "react";
import { IconButton, LinearProgress, Menu, MenuItem } from "@mui/material";
import {
  CalendarDays,
  MoreVertical,
  Pencil,
  CircleCheck,
  RotateCcw,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import StatIcon from "./StatIcon";
import type { Debt } from "../types";

interface Props {
  debts: Debt[];
  archive: boolean;
  name: (id: string) => string;
  paid: (id: string) => number;
  edit: (debt: Debt) => void;
  details: (debt: Debt) => void;
  changeStatus: (debt: Debt) => void;
}
export default function DebtTable({
  debts,
  archive,
  name,
  paid,
  edit,
  details,
  changeStatus,
}: Props) {
  const { t, i18n } = useTranslation();
  const [menu, setMenu] = useState<{ anchor: HTMLElement; debt: Debt } | null>(
    null,
  );
  const amount = (n: number) =>
    n.toLocaleString(i18n.language === "en" ? "en-US" : "ru-RU", {
      maximumFractionDigits: 2,
    });
  const date = (value: string) =>
    new Date(value).toLocaleDateString(
      i18n.language === "en" ? "en-US" : "ru-RU",
      { day: "numeric", month: "short", year: "numeric" },
    );
  return (
    <div className="table-scroll">
      <table className="reference-debt-table">
        <thead>
          <tr>
            {[
              "name",
              "amount",
              "progress",
              archive ? "description" : "due",
              "actions",
            ].map((key) => (
              <th key={key}>{key === "actions" ? "" : t(key)}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {debts.map((debt) => {
            const remaining =
              debt.status === "paid"
                ? 0
                : Math.max(0, Number(debt.amount) - paid(debt.id));
            const percent =
              Number(debt.amount) > 0
                ? Math.round((remaining / Number(debt.amount)) * 100)
                : 0;
            const lent = debt.direction === "they_owe_me";
            return (
              <tr key={debt.id}>
                <td>
                  <div className="debt-name-cell">
                    <span className={`debt-row-icon ${lent ? "green" : "red"}`}>
                      <StatIcon index={lent ? 1 : 2} />
                    </span>
                    <button className="name-link" onClick={() => details(debt)}>
                      {name(debt.contact_id)}
                      <small>{debt.description}</small>
                    </button>
                  </div>
                </td>
                <td>
                  <strong className={lent ? "green" : "red"}>
                    {lent ? "+" : "−"}
                    {amount(remaining)}
                  </strong>{" "}
                  <small className="inline-currency">{debt.currency}</small>
                </td>
                <td>
                  <div className="remaining-progress">
                    <span className={lent ? "green" : "red"}>{percent}%</span>
                    <LinearProgress
                      variant="determinate"
                      color={lent ? "success" : "error"}
                      value={percent}
                    />
                  </div>
                </td>
                <td>
                  {archive ? (
                    debt.description || "—"
                  ) : (
                    <div className="date-range">
                      <CalendarDays size={16} />
                      <span>
                        {date(debt.created_at)}
                        {debt.due_date && ` - ${date(debt.due_date)}`}
                      </span>
                    </div>
                  )}
                </td>
                <td>
                  <IconButton
                    size="small"
                    aria-label={`${t("actions")}: ${name(debt.contact_id)}`}
                    onClick={(e) => setMenu({ anchor: e.currentTarget, debt })}
                  >
                    <MoreVertical size={18} />
                  </IconButton>
                </td>
              </tr>
            );
          })}
          {!debts.length && (
            <tr>
              <td colSpan={5} className="empty-cell">
                {t(archive ? "emptyArchive" : "emptyDebts")}
              </td>
            </tr>
          )}
        </tbody>
      </table>
      <Menu anchorEl={menu?.anchor} open={!!menu} onClose={() => setMenu(null)}>
        <MenuItem
          onClick={() => {
            if (menu) edit(menu.debt);
            setMenu(null);
          }}
        >
          <Pencil size={17} />
          {t("edit")}
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (menu) changeStatus(menu.debt);
            setMenu(null);
          }}
        >
          {archive ? <RotateCcw size={18} /> : <CircleCheck size={18} />}{" "}
          {t(archive ? "reopenDebt" : "closeDebt")}
        </MenuItem>
      </Menu>
    </div>
  );
}

import { useEffect, useState } from "react";
import { Button } from "@mui/material";
import { CircleAlert, ShieldAlert } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { Debt, User } from "../types";
interface Props {
  user: User | null;
  debts: Debt[];
  name: (id: string) => string;
  paid: (id: string) => number;
  onUnread: (count: number) => void;
  openDebt: (debt: Debt) => void;
  profile: () => void;
}
export default function Notifications({
  user,
  debts,
  name,
  paid,
  onUnread,
  openDebt,
  profile,
}: Props) {
  const { t } = useTranslation();
  const key = `notification-read-${user?.id || "guest"}`;
  const [read, setRead] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(key) || "[]");
    } catch {
      return [];
    }
  });
  const [date] = useState(() => new Date());
  const today = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  const due = debts.filter(
    (d) =>
      d.status !== "paid" && d.due_date && d.due_date.slice(0, 10) <= today,
  );
  const ids = [
    ...due.map((d) => `${d.id}:${d.due_date}`),
    ...(!user?.email ? ["missing-email"] : []),
  ];
  const count = ids.filter((id) => !read.includes(id)).length;
  useEffect(() => {
    onUnread(count);
  }, [count, onUnread]);
  function markAll() {
    setRead(ids);
    localStorage.setItem(key, JSON.stringify(ids));
  }
  return (
    <div className="notification-content">
      <div className="notification-heading">
        <h2>{t("notifications")}</h2>
        <Button size="small" onClick={markAll}>
          {t("markAllRead")}
        </Button>
      </div>
      <div className="notification-list">
        {due.map((d) => {
          const isToday = d.due_date?.slice(0, 10) === today;
          return (
            <button
              key={d.id}
              className={`notification-item ${read.includes(`${d.id}:${d.due_date}`) ? "read" : ""}`}
              onClick={() => openDebt(d)}
            >
              <span className="notice-icon warning">
                <ShieldAlert size={22} />
              </span>
              <span>
                <strong>{t(isToday ? "debtDueToday" : "debtOverdue")}</strong>
                <small>
                  {name(d.contact_id)} —{" "}
                  {Number(Number(d.amount) - paid(d.id)).toLocaleString(
                    "ru-RU",
                  )}{" "}
                  {d.currency} {t(isToday ? "dueToday" : "overdue")}
                </small>
              </span>
            </button>
          );
        })}
        {!user?.email && (
          <button
            className={`notification-item ${read.includes("missing-email") ? "read" : ""}`}
            onClick={profile}
          >
            <span className="notice-icon">
              <CircleAlert size={22} />
            </span>
            <span>
              <strong>{t("actionRequired")}</strong>
              <small>{t("addEmailProfile")}</small>
            </span>
          </button>
        )}
        {!ids.length && (
          <p className="empty-notifications">{t("noNotifications")}</p>
        )}
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import {
  ThemeProvider,
  createTheme,
  Button,
  TextField,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  LinearProgress,
  Alert,
  Snackbar,
  Menu,
  CircularProgress,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Plus,
  Search,
  ArrowUpDown,
  ListFilter,
  FileDown,
  X,
  Clock3,
  ChevronRight,
} from "lucide-react";
import DebtChart from "./components/DebtChart";
import { useTranslation } from "react-i18next";
import Notifications from "./components/Notifications";
import DebtTable from "./components/DebtTable";
import ContactTable from "./components/ContactTable";
import StatIcon from "./components/StatIcon";
import ReferenceIcon from "./components/ReferenceIcon";
import FolderCards from "./components/FolderCards";
import Auth from "./components/Auth";
import Landing from "./components/Landing";
import QuickAdd from "./components/QuickAdd";
import ProfileMenu from "./components/ProfileMenu";
import DebtFields from "./components/DebtFields";
import "./i18n";
import { api, errorText } from "./api";
import type { Contact, Debt, Folder, Payment, User } from "./types";

const pages = ["dashboard", "debts", "archive", "contacts", "folders"];
const money = (value: number) =>
  Number(value || 0).toLocaleString("en-US", { maximumFractionDigits: 2 });

export default function App() {
  const { t, i18n } = useTranslation();
  const [user, setUser] = useState<User | null>(null);
  const [authenticated, setAuthenticated] = useState(
    !!localStorage.getItem("accessToken"),
  );
  const [page, setPage] = useState(
    pages.includes(location.pathname.slice(1))
      ? location.pathname.slice(1)
      : "dashboard",
  );
  const [debts, setDebts] = useState<Debt[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [, setUnreadNoticeCount] = useState(0);
  const [drawer, setDrawer] = useState(true);
  const [mode, setMode] = useState(localStorage.getItem("theme") || "auto");
  const [systemDark, setSystemDark] = useState(
    matchMedia("(prefers-color-scheme: dark)").matches,
  );
  const dark = mode === "dark" || (mode === "auto" && systemDark);
  const [menu, setMenu] = useState<{
    name: string;
    anchor: HTMLElement;
  } | null>(null);
  const [path, setPath] = useState(() =>
    localStorage.getItem("accessToken") &&
    ["/login", "/register"].includes(location.pathname)
      ? "/dashboard"
      : location.pathname,
  );
  const [modal, setModal] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [editId, setEditId] = useState("");
  const [form, setForm] = useState<Record<string, string>>({});
  const [deleteItem, setDeleteItem] = useState<{
    type: string;
    id: string;
  } | null>(null);
  const [search, setSearch] = useState("");
  const [contactFilter, setContactFilter] = useState("");
  const [folderFilter, setFolderFilter] = useState("");
  const [sort, setSort] = useState("");
  const [fab, setFab] = useState(false);
  const [register, setRegister] = useState(location.pathname === "/register");
  const [debtImage, setDebtImage] = useState("");
  const [isMobile, setIsMobile] = useState(innerWidth < 768);
  const [returnForm, setReturnForm] = useState<Record<string, string> | null>(
    null,
  );
  const [returnId, setReturnId] = useState("");
  const [images, setImages] = useState<Record<string, string>>(() =>
    JSON.parse(localStorage.getItem("debtImages") || "{}"),
  );
  const theme = createTheme({
    palette: {
      mode: dark ? "dark" : "light",
      primary: { main: "#4680ff" },
      success: { main: "#2ca87f" },
      background: {
        default: dark ? "#131920" : "#f8f9fa",
        paper: dark ? "#1d2630" : "#fff",
      },
      text: {
        primary: dark ? "#bfc4ca" : "#1d2630",
        secondary: dark ? "#8996a4" : "#5b6b79",
      },
    },
    typography: {
      fontFamily: "Inter, Arial, sans-serif",
      fontSize: 14,
      button: { textTransform: "none", fontWeight: 500 },
    },
    shape: { borderRadius: 8 },
    components: {
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: { root: { padding: "10px 20px" } },
      },
      MuiDialog: { styleOverrides: { paper: { borderRadius: 12 } } },
      MuiMenu: {
        styleOverrides: {
          paper: {
            backgroundImage: "none",
            borderRadius: 12,
            boxShadow: "0 8px 32px #0002",
          },
        },
      },
    },
  });
  useEffect(() => {
    const media = matchMedia("(prefers-color-scheme: dark)");
    const change = () => setSystemDark(media.matches);
    const resize = () => {
      setIsMobile(innerWidth < 768);
      if (innerWidth < 768) setDrawer(false);
    };
    resize();
    window.addEventListener("resize", resize);
    const expired = () => {
      setAuthenticated(false);
      setUser(null);
    };
    const dismiss = (event: PointerEvent) => {
      if (!(event.target as HTMLElement).closest(".fab-wrap")) setFab(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setFab(false);
    };
    document.addEventListener("pointerdown", dismiss);
    document.addEventListener("keydown", escape);
    const pop = () => {
      setPath(location.pathname);
      setPage(
        pages.includes(location.pathname.slice(1))
          ? location.pathname.slice(1)
          : "dashboard",
      );
      setRegister(location.pathname === "/register");
      setFolderFilter(
        new URLSearchParams(location.search).get("folderId") || "",
      );
    };
    media.addEventListener("change", change);
    window.addEventListener("session-expired", expired);
    window.addEventListener("popstate", pop);
    return () => {
      document.removeEventListener("pointerdown", dismiss);
      document.removeEventListener("keydown", escape);
      window.removeEventListener("resize", resize);
      media.removeEventListener("change", change);
      window.removeEventListener("session-expired", expired);
      window.removeEventListener("popstate", pop);
    };
  }, []);
  useEffect(() => {
    document.documentElement.lang = i18n.language;
    localStorage.setItem("language", i18n.language);
  }, [i18n.language]);
  useEffect(() => {
    document.documentElement.dataset.theme = dark ? "dark" : "light";
    localStorage.setItem("theme", mode);
  }, [dark, mode]);
  useEffect(() => {
    if (authenticated) {
      if (["/login", "/register"].includes(location.pathname)) {
        history.replaceState({}, "", "/dashboard");
      }
      loadData();
    }
  }, [authenticated]);
  async function loadData() {
    setLoading(true);
    try {
      const [u, d, c, f] = await Promise.all([
        api.get("/users/me"),
        api.get("/debts"),
        api.get("/contacts"),
        api.get("/folders"),
      ]);
      setUser(u.data);
      setDebts(d.data);
      setContacts(c.data);
      setFolders(f.data);
      const history = await Promise.all(
        d.data.map((debt: Debt) => api.get(`/debts/${debt.id}/payments`)),
      );
      setPayments(history.flatMap((response) => response.data));
    } catch (e) {
      setError(errorText(e));
    } finally {
      setLoading(false);
    }
  }
  function navigate(next: string) {
    setFolderFilter("");
    setContactFilter("");
    setPage(next);
    setPath(`/${next}`);
    history.pushState({}, "", `/${next}`);
    if (isMobile) setDrawer(false);
    setSearch("");
    setMenu(null);
  }
  function open(type: string, data: Record<string, string> = {}, id = "") {
    if (type === "debt") setDebtImage(id ? images[id] || "" : "");
    setModal(type);
    setModalVisible(true);
    setForm(data);
    setEditId(id);
    setMenu(null);
    setFab(false);
    setError("");
  }
  function closeModal() {
    if (returnForm) {
      setForm(returnForm);
      setReturnForm(null);
      setEditId(returnId);
      setModal("debt");
      return;
    }
    setModalVisible(false);
  }
  function field(key: string, value: string) {
    setForm((previous) => ({ ...previous, [key]: value }));
  }
  async function auth(event: React.SubmitEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const { data } = await api.post(
        `/auth/${register ? "register" : "login"}`,
        register ? form : { email: form.email, password: form.password },
      );
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      setUser(data.user);
      setForm({});
      setAuthenticated(true);
      navigate("dashboard");
    } catch (e) {
      setError(errorText(e));
    } finally {
      setBusy(false);
    }
  }
  async function logout() {
    try {
      await api.post("/auth/logout", {
        refreshToken: localStorage.getItem("refreshToken"),
      });
    } catch (e) {
      setError(errorText(e));
      return;
    }
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setAuthenticated(false);
    setUser(null);
    setMenu(null);
    history.pushState({}, "", "/login");
  }
  async function save(event: React.SubmitEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      let contactId = form.contact_id;
      let path = "";
      let payload: Record<string, unknown> = {};
      if (modal === "contact") {
        path = "/contacts";
        payload = {
          name: form.name,
          phone: form.phone || undefined,
          note: form.note || undefined,
          folder_id: form.folder_id || undefined,
        };
      }
      if (modal === "folder") {
        path = "/folders";
        payload = { name: form.name };
      }
      if (modal === "debt") {
        const name = (
          form.contact_name ||
          contacts.find((c) => c.id === contactId)?.name ||
          ""
        ).trim();
        if (!name) throw new Error(t("person"));
        const existing = contacts.find(
          (c) => c.name.trim().toLowerCase() === name.toLowerCase(),
        );
        contactId = existing?.id || contactId;
        if (!contactId) {
          const response = await api.post("/contacts", {
            name,
            folder_id: form.folder_id || undefined,
          });
          contactId = response.data.id;
          setContacts((previous) => [...previous, response.data]);
          setForm((previous) => ({ ...previous, contact_id: contactId }));
        }
        path = "/debts";
        payload = {
          contact_id: contactId,
          direction: form.direction || "they_owe_me",
          amount: Number(form.amount),
          currency: form.currency || "TJS",
          description: form.description || undefined,
          due_date: form.due_date || undefined,
        };
      }
      if (modal === "payment") {
        path = `/debts/${form.debt_id}/payments`;
        const debt = debts.find((d) => d.id === form.debt_id);
        if (!debt) throw new Error(t("chooseDebt"));
        if (form.adjustment === "increase") {
          path = `/debts/${debt.id}`;
          payload = { amount: Number(debt.amount) + Number(form.amount) };
        } else {
          if (Number(form.amount) > Number(debt.amount) - paidAmount(debt.id))
            throw new Error(t("overpayment"));
          payload = {
            amount: Number(form.amount),
            note: form.note || undefined,
          };
        }
      }
      if (modal === "profile") {
        path = "/users/me";
        payload = { name: form.name };
      }
      if (modal === "debt" && form.folder_id)
        await api.patch(`/contacts/${contactId}`, {
          name: form.contact_name || contactName(contactId),
          folder_id: form.folder_id,
        });
      let saved;
      if (
        editId ||
        modal === "profile" ||
        (modal === "payment" && form.adjustment === "increase")
      )
        saved = await api.patch(
          modal === "profile" || modal === "payment"
            ? path
            : `${path}/${editId}`,
          payload,
        );
      else saved = await api.post(path, payload);
      if (modal === "debt") {
        const next = { ...images };
        if (debtImage) next[saved.data.id] = debtImage;
        else delete next[saved.data.id];
        try {
          localStorage.setItem("debtImages", JSON.stringify(next));
        } catch {
          setNotice(t("imageLocalOnly"));
        }
        setImages(next);
      }
      if (returnForm && (modal === "folder" || modal === "contact")) {
        setModal("debt");
        setForm({
          ...returnForm,
          [modal === "folder" ? "folder_id" : "contact_id"]: saved.data.id,
        });
        setReturnForm(null);
        setEditId(returnId);
        await loadData();
        return;
      }
      setModalVisible(false);
      setNotice(t("success"));
      await loadData();
    } catch (e) {
      setError(errorText(e));
    } finally {
      setBusy(false);
    }
  }
  async function remove() {
    if (!deleteItem) return;
    setBusy(true);
    try {
      await api.delete(`/${deleteItem.type}/${deleteItem.id}`);
      setDeleteItem(null);
      await loadData();
    } catch (e) {
      setError(errorText(e));
    } finally {
      setBusy(false);
    }
  }
  async function changeDebtStatus(debt: Debt) {
    try {
      await api.patch(`/debts/${debt.id}`, {
        status: debt.status === "paid" ? "pending" : "paid",
      });
      await loadData();
    } catch (e) {
      setError(errorText(e));
    }
  }
  function editDebt(d: Debt) {
    open(
      "debt",
      {
        contact_id: d.contact_id,
        contact_name: contactName(d.contact_id),
        amount: String(d.amount),
        currency: d.currency,
        direction: d.direction,
        description: d.description || "",
        due_date: d.due_date?.slice(0, 10) || "",
        folder_id: contacts.find((c) => c.id === d.contact_id)?.folder_id || "",
      },
      d.id,
    );
  }
  function notificationCount() {
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    let read: string[] = [];
    try {
      read = JSON.parse(
        localStorage.getItem(`notification-read-${user?.id || "guest"}`) ||
          "[]",
      );
    } catch {}
    const ids = debts
      .filter(
        (d) =>
          d.status !== "paid" && d.due_date && d.due_date.slice(0, 10) <= today,
      )
      .map((d) => `${d.id}:${d.due_date}`);
    if (user && !user.email) ids.push("missing-email");
    return ids.filter((id) => !read.includes(id)).length;
  }
  const contactName = (id: string) =>
    contacts.find((c) => c.id === id)?.name || "—";
  const paidAmount = (id: string) =>
    payments
      .filter((p) => p.debt_id === id)
      .reduce((sum, p) => sum + Number(p.amount), 0);
  const lent = debts
    .filter((d) => d.direction === "they_owe_me")
    .reduce(
      (sum, d) =>
        sum + (d.status === "paid" ? 0 : Number(d.amount) - paidAmount(d.id)),
      0,
    );
  const borrowed = debts
    .filter((d) => d.direction === "i_owe_them")
    .reduce(
      (sum, d) =>
        sum + (d.status === "paid" ? 0 : Number(d.amount) - paidAmount(d.id)),
      0,
    );
  const filtered = debts
    .filter(
      (d) =>
        (page === "archive" ? d.status === "paid" : d.status !== "paid") &&
        contactName(d.contact_id)
          .toLowerCase()
          .includes(search.toLowerCase()) &&
        (!contactFilter || d.contact_id === contactFilter) &&
        (!folderFilter ||
          (folderFilter === "unfiled"
            ? !contacts.find((c) => c.id === d.contact_id)?.folder_id
            : contacts.find((c) => c.id === d.contact_id)?.folder_id ===
              folderFilter)),
    )
    .sort((a, b) =>
      sort.startsWith("amount")
        ? (sort === "amount-asc" ? 1 : -1) *
          (Number(a.amount) - Number(b.amount))
        : sort.startsWith("date")
          ? (sort === "date-desc" ? -1 : 1) *
            (Date.parse(a.created_at) - Date.parse(b.created_at))
          : 0,
    );
  function exportCsv() {
    const rows = [
      ["Name", "Amount", "Currency", "Status", "Due date"],
      ...filtered.map((d) => [
        contactName(d.contact_id),
        d.amount,
        d.currency,
        d.status,
        d.due_date || "",
      ]),
    ];
    const csv = rows
      .map((row) =>
        row
          .map((cell) => '"' + String(cell).replace(/"/g, '""') + '"')
          .join(","),
      )
      .join("\r\n");
    const url = URL.createObjectURL(
      new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "debts.csv";
    a.click();
    URL.revokeObjectURL(url);
  }
  const textInput = (
    key: string,
    label: string,
    required = false,
    type = "text",
  ) => (
    <TextField
      fullWidth
      size="small"
      label={t(label)}
      required={required}
      type={type}
      value={form[key] || ""}
      onChange={(e) => field(key, e.target.value)}
      slotProps={{
        htmlInput:
          type === "number"
            ? { min: 0.01, step: "0.01", max: 1000000000 }
            : { maxLength: key === "name" ? 120 : 1000 },
        inputLabel: type === "date" ? { shrink: true } : undefined,
      }}
    />
  );
  const actionButton = (
    label: string,
    icon: React.ReactNode,
    onClick: () => void,
  ) => (
    <Tooltip title={t(label)}>
      <IconButton aria-label={t(label)} size="small" onClick={onClick}>
        {icon}
      </IconButton>
    </Tooltip>
  );
  const kpis = (
    <div className="kpi-grid">
      {[t("total"), t("lent"), t("borrowed")].map((label, index) => (
        <div key={label} className={`stat stat-${index}`}>
          <span className="stat-icon">
            <StatIcon index={index} />
          </span>
          <div>
            <p>{label}</p>
            <strong>
              {money([lent - borrowed, lent, borrowed][index])}{" "}
              <small>TJS</small>
            </strong>
          </div>
        </div>
      ))}
    </div>
  );
  return (
    <ThemeProvider theme={theme}>
      {path === "/" ? (
        <Landing dark={dark} setMode={setMode} />
      ) : !authenticated ? (
        <Auth
          register={register}
          setRegister={setRegister}
          form={form}
          field={field}
          busy={busy}
          error={error}
          submit={auth}
        />
      ) : (
        <>
          <aside className={`sidebar ${drawer ? "expanded" : ""}`}>
            <a
              className="brand"
              href="/dashboard"
              onClick={(e) => {
                e.preventDefault();
                navigate("dashboard");
              }}
            >
              <img
                src="/adl5-8-logo.svg"
                alt="Adl 5:8"
                width="40"
                height="40"
              />
            </a>
            <nav>
              {drawer && <p className="nav-caption">Adl 5:8</p>}
              {pages.map((name) => {
                return (
                  <Tooltip
                    key={name}
                    title={!drawer ? t(name) : ""}
                    placement="right"
                  >
                    <button
                      className={page === name ? "active" : ""}
                      onClick={() => navigate(name)}
                    >
                      <ReferenceIcon name={name} size={20} />
                      {drawer && <span>{t(name)}</span>}
                    </button>
                  </Tooltip>
                );
              })}
            </nav>
            <button
              className="sidebar-profile"
              onClick={(e) =>
                setMenu({ name: "profile", anchor: e.currentTarget })
              }
            >
              <span className="avatar">👨🏻</span>
              {drawer && (
                <>
                  <span>
                    {user?.name}
                    <small>Owner</small>
                  </span>
                  <ChevronRight size={18} />
                </>
              )}
            </button>
          </aside>
          {drawer && (
            <div className="mobile-backdrop" onClick={() => setDrawer(false)} />
          )}
          <header className={drawer ? "wide-drawer" : ""}>
            <IconButton
              aria-label="Toggle sidebar"
              onClick={() => setDrawer(!drawer)}
            >
              <MenuIcon />
            </IconButton>
            <span className="mobile-title">{t(page)}</span>
            <div className="ml-auto flex items-center gap-2">
              <Tooltip title="Language">
                <IconButton
                  aria-label="Language"
                  onClick={(e) =>
                    setMenu({ name: "language", anchor: e.currentTarget })
                  }
                >
                  <ReferenceIcon name="language" />
                </IconButton>
              </Tooltip>
              <Tooltip title={loading ? t("loading") : t("sync")}>
                <IconButton aria-label={t("sync")} onClick={loadData}>
                  {loading ? (
                    <CircularProgress size={21} />
                  ) : (
                    <span className="sync-icon">
                      <ReferenceIcon name="synced" size={20} />
                    </span>
                  )}
                </IconButton>
              </Tooltip>
              <Tooltip title={t("notifications")}>
                <IconButton
                  aria-label={t("notifications")}
                  onClick={(e) =>
                    setMenu({ name: "notifications", anchor: e.currentTarget })
                  }
                >
                  <ReferenceIcon name="bell" />
                  {notificationCount() > 0 && (
                    <span className="notification-badge">
                      {notificationCount()}
                    </span>
                  )}
                </IconButton>
              </Tooltip>
              <Tooltip title="Fullscreen">
                <IconButton
                  className="fullscreen-button"
                  aria-label="Fullscreen"
                  onClick={() => {
                    if (document.fullscreenElement) document.exitFullscreen();
                    else
                      document.documentElement
                        .requestFullscreen()
                        .catch((e) => setError(String(e)));
                  }}
                >
                  <ReferenceIcon name="fullscreen" />
                </IconButton>
              </Tooltip>
              <IconButton
                aria-label="Profile"
                onClick={(e) =>
                  setMenu({ name: "profile", anchor: e.currentTarget })
                }
              >
                <span className="avatar">👨🏻</span>
              </IconButton>
            </div>
          </header>
          <main data-page={page} className={drawer ? "wide-drawer" : ""}>
            {loading && <LinearProgress className="loading-bar" />}
            {error && (
              <Alert
                severity="error"
                onClose={() => setError("")}
                className="mb-5"
              >
                {error}
              </Alert>
            )}
            {page === "dashboard" ? (
              <>
                <h1 className="welcome">
                  {t("welcome")}, {user?.name}!
                </h1>
                {kpis}
                <div className="dashboard-grid">
                  <DebtChart debts={debts} dark={dark} isMobile={isMobile} />
                  <section className="panel recent-panel">
                    <h2>{t("recent")}</h2>
                    {payments.length ? (
                      payments
                        .slice()
                        .sort(
                          (a, b) =>
                            Date.parse(b.paid_at) - Date.parse(a.paid_at),
                        )
                        .slice(0, 8)
                        .map((p) => (
                          <div className="payment-row" key={p.id}>
                            <span>
                              {contactName(
                                debts.find((d) => d.id === p.debt_id)
                                  ?.contact_id || "",
                              )}
                              <small>
                                {new Date(p.paid_at).toLocaleDateString()}
                              </small>
                            </span>
                            <b>
                              {money(p.amount)}{" "}
                              {debts.find((d) => d.id === p.debt_id)?.currency}
                            </b>
                          </div>
                        ))
                    ) : (
                      <p className="empty-recent">{t("emptyPayments")}</p>
                    )}
                  </section>
                </div>
              </>
            ) : null}
            {(page === "debts" || page === "archive") && (
              <>
                <div className="page-title">
                  <h1>{page === "debts" ? "Adl 5:8" : t("archive")}</h1>
                  {page === "debts" && (
                    <div className="flex gap-3">
                      <Button
                        variant="outlined"
                        color="inherit"
                        startIcon={<FileDown size={19} />}
                        onClick={exportCsv}
                      >
                        {t("export")}
                      </Button>
                      <Button
                        variant="contained"
                        startIcon={<Clock3 size={18} />}
                        onClick={(e) =>
                          setMenu({ name: "quick", anchor: e.currentTarget })
                        }
                      >
                        {t("quick")}
                      </Button>
                    </div>
                  )}
                </div>
                {page === "debts" && kpis}
                <section
                  className={`panel overflow-hidden ${page === "debts" || page === "archive" ? "debt-table-panel" : "contact-table-panel"}`}
                >
                  <div className="filter-bar">
                    <TextField
                      size="small"
                      placeholder={t("search")}
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      slotProps={{
                        input: {
                          startAdornment: <Search size={19} className="mr-2" />,
                        },
                      }}
                    />
                    <TextField
                      select
                      size="small"
                      slotProps={{ select: { displayEmpty: true } }}
                      value={contactFilter}
                      onChange={(e) => setContactFilter(e.target.value)}
                      sx={{ minWidth: 190 }}
                    >
                      <MenuItem value="">{t("allContacts")}</MenuItem>
                      {contacts.map((c) => (
                        <MenuItem key={c.id} value={c.id}>
                          {c.name}
                        </MenuItem>
                      ))}
                    </TextField>
                    <TextField
                      select
                      size="small"
                      slotProps={{ select: { displayEmpty: true } }}
                      value={folderFilter}
                      onChange={(e) => setFolderFilter(e.target.value)}
                      sx={{ minWidth: 190 }}
                    >
                      <MenuItem value="">{t("allFolders")}</MenuItem>
                      <MenuItem value="unfiled">{t("unfiled")}</MenuItem>
                      {folders.map((f) => (
                        <MenuItem key={f.id} value={f.id}>
                          {f.name}
                        </MenuItem>
                      ))}
                    </TextField>
                    {actionButton(
                      sort === "date-desc" ? "sortDateReverse" : "sortDate",
                      <ListFilter size={20} strokeWidth={1.5} />,
                      () =>
                        setSort(
                          sort === "date-desc" ? "date-asc" : "date-desc",
                        ),
                    )}
                    {actionButton(
                      sort === "amount-asc"
                        ? "sortAmountReverse"
                        : "sortAmount",
                      <ArrowUpDown size={20} strokeWidth={1.5} />,
                      () =>
                        setSort(
                          sort === "amount-asc" ? "amount-desc" : "amount-asc",
                        ),
                    )}
                  </div>
                  <DebtTable
                    debts={filtered}
                    archive={page === "archive"}
                    name={contactName}
                    paid={paidAmount}
                    edit={editDebt}
                    details={(d) => open("history", { debt_id: d.id })}
                    changeStatus={changeDebtStatus}
                  />
                </section>
              </>
            )}
            {page === "contacts" && (
              <>
                <div className="page-title">
                  <h1>{t("contacts")}</h1>
                  <Button
                    variant="contained"
                    startIcon={<Plus size={20} />}
                    onClick={() => open("contact")}
                  >
                    {t("addContact")}
                  </Button>
                </div>
                <section className="panel overflow-hidden contact-table-panel">
                  <div className="filter-bar">
                    <TextField
                      size="small"
                      placeholder={t("searchContacts")}
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                  <ContactTable
                    contacts={contacts.filter(
                      (c) =>
                        c.name.toLowerCase().includes(search.toLowerCase()) &&
                        (!folderFilter || c.folder_id === folderFilter),
                    )}
                    balance={(id) =>
                      debts
                        .filter(
                          (d) => d.contact_id === id && d.status !== "paid",
                        )
                        .reduce(
                          (sum, d) =>
                            sum +
                            (d.direction === "they_owe_me" ? 1 : -1) *
                              (Number(d.amount) - paidAmount(d.id)),
                          0,
                        )
                    }
                    edit={(c) =>
                      open(
                        "contact",
                        {
                          name: c.name,
                          phone: c.phone || "",
                          note: c.note || "",
                          folder_id: c.folder_id || "",
                        },
                        c.id,
                      )
                    }
                    remove={(c) =>
                      setDeleteItem({ type: "contacts", id: c.id })
                    }
                  />
                </section>
              </>
            )}
            {page === "folders" && (
              <>
                <div className="page-title">
                  <h1>{t("folders")}</h1>
                  <Button
                    variant="contained"
                    startIcon={<Plus size={20} />}
                    onClick={() => open("folder")}
                  >
                    {t("addFolder")}
                  </Button>
                </div>
                <FolderCards
                  folders={folders}
                  contacts={contacts}
                  debts={debts}
                  payments={payments}
                  select={(id, name) => {
                    navigate("debts");
                    setFolderFilter(id);
                    history.replaceState(
                      {},
                      "",
                      `/debts?folderId=${id}&folderName=${encodeURIComponent(name)}`,
                    );
                  }}
                  edit={(f) => open("folder", { name: f.name }, f.id)}
                  remove={(id) => setDeleteItem({ type: "folders", id })}
                />
              </>
            )}
            <footer>
              <span>
                © Able Pro <span className="heart">♥</span> crafted by Team
                Phoenixcoded
              </span>
              <div>
                <a
                  href="https://ableproadmin.com/"
                  target="_blank"
                  rel="noreferrer"
                >
                  Home
                </a>
                <a
                  href="https://phoenixcoded.gitbook.io/able-pro/v/react/"
                  target="_blank"
                  rel="noreferrer"
                >
                  Documentation
                </a>
                <a
                  href="https://phoenixcoded.authordesk.app/"
                  target="_blank"
                  rel="noreferrer"
                >
                  Support
                </a>
              </div>
            </footer>
          </main>
          <QuickAdd
            expanded={fab}
            toggle={() => setFab(!fab)}
            add={(direction) => open("debt", { direction })}
          />
          <nav className="bottom-nav">
            {pages.map((p) => {
              return (
                <button
                  aria-label={t(p)}
                  key={p}
                  className={p === page ? "active" : ""}
                  onClick={() => navigate(p)}
                >
                  <ReferenceIcon name={p} size={24} />
                  <span>{t(p)}</span>
                </button>
              );
            })}
          </nav>
          <Menu
            anchorEl={menu?.anchor}
            open={!!menu}
            onClose={() => setMenu(null)}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
            slotProps={{
              paper: {
                sx: {
                  borderRadius: "12px",
                  minWidth: menu?.name === "profile" ? 290 : 190,
                  mt: 1,
                },
              },
            }}
          >
            {menu?.name === "language" &&
              [
                ["en", "English (EN)"],
                ["ru", "Русский (RU)"],
                ["tg", "Тоҷикӣ (TJ)"],
              ].map(([code, label]) => (
                <MenuItem
                  selected={i18n.language === code}
                  key={code}
                  onClick={() => {
                    i18n.changeLanguage(code);
                    setMenu(null);
                  }}
                >
                  {label}
                </MenuItem>
              ))}
            {menu?.name === "notifications" && (
              <Notifications
                user={user}
                debts={debts}
                name={contactName}
                paid={paidAmount}
                onUnread={setUnreadNoticeCount}
                openDebt={(d) => {
                  navigate("debts");
                  setContactFilter(d.contact_id);
                }}
                profile={() => open("profile", { name: user?.name || "" })}
              />
            )}
            {menu?.name === "quick" &&
              ["increase", "decrease"].map((kind) => (
                <MenuItem
                  key={kind}
                  onClick={() => open("payment", { adjustment: kind })}
                >
                  {t(kind)}
                </MenuItem>
              ))}
            {menu?.name === "profile" && (
              <ProfileMenu
                name={user?.name || ""}
                mode={mode}
                setMode={setMode}
                edit={() => open("profile", { name: user?.name || "" })}
                view={() => open("view-profile")}
                logout={logout}
              />
            )}
          </Menu>
        </>
      )}
      <Dialog
        open={modalVisible}
        slotProps={{
          transition: {
            onExited: () => {
              setModal("");
              setEditId("");
            },
          },
        }}
        onClose={() => !busy && closeModal()}
        fullWidth
        maxWidth={
          modal === "debt" || modal === "contact" || modal === "folder"
            ? "md"
            : "sm"
        }
        className={modal === "debt" ? "debt-dialog" : "simple-dialog"}
      >
        <form onSubmit={save}>
          <DialogTitle className="flex justify-between items-center">
            <span className="flex items-center gap-2">
              {modal === "debt" && (
                <ReferenceIcon name="debt-action" size={22} />
              )}
              {t(
                modal === "debt"
                  ? editId
                    ? "editDebt"
                    : "addDebt"
                  : modal === "contact"
                    ? "addContact"
                    : modal === "folder"
                      ? "addFolder"
                      : modal === "payment"
                        ? "quick"
                        : modal === "history"
                          ? "history"
                          : "profile",
              )}
            </span>
            <IconButton aria-label={t("close")} onClick={closeModal}>
              <X size={20} />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <div className="modal-fields">
              {error && <Alert severity="error">{error}</Alert>}
              {(modal === "contact" ||
                modal === "folder" ||
                modal === "profile") &&
                textInput(
                  "name",
                  modal === "folder" ? "folderName" : "name",
                  true,
                )}
              {modal === "contact" && (
                <>
                  {textInput("phone", "phone")}
                  {
                    <TextField
                      fullWidth
                      multiline
                      minRows={3}
                      label={t("note")}
                      value={form.note || ""}
                      onChange={(e) => field("note", e.target.value)}
                    />
                  }
                </>
              )}
              {modal === "debt" && (
                <DebtFields
                  form={form}
                  field={field}
                  contacts={contacts}
                  folders={folders}
                  image={debtImage}
                  setImage={setDebtImage}
                  addFolder={() => {
                    setReturnForm(form);
                    setReturnId(editId);
                    open("folder");
                  }}
                  addContact={() => {
                    setReturnForm(form);
                    setReturnId(editId);
                    open("contact");
                  }}
                />
              )}
              {modal === "payment" && (
                <>
                  <TextField
                    required
                    fullWidth
                    select
                    size="small"
                    label={t("chooseDebt")}
                    value={form.debt_id || ""}
                    onChange={(e) => field("debt_id", e.target.value)}
                  >
                    {debts
                      .filter((d) => d.status !== "paid")
                      .map((d) => (
                        <MenuItem value={d.id} key={d.id}>
                          {contactName(d.contact_id)} —{" "}
                          {money(
                            d.status === "paid"
                              ? 0
                              : Number(d.amount) - paidAmount(d.id),
                          )}{" "}
                          {d.currency}
                        </MenuItem>
                      ))}
                  </TextField>
                  {form.debt_id && (
                    <>
                      {textInput("amount", "amount", true, "number")}
                      {textInput("note", "note")}
                    </>
                  )}
                </>
              )}
              {modal === "view-profile" && (
                <>
                  <p>{user?.name}</p>
                  <p>{user?.email}</p>
                </>
              )}
              {modal === "history" && images[form.debt_id] && (
                <img
                  className="history-photo"
                  src={images[form.debt_id]}
                  alt={t("image")}
                />
              )}
              {modal === "history" && (
                <>
                  {payments
                    .filter((p) => p.debt_id === form.debt_id)
                    .map((p) => (
                      <div key={p.id} className="payment-row">
                        <span>
                          {new Date(p.paid_at).toLocaleDateString()}
                          <small>{p.note}</small>
                        </span>
                        <b>{money(p.amount)}</b>
                      </div>
                    ))}
                  {!payments.some((p) => p.debt_id === form.debt_id) && (
                    <p>{t("emptyPayments")}</p>
                  )}
                </>
              )}
            </div>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button color="primary" onClick={closeModal}>
              {t("cancel")}
            </Button>
            {modal !== "history" && modal !== "view-profile" && (
              <Button
                disabled={busy || (modal === "payment" && !form.debt_id)}
                type="submit"
                variant="contained"
              >
                {busy ? (
                  <CircularProgress size={20} />
                ) : (
                  t(
                    modal === "payment"
                      ? "payment"
                      : editId || modal === "debt" || modal === "profile"
                        ? "save"
                        : "create",
                  )
                )}
              </Button>
            )}
          </DialogActions>
        </form>
      </Dialog>
      <Dialog open={!!deleteItem} onClose={() => setDeleteItem(null)}>
        <DialogTitle>{t("confirm")}</DialogTitle>
        <DialogActions>
          <Button onClick={() => setDeleteItem(null)}>{t("cancel")}</Button>
          <Button color="error" disabled={busy} onClick={remove}>
            {t("remove")}
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={!!notice}
        autoHideDuration={3500}
        onClose={() => setNotice("")}
        message={notice}
      />
    </ThemeProvider>
  );
}

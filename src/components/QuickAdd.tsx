import { Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import ReferenceIcon from "./ReferenceIcon";

interface Props {
  expanded: boolean;
  toggle: () => void;
  add: (direction: string) => void;
}

export default function QuickAdd({ expanded, toggle, add }: Props) {
  const { t } = useTranslation();
  return (
    <div className="fab-wrap">
      {expanded && (
        <div className="quick-actions">
          {["i_owe_them", "they_owe_me"].map((direction, index) => (
            <button
              className="quick-action"
              key={direction}
              onClick={() => add(direction)}
            >
              <span className="quick-label">
                {t(index ? "lent" : "borrowed")}
              </span>
              <span className={`quick-icon ${index ? "green" : "red"}`}>
                <ReferenceIcon name="quick-money" size={22} />
              </span>
            </button>
          ))}
        </div>
      )}
      <button
        className="fab"
        aria-label={t("addDebt")}
        aria-expanded={expanded}
        onClick={toggle}
      >
        <Plus size={25} />
      </button>
    </div>
  );
}

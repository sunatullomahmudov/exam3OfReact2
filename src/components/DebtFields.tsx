import {
  Autocomplete,
  IconButton,
  MenuItem,
  OutlinedInput,
  Select,
} from "@mui/material";
import { ImagePlus, Plus, Calculator, Trash2 } from "lucide-react";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import type { Contact, Folder } from "../types";

interface Props {
  form: Record<string, string>;
  field: (key: string, value: string) => void;
  contacts: Contact[];
  folders: Folder[];
  addFolder: () => void;
  addContact: () => void;
  image: string;
  setImage: (value: string) => void;
}
export default function DebtFields({
  form,
  field,
  contacts,
  folders,
  addFolder,
  image,
  setImage,
}: Props) {
  const { t } = useTranslation();
  return (
    <div className="debt-fields">
      <label className="field-label">
        {t("person")} *
        <Autocomplete
          freeSolo
          size="small"
          options={contacts}
          getOptionLabel={(c) => (typeof c === "string" ? c : c.name)}
          value={contacts.find((c) => c.id === form.contact_id) || null}
          inputValue={
            form.contact_name ??
            contacts.find((c) => c.id === form.contact_id)?.name ??
            ""
          }
          onInputChange={(_, name) => {
            field("contact_name", name);
            field(
              "contact_id",
              contacts.find(
                (c) =>
                  c.name.trim().toLowerCase() === name.trim().toLowerCase(),
              )?.id || "",
            );
          }}
          onChange={(_, contact) => {
            field(
              "contact_name",
              typeof contact === "string" ? contact : contact?.name || "",
            );
            field(
              "contact_id",
              typeof contact === "string" ? "" : contact?.id || "",
            );
          }}
          renderInput={(params) => (
            <div ref={params.slotProps.input.ref}>
              <input
                {...params.slotProps.htmlInput}
                className="person-input"
                placeholder={t("personPlaceholder")}
                required
              />
            </div>
          )}
        />
        {form.contact_name?.trim() &&
          !contacts.some(
            (c) =>
              c.name.trim().toLowerCase() ===
              form.contact_name.trim().toLowerCase(),
          ) && (
            <span className="new-contact-helper">{t("newContactHint")}</span>
          )}
      </label>
      <div className="debt-amount-row">
        <label className="field-label">
          {t("amount")} *
          <OutlinedInput
            size="small"
            fullWidth
            required
            type="number"
            value={form.amount || ""}
            placeholder={t("amountPlaceholder")}
            onChange={(e) => field("amount", e.target.value)}
            inputProps={{ min: 0.01, step: ".01", max: 1000000000 }}
            endAdornment={<Calculator size={18} />}
          />
        </label>
        <div>
          <p className="field-label">{t("type")} *</p>
          <div className="direction-buttons">
            {["i_owe_them", "they_owe_me"].map((dir) => (
              <button
                type="button"
                role="checkbox"
                aria-checked={(form.direction || "they_owe_me") === dir}
                key={dir}
                className={`${dir} ${(form.direction || "they_owe_me") === dir ? "selected" : ""}`}
                onClick={() => field("direction", dir)}
              >
                {t(dir === "they_owe_me" ? "lent" : "borrowed")}
              </button>
            ))}
          </div>
        </div>
      </div>
      <label className="field-label">
        {t("folder")}
        <div className="folder-select">
          <Select
            fullWidth
            size="small"
            value={form.folder_id || ""}
            displayEmpty
            onChange={(e) => field("folder_id", e.target.value)}
          >
            <MenuItem value="">{t("none")}</MenuItem>
            {folders.map((f) => (
              <MenuItem key={f.id} value={f.id}>
                {f.name}
              </MenuItem>
            ))}
          </Select>
          <IconButton
            aria-label={t("addFolder")}
            onClick={addFolder}
            color="primary"
          >
            <Plus size={18} />
          </IconButton>
        </div>
      </label>
      <label className="field-label">
        {t("due")}
        <div className="date-input">
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              format="MM/DD/YYYY"
              value={form.due_date ? dayjs(form.due_date) : null}
              onChange={(value) =>
                field(
                  "due_date",
                  value?.isValid() ? value.format("YYYY-MM-DD") : "",
                )
              }
              slotProps={{
                textField: { size: "small", fullWidth: true },
                field: { clearable: true },
              }}
            />
          </LocalizationProvider>
        </div>
      </label>
      <label className="field-label">
        {t("description")}
        <OutlinedInput
          fullWidth
          multiline
          minRows={1}
          placeholder={t("descriptionPlaceholder")}
          value={form.description || ""}
          onChange={(e) => field("description", e.target.value)}
          inputProps={{ maxLength: 1000 }}
        />
      </label>
      <div>
        <p className="field-label">{t("image")}</p>
        {image ? (
          <div className="debt-photo-preview">
            <img src={image} alt={t("image")} />
            <IconButton
              aria-label={t("removeImage")}
              onClick={() => setImage("")}
            >
              <Trash2 size={19} />
            </IconButton>
          </div>
        ) : (
          <label className="image-placeholder">
            <>
              <ImagePlus size={23} />
              <span>{t("addImage")}</span>
            </>
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file && file.size < 5 * 1024 * 1024) {
                  const reader = new FileReader();
                  reader.onload = () => setImage(String(reader.result));
                  reader.readAsDataURL(file);
                }
              }}
            />
          </label>
        )}
      </div>
    </div>
  );
}

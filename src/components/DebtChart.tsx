import { useState } from "react";
import { IconButton, MenuItem, TextField } from "@mui/material";
import { ChevronRight } from "lucide-react";
import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import { useTranslation } from "react-i18next";
import type { Debt } from "../types";

const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

interface Props {
  debts: Debt[];
  dark: boolean;
  isMobile: boolean;
}

export default function DebtChart({ debts, dark, isMobile }: Props) {
  const { t } = useTranslation();
  const [year, setYear] = useState(() => new Date().getFullYear());
  const [half, setHalf] = useState(0);
  const chartOptions: ApexOptions = {
    chart: {
      type: "line",
      toolbar: { show: false },
      fontFamily: "Inter, Arial, sans-serif",
      background: "transparent",
      zoom: { enabled: false },
    },
    theme: { mode: dark ? "dark" : "light" },
    colors: ["#2ca87f", "#dc2626"],
    stroke: {
      width: 3,
      curve: "smooth",
    },
    fill: {
      type: "gradient",
      gradient: {
        shade: "light",
        type: "vertical",
        shadeIntensity: 0.4,
        opacityFrom: 0.4,
        opacityTo: 0.05,
        stops: [0, 100, 100],
      },
    },
    markers: {
      size: 4,
      strokeWidth: 2,
      strokeColors: dark ? "#dce3e8" : "#fff",
      colors: ["#2ca87f", "#dc2626"],
      hover: { sizeOffset: 3 },
    },
    legend: {
      position: "top",
      horizontalAlign: "left",
      fontSize: "13px",
      markers: { size: 7 },
      itemMargin: { horizontal: 10, vertical: 18 },
    },
    grid: {
      borderColor: dark ? "#37414b" : "rgba(219, 224, 229, 0.65)",
      strokeDashArray: 3,
      padding: { left: 10, right: 22, bottom: 8 },
    },
    xaxis: {
      categories: isMobile ? months.slice(half * 6, half * 6 + 6) : months,
      axisBorder: { color: "#dbe0e5" },
      axisTicks: { show: false },
      labels: { style: { colors: "#5b6b79", fontSize: "11px" } },
    },
    yaxis: {
      min: 0,
      max: (maximum) => (maximum > 0 ? Math.ceil(maximum / 500) * 500 : 1),
      tickAmount: 5,
      forceNiceScale: false,
      labels: {
        style: { colors: "#5b6b79", fontSize: "11px" },
        formatter: (value) =>
          debts.length
            ? value === 0 || value >= 1000
              ? `${Math.round(value / 1000)}k`
              : ""
            : value === 1
              ? "0k"
              : "",
      },
    },
    tooltip: {
      shared: true,
      intersect: false,
      theme: dark ? "dark" : "light",
      y: { formatter: (value) => Number(value).toLocaleString("ru-RU") },
    },
    dataLabels: { enabled: false },
  };
  const series = ["they_owe_me", "i_owe_them"].map((direction, index) => ({
    name: t(index ? "borrowedLegend" : "lentLegend"),
    data: (isMobile ? months.slice(half * 6, half * 6 + 6) : months).map(
      (_, index) => {
        const month = index + (isMobile ? half * 6 : 0);
        return debts
          .filter(
            (d) =>
              d.direction === direction &&
              new Date(d.created_at).getFullYear() === year &&
              new Date(d.created_at).getMonth() === month,
          )
          .reduce((sum, d) => sum + Number(d.amount), 0);
      },
    ),
  }));

  return (
    <section className="panel chart-panel">
      <div className="flex items-center justify-between px-6 pt-6">
        <h2>{t("chart")}</h2>
        <TextField
          select
          size="small"
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          aria-label={t("year")}
          sx={{ width: 110 }}
        >
          {[2024, 2025, 2026, 2027, 2028].map((y) => (
            <MenuItem key={y} value={y}>
              {y}
            </MenuItem>
          ))}
        </TextField>
      </div>
      <Chart
        options={chartOptions}
        series={series}
        type="line"
        height={isMobile ? 230 : 350}
      />
      {isMobile && (
        <div className="chart-pager">
          <IconButton disabled={half === 0} onClick={() => setHalf(0)}>
            <ChevronRight className="rotate-180" size={20} />
          </IconButton>
          <span>{half === 0 ? "Jan – Jun" : "Jul – Dec"}</span>
          <IconButton disabled={half === 1} onClick={() => setHalf(1)}>
            <ChevronRight size={20} />
          </IconButton>
        </div>
      )}
    </section>
  );
}

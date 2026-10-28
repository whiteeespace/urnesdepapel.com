"use client";

import { DayPicker } from "react-day-picker";
import { enCA, frCA } from "react-day-picker/locale";

import styles from "./DatePicker.module.scss";

interface Props {
  /** The chosen day as YYYY-MM-DD, or "" for none. */
  value: string;
  onChange: (value: string) => void;
  locale: string;
  labelledBy: string;
  previousLabel: string;
  nextLabel: string;
}

const pad = (n: number) => String(n).padStart(2, "0");
const toValue = (date: Date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
// Noon, so the day doesn't shift with the time zone.
const fromValue = (value: string) => (value ? new Date(`${value}T12:00:00`) : undefined);

// Two months side by side (one on phones), from this month on; past days can't be picked.
const DatePicker = ({ value, onChange, locale, labelledBy, previousLabel, nextLabel }: Props) => {
  const today = new Date();
  const selected = fromValue(value);

  return (
    <DayPicker
      mode="single"
      selected={selected}
      onSelect={(date) => onChange(date ? toValue(date) : "")}
      defaultMonth={selected ?? today}
      startMonth={today}
      disabled={{ before: today }}
      numberOfMonths={2}
      fixedWeeks
      locale={locale === "fr" ? frCA : enCA}
      aria-labelledby={labelledBy}
      labels={{ labelPrevious: () => previousLabel, labelNext: () => nextLabel }}
      classNames={{
        root: styles.root,
        months: styles.months,
        month: styles.month,
        month_caption: styles.caption,
        caption_label: styles.captionLabel,
        nav: styles.nav,
        button_previous: styles.navButton,
        button_next: styles.navButton,
        chevron: styles.chevron,
        month_grid: styles.grid,
        weekdays: styles.weekdays,
        weekday: styles.weekday,
        week: styles.week,
        day: styles.day,
        day_button: styles.dayButton,
        selected: styles.selected,
        today: styles.today,
        disabled: styles.disabled,
        outside: styles.outside,
        hidden: styles.hidden,
      }}
    />
  );
};

export default DatePicker;

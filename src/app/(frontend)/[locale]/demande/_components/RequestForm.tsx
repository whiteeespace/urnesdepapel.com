"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import classNames from "classnames";
import { useLocale, useTranslations } from "next-intl";
import { useState, type ReactNode } from "react";
import { useForm, useWatch } from "react-hook-form";

import { Button, TextLink } from "@/components/Button";
import UrnFigure from "@/components/UrnFigure";
import { formatPrice } from "@/lib/price";
import { requestSchema, type RequestErrorKey, type RequestFormValues } from "@/lib/request-schema";
import type { Shape } from "@/payload/collections/Models";

import submitRequest from "../_actions/submit-request";

import styles from "./styles.module.scss";

export interface FormUrn {
  number: number;
  modelName: string;
  colour: string;
  description: string;
  price: number;
  shape: Shape;
  tint: string | null;
}

export interface FormOption {
  id: string;
  name: string;
  description: string;
  priceMin: number;
  priceMax: number | null;
  requires: string | null;
}

interface Props {
  urns: FormUrn[];
  options: FormOption[];
  basePrice: number;
  initialUrn: string;
  phone: string;
  leadTimeNote: string;
}

const TYPES = ["order", "customize", "question"] as const;

const Field = ({
  id,
  label,
  hint,
  error,
  children,
}: {
  id: string;
  label: ReactNode;
  hint?: ReactNode;
  error?: string;
  children: ReactNode;
}) => (
  <div className={styles.field}>
    <label htmlFor={id} className={styles.label}>
      {label}
    </label>
    {children}
    {hint && (
      <span id={`${id}-hint`} className={styles.hint}>
        {hint}
      </span>
    )}
    {error && (
      <span id={`${id}-error`} className={styles.error}>
        {error}
      </span>
    )}
  </div>
);

const Required = ({ label }: { label: string }) => (
  <>
    <span className={styles.required} aria-hidden="true">
      *
    </span>
    <span className="visually-hidden">({label})</span>
  </>
);

const RequestForm = ({ urns, options, basePrice, initialUrn, phone, leadTimeNote }: Props) => {
  const t = useTranslations("request");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const [result, setResult] = useState<"idle" | "sent" | "error">("idle");
  const [sentTo, setSentTo] = useState<{ name: string; via: "email" | "phone" } | null>(null);

  const defaultValues: RequestFormValues = {
    type: "order",
    urn: initialUrn,
    options: [],
    preferredDate: "",
    name: "",
    email: "",
    phone: "",
    contactPreference: "email",
    message: "",
    website: "",
  };

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors, isSubmitting, isSubmitted },
  } = useForm<RequestFormValues>({ resolver: zodResolver(requestSchema), defaultValues });

  const [type, urnValue, selected] = useWatch({ control, name: ["type", "urn", "options"] });
  const groups = urns.reduce<[string, FormUrn[]][]>((acc, urn) => {
    const last = acc.at(-1);
    if (last?.[0] === urn.modelName) last[1].push(urn);
    else acc.push([urn.modelName, [urn]]);
    return acc;
  }, []);
  const selectedUrn = urns.find((urn) => String(urn.number) === urnValue);
  const isSelected = (id: string | null) => id !== null && selected.includes(id);
  const optionName = (id: string | null) => options.find((option) => option.id === id)?.name ?? "";

  // Unchecking an option also unchecks the options that depend on it.
  const toggleOption = (option: FormOption, checked: boolean) => {
    const next = checked
      ? [...selected, option.id]
      : selected.filter((id) => id !== option.id && options.find((o) => o.id === id)?.requires !== option.id);
    setValue("options", next, { shouldDirty: true });
  };

  const activeOptions = options.filter(
    (option) => isSelected(option.id) && (!option.requires || isSelected(option.requires))
  );
  const lines: { label: string; min: number; max: number }[] = [];
  if (selectedUrn) {
    lines.push({
      label: t("estimate.urn", {
        title: `${selectedUrn.modelName} ${tCommon("urnNumber", { number: selectedUrn.number })}`,
      }),
      min: selectedUrn.price,
      max: selectedUrn.price,
    });
  } else if (type !== "question" || activeOptions.length > 0) {
    lines.push({ label: t("estimate.basicUrn"), min: basePrice, max: basePrice });
  }
  for (const option of activeOptions) {
    lines.push({ label: option.name, min: option.priceMin, max: option.priceMax ?? option.priceMin });
  }
  const totalMin = lines.reduce((sum, line) => sum + line.min, 0);
  const totalMax = lines.reduce((sum, line) => sum + line.max, 0);

  const errorText = (key?: string) => (key ? t(`errors.${key as RequestErrorKey}`) : undefined);
  const describedBy = (id: string, error: unknown, hint = false) =>
    classNames({ [`${id}-hint`]: hint, [`${id}-error`]: Boolean(error) }) || undefined;

  const onSubmit = async (values: RequestFormValues) => {
    const response = await submitRequest(values);
    if (!response.ok) {
      setResult("error");
      return;
    }
    setSentTo({ name: values.name, via: values.contactPreference });
    setResult("sent");
    window.scrollTo({ top: 0 });
  };

  if (result === "sent" && sentTo) {
    return (
      <div className={styles.done} role="status">
        <h2 className={styles.doneTitle}>{t("done.title", { name: sentTo.name })}</h2>
        <p className={styles.doneBody}>{t("done.body", { via: sentTo.via })}</p>
        <div className={styles.actions}>
          <Button
            variant="secondary"
            onClick={() => {
              reset(defaultValues);
              setResult("idle");
              setSentTo(null);
            }}
          >
            {t("done.again")}
          </Button>
          <TextLink href="/">{t("done.back")}</TextLink>
        </div>
      </div>
    );
  }

  const hasErrors = isSubmitted && Object.keys(errors).length > 0;

  return (
    <div className={styles.layout}>
      <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
        {hasErrors && (
          <p className={styles.alert} role="alert">
            {t("errors.summary")}
          </p>
        )}

        <fieldset className={styles.fieldset}>
          <legend className={styles.legend}>{t("type.legend")}</legend>
          <div className={styles.chips}>
            {TYPES.map((value) => (
              <label key={value} className={styles.chip}>
                <input type="radio" value={value} {...register("type")} />
                <span>{t(`type.${value}`)}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className={styles.fieldset}>
          <legend className={styles.legend}>{t("urn.legend")}</legend>
          <Field id="urn" label={t("urn.label")}>
            <select id="urn" className={styles.input} {...register("urn")}>
              <option value="">{t("urn.none")}</option>
              {groups.map(([modelName, group]) => (
                <optgroup key={modelName} label={modelName}>
                  {group.map((urn) => (
                    <option key={urn.number} value={String(urn.number)}>
                      {modelName} {tCommon("urnNumber", { number: urn.number })} · {urn.colour}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </Field>
          {selectedUrn && (
            <div className={styles.preview}>
              <UrnFigure shape={selectedUrn.shape} tint={selectedUrn.tint} sizes="64px" />
              <p>{selectedUrn.description}</p>
            </div>
          )}
        </fieldset>

        {options.length > 0 && (
          <fieldset className={styles.fieldset}>
            <legend className={styles.legend}>{t("options.legend")}</legend>
            <div className={styles.checks}>
              {options.map((option) => {
                const locked = Boolean(option.requires) && !isSelected(option.requires);
                return (
                  <label key={option.id} className={classNames(styles.check, locked && styles.locked)}>
                    <input
                      type="checkbox"
                      checked={isSelected(option.id) && !locked}
                      disabled={locked}
                      onChange={(event) => toggleOption(option, event.target.checked)}
                    />
                    <span>
                      <span className={styles.checkName}>{option.name}</span>
                      <span className={styles.hint}>
                        {locked
                          ? t("options.requires", { option: optionName(option.requires) })
                          : option.description}
                      </span>
                    </span>
                    <span className={styles.checkPrice}>
                      + {formatPrice(locale, option.priceMin, option.priceMax)}
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>
        )}

        <fieldset className={styles.fieldset}>
          <legend className={styles.legend}>{t("timing.legend")}</legend>
          <Field
            id="preferredDate"
            label={
              <>
                {t("timing.label")} <span className={styles.optional}>({t("optional")})</span>
              </>
            }
            hint={t("timing.hint")}
          >
            <input
              id="preferredDate"
              type="date"
              className={classNames(styles.input, styles.date)}
              aria-describedby="preferredDate-hint"
              {...register("preferredDate")}
            />
          </Field>
        </fieldset>

        <fieldset className={styles.fieldset}>
          <legend className={styles.legend}>{t("contact.legend")}</legend>
          <Field
            id="name"
            label={
              <>
                {t("contact.name")} <Required label={t("required")} />
              </>
            }
            error={errorText(errors.name?.message)}
          >
            <input
              id="name"
              type="text"
              autoComplete="name"
              className={styles.input}
              aria-invalid={Boolean(errors.name)}
              aria-describedby={describedBy("name", errors.name)}
              {...register("name")}
            />
          </Field>
          <div className={styles.two}>
            <Field
              id="email"
              label={
                <>
                  {t("contact.email")} <Required label={t("required")} />
                </>
              }
              error={errorText(errors.email?.message)}
            >
              <input
                id="email"
                type="email"
                autoComplete="email"
                className={styles.input}
                aria-invalid={Boolean(errors.email)}
                aria-describedby={describedBy("email", errors.email)}
                {...register("email")}
              />
            </Field>
            <Field
              id="phone"
              label={
                <>
                  {t("contact.phone")} <span className={styles.optional}>({t("optional")})</span>
                </>
              }
              error={errorText(errors.phone?.message)}
            >
              <input
                id="phone"
                type="tel"
                autoComplete="tel"
                className={styles.input}
                aria-invalid={Boolean(errors.phone)}
                aria-describedby={describedBy("phone", errors.phone)}
                {...register("phone")}
              />
            </Field>
          </div>
          <div className={styles.field} role="radiogroup" aria-labelledby="preference-label">
            <span id="preference-label" className={styles.label}>
              {t("contact.preference")}
            </span>
            <div className={styles.radios}>
              <label>
                <input type="radio" value="email" {...register("contactPreference")} />
                {t("contact.byEmail")}
              </label>
              <label>
                <input type="radio" value="phone" {...register("contactPreference")} />
                {t("contact.byPhone")}
              </label>
            </div>
          </div>
          <Field
            id="message"
            label={
              <>
                {t("contact.message")}{" "}
                {type === "question" ? (
                  <Required label={t("required")} />
                ) : (
                  <span className={styles.optional}>({t("optional")})</span>
                )}
              </>
            }
            error={errorText(errors.message?.message)}
          >
            <textarea
              id="message"
              rows={6}
              className={classNames(styles.input, styles.textarea)}
              placeholder={t("contact.messageHint")}
              aria-invalid={Boolean(errors.message)}
              aria-describedby={describedBy("message", errors.message)}
              {...register("message")}
            />
          </Field>
          <div className={styles.honeypot} aria-hidden="true">
            <label htmlFor="website">Website</label>
            <input id="website" type="text" tabIndex={-1} autoComplete="off" {...register("website")} />
          </div>
        </fieldset>

        <div className={styles.submit}>
          {lines.length > 0 && (
            <span className={styles.inlineEstimate}>
              {t("estimate.title")}
              {locale === "fr" ? "\u202f: " : ": "}
              {formatPrice(locale, totalMin, totalMax)}
            </span>
          )}
          {result === "error" && (
            <p className={styles.alert} role="alert">
              {t("errors.server", { phone })}
            </p>
          )}
          <div>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? t("sending") : t("submit")}
            </Button>
          </div>
        </div>
      </form>

      <aside className={styles.estimate} aria-live="polite">
        <h2 className={styles.legend}>{t("estimate.title")}</h2>
        {lines.length > 0 ? (
          <>
            <ul className={styles.lines}>
              {lines.map((line) => (
                <li key={line.label}>
                  <span>{line.label}</span>
                  <span className={styles.amount}>{formatPrice(locale, line.min, line.max)}</span>
                </li>
              ))}
            </ul>
            <div className={styles.total}>
              <span>{t("estimate.total")}</span>
              <strong>{formatPrice(locale, totalMin, totalMax)}</strong>
            </div>
          </>
        ) : (
          <p className={styles.hint}>{t("estimate.empty")}</p>
        )}
        <p className={styles.hint}>{t("estimate.note")}</p>
        {leadTimeNote && <p className={styles.note}>{leadTimeNote}</p>}
      </aside>
    </div>
  );
};

export default RequestForm;

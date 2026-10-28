"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import classNames from "classnames";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { useForm, useWatch, type DefaultValues } from "react-hook-form";

import { Button, TextLink } from "@/components/Button";
import UrnFigure from "@/components/UrnFigure";
import { formatPrice } from "@/lib/price";
import { requestSchema, type RequestErrorKey, type RequestFormValues } from "@/lib/request-schema";
import type { Shape } from "@/payload/collections/Models";
import type { Media } from "@/payload-types";

import submitRequest from "../_actions/submit-request";

import DatePicker from "./DatePicker";
import styles from "./styles.module.scss";

export interface FormUrn {
  number: number;
  modelName: string;
  colour: string;
  description: string;
  price: number;
  shape: Shape;
  tint: string | null;
  /** The urn's first photo, and its model's cover; the drawing stands in for a missing one. */
  photo?: Media;
  modelCover?: Media;
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
}

type Type = RequestFormValues["type"];
type StepId = "type" | "model" | "urn" | "options" | "timing" | "contact";

const TYPES = ["order", "question"] as const;

// One question per screen. A question goes straight to the contact details; choosing no model
// skips the colours. `model` is null until answered and "" for "not sure yet".
const pathFor = (type: Type, model: string | null): StepId[] =>
  type === "question"
    ? ["type", "contact"]
    : ["type", "model", ...(model === "" ? [] : (["urn"] as const)), "options", "timing", "contact"];

const Field = ({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: ReactNode;
  error?: string;
  children: ReactNode;
}) => (
  <div className={styles.field}>
    <label htmlFor={id} className={styles.label}>
      {label}
    </label>
    {children}
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

const Tick = () => (
  <svg className={styles.tick} viewBox="0 0 16 16" aria-hidden="true">
    <path d="M3.5 8.5l3 3 6-7" />
  </svg>
);

// A selectable answer: a native radio or checkbox inside a card.
const Choice = ({
  input,
  icon,
  title,
  hint,
  aside,
  disabled,
}: {
  input: ReactNode;
  icon?: ReactNode;
  title: ReactNode;
  hint?: ReactNode;
  aside?: ReactNode;
  disabled?: boolean;
}) => (
  <label className={classNames(styles.choice, disabled && styles.disabled)}>
    {input}
    {icon && <span className={styles.icon}>{icon}</span>}
    <span className={styles.choiceText}>
      <span className={styles.choiceTitle}>{title}</span>
      {hint && <span className={styles.hint}>{hint}</span>}
    </span>
    {aside && <span className={styles.aside}>{aside}</span>}
  </label>
);

// A personalization in one row: tick box, name and what it is, then the price. One that needs
// another option first is faded until that one is ticked.
const OptionCard = ({
  input,
  title,
  description,
  price,
  locked,
}: {
  input: ReactNode;
  title: string;
  description: string;
  price: string;
  locked: boolean;
}) => (
  <label className={classNames(styles.choice, styles.option, locked && styles.disabled)}>
    {input}
    <span className={styles.box}>
      <Tick />
    </span>
    <span className={styles.choiceText}>
      <span className={styles.choiceTitle}>{title}</span>
      <span className={styles.hint}>{description}</span>
    </span>
    <span className={styles.aside}>{price}</span>
  </label>
);

const RequestForm = ({ urns, options, basePrice, initialUrn, phone }: Props) => {
  const t = useTranslations("request");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const [result, setResult] = useState<"idle" | "sent" | "error">("idle");
  const [sentTo, setSentTo] = useState<string | null>(null);
  const initialModel = urns.find((urn) => String(urn.number) === initialUrn)?.modelName ?? null;
  const [model, setModel] = useState<string | null>(initialModel);
  const [step, setStep] = useState<StepId>("type");
  const formRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const moved = useRef(false);
  const arrowKey = useRef(false);

  // Nothing is picked on the first question, unless the person came from an urn's "request" link.
  const defaultValues: DefaultValues<RequestFormValues> = {
    type: initialUrn ? "order" : undefined,
    urn: initialUrn,
    options: [],
    preferredDate: "",
    name: "",
    email: "",
    phone: "",
    message: "",
    website: "",
  };

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors, isSubmitting },
    // Each field is checked when the person leaves it, then again as they correct it.
  } = useForm<RequestFormValues>({ resolver: zodResolver(requestSchema), defaultValues, mode: "onTouched" });

  const [type, urnValue, selected, preferredDate] = useWatch({
    control,
    name: ["type", "urn", "options", "preferredDate"],
  });
  const path = pathFor(type, model);
  const index = Math.max(path.indexOf(step), 0);

  // After each move, bring the new question into view and give it focus for screen readers.
  useEffect(() => {
    if (!moved.current) return;
    if (formRef.current && formRef.current.getBoundingClientRect().top < 0) {
      formRef.current.scrollIntoView({ block: "start", behavior: "smooth" });
    }
    headingRef.current?.focus({ preventScroll: true });
  }, [step]);

  const models = urns.reduce<{ name: string; urns: FormUrn[] }[]>((acc, urn) => {
    const last = acc.at(-1);
    if (last?.name === urn.modelName) last.urns.push(urn);
    else acc.push({ name: urn.modelName, urns: [urn] });
    return acc;
  }, []);
  const selectedUrn = urns.find((urn) => String(urn.number) === urnValue);
  const isSelected = (id: string | null) => id !== null && selected.includes(id);

  const goTo = (next: StepId | undefined) => {
    if (!next) return;
    moved.current = true;
    setStep(next);
  };
  // The next step is worked out from the answer just given, before it has re-rendered.
  const advance = (from: StepId, nextType = type, nextModel = model) => {
    const nextPath = pathFor(nextType, nextModel);
    goTo(nextPath[nextPath.indexOf(from) + 1]);
  };

  // A pointer click or Space on an answer moves on; arrowing through the answers only picks.
  const pick = (move: () => void) => {
    if (arrowKey.current) arrowKey.current = false;
    else move();
  };
  const trackArrows = (event: { key: string }) => {
    arrowKey.current = event.key.startsWith("Arrow");
  };

  const chooseModel = (name: string) => {
    if (selectedUrn?.modelName !== name) setValue("urn", "");
    setModel(name);
    advance("model", type, name);
  };

  // Unchecking an option also unchecks the options that depend on it.
  const toggleOption = (option: FormOption, checked: boolean) => {
    const next = checked
      ? [...selected, option.id]
      : selected.filter((id) => id !== option.id && options.find((o) => o.id === id)?.requires !== option.id);
    setValue("options", next, { shouldDirty: true });
  };

  const activeOptions =
    type === "question"
      ? []
      : options.filter(
          (option) => isSelected(option.id) && (!option.requires || isSelected(option.requires))
        );
  const base = selectedUrn?.price ?? basePrice;
  const totalMin = base + activeOptions.reduce((sum, option) => sum + option.priceMin, 0);
  const totalMax =
    base + activeOptions.reduce((sum, option) => sum + (option.priceMax ?? option.priceMin), 0);
  const dateLabel = preferredDate
    ? new Intl.DateTimeFormat(locale === "fr" ? "fr-CA" : "en-CA", { dateStyle: "long" }).format(
        new Date(`${preferredDate}T12:00:00`)
      )
    : null;

  const errorText = (key?: string) => (key ? t(`errors.${key as RequestErrorKey}`) : undefined);
  const describedBy = (id: string, error: unknown) => (error ? `${id}-error` : undefined);

  const onSubmit = async (values: RequestFormValues) => {
    const response = await submitRequest({
      ...values,
      options: values.type === "question" ? [] : values.options,
      preferredDate: values.type === "question" ? "" : values.preferredDate,
    });
    if (!response.ok) {
      setResult("error");
      return;
    }
    setSentTo(values.name);
    setResult("sent");
    window.scrollTo({ top: 0 });
  };

  // Enter moves on from the date; only the contact step sends the request.
  const onFormSubmit = (event: FormEvent<HTMLFormElement>) => {
    if (step === "contact") {
      handleSubmit(onSubmit)(event);
      return;
    }
    event.preventDefault();
    if (step === "options" || step === "timing") advance(step);
  };

  if (result === "sent" && sentTo) {
    return (
      <div className={styles.done} role="status">
        <span className={styles.doneMark}>
          <Tick />
        </span>
        <h2 className={styles.doneTitle}>{t("done.title", { name: sentTo })}</h2>
        <p className={styles.doneBody}>{t("done.body")}</p>
        <div className={styles.actions}>
          <Button
            variant="secondary"
            onClick={() => {
              reset(defaultValues);
              setResult("idle");
              setSentTo(null);
              setModel(initialModel);
              moved.current = false;
              setStep("type");
            }}
          >
            {t("done.again")}
          </Button>
          <TextLink href="/">{t("done.back")}</TextLink>
        </div>
      </div>
    );
  }

  const question = (title: string, hint?: string, optional?: boolean) => (
    <div className={styles.head}>
      <h2 ref={headingRef} tabIndex={-1} className={styles.question}>
        {title}
        {optional && <span className={styles.optional}> ({t("optional")})</span>}
      </h2>
      {hint && <p className={styles.lead}>{hint}</p>}
    </div>
  );

  const renderStep = () => {
    switch (step) {
      case "type":
        return (
          <fieldset className={styles.fieldset}>
            <legend className="visually-hidden">{t("type.title")}</legend>
            {question(t("type.title"))}
            <div className={styles.choices} onKeyDown={trackArrows}>
              {TYPES.map((value) => (
                <Choice
                  key={value}
                  title={t(`type.${value}`)}
                  hint={t(`type.${value}Hint`)}
                  input={
                    <input
                      type="radio"
                      value={value}
                      className={styles.input}
                      {...register("type")}
                      onClick={() => pick(() => advance("type", value))}
                    />
                  }
                />
              ))}
            </div>
          </fieldset>
        );

      case "model":
        return (
          <fieldset className={styles.fieldset}>
            <legend className="visually-hidden">{t("model.title")}</legend>
            {question(t("model.title"))}
            <div className={styles.choices} onKeyDown={trackArrows}>
              {models.map(({ name, urns: group }) => (
                <Choice
                  key={name}
                  icon={
                    <UrnFigure
                      media={group[0]?.modelCover ?? group.find((urn) => urn.photo)?.photo}
                      shape={group[0]?.shape}
                      ratio="square"
                      sizes="44px"
                    />
                  }
                  title={name}
                  hint={t("model.count", { count: group.length })}
                  input={
                    <input
                      type="radio"
                      name="model"
                      checked={model === name}
                      className={styles.input}
                      onChange={() => undefined}
                      onClick={() => pick(() => chooseModel(name))}
                    />
                  }
                />
              ))}
              <Choice
                title={t("model.none")}
                hint={t("model.noneHint")}
                input={
                  <input
                    type="radio"
                    name="model"
                    checked={model === ""}
                    className={styles.input}
                    onChange={() => undefined}
                    onClick={() => pick(() => chooseModel(""))}
                  />
                }
              />
            </div>
          </fieldset>
        );

      case "urn":
        return (
          <fieldset className={styles.fieldset}>
            <legend className="visually-hidden">{t("urn.title")}</legend>
            {question(t("urn.title"), model ?? undefined)}
            <div className={styles.choices} onKeyDown={trackArrows}>
              {models
                .find(({ name }) => name === model)
                ?.urns.map((urn) => (
                  <Choice
                    key={urn.number}
                    icon={
                      <UrnFigure
                        media={urn.photo}
                        shape={urn.shape}
                        tint={urn.tint}
                        ratio="square"
                        sizes="44px"
                      />
                    }
                    title={urn.colour}
                    hint={tCommon("urnNumber", { number: urn.number })}
                    aside={formatPrice(locale, urn.price)}
                    input={
                      <input
                        type="radio"
                        value={String(urn.number)}
                        className={styles.input}
                        {...register("urn")}
                        onClick={() => pick(() => advance("urn"))}
                      />
                    }
                  />
                ))}
            </div>
          </fieldset>
        );

      case "options":
        return (
          <fieldset className={styles.fieldset}>
            <legend className="visually-hidden">{t("options.title")}</legend>
            {question(t("options.title"), t("options.hint"))}
            <div className={styles.choices}>
              {options.map((option) => {
                const locked = Boolean(option.requires) && !isSelected(option.requires);
                return (
                  <OptionCard
                    key={option.id}
                    title={option.name}
                    description={option.description}
                    price={`+ ${formatPrice(locale, option.priceMin, option.priceMax)}`}
                    locked={locked}
                    input={
                      <input
                        type="checkbox"
                        className={styles.input}
                        checked={isSelected(option.id) && !locked}
                        disabled={locked}
                        onChange={(event) => toggleOption(option, event.target.checked)}
                      />
                    }
                  />
                );
              })}
            </div>
          </fieldset>
        );

      case "timing":
        return (
          <fieldset className={styles.fieldset}>
            <legend className="visually-hidden">{t("timing.title")}</legend>
            {question(t("timing.title"), undefined, true)}
            <div className={styles.reveal}>
              <span id="preferredDate-label" className={styles.label}>
                {t("timing.label")}
                {dateLabel && <span className={styles.chosen}> · {dateLabel}</span>}
              </span>
              <DatePicker
                value={preferredDate}
                onChange={(value) => setValue("preferredDate", value, { shouldDirty: true })}
                locale={locale}
                labelledBy="preferredDate-label"
                previousLabel={t("timing.previousMonth")}
                nextLabel={t("timing.nextMonth")}
              />
            </div>
          </fieldset>
        );

      case "contact":
        return (
          <fieldset className={classNames(styles.fieldset, styles.contact)}>
            <legend className="visually-hidden">{t("contact.title")}</legend>
            {question(t("contact.title"), t("contact.intro"))}

            {type !== "question" && (
              <div className={styles.summary}>
                {selectedUrn && (
                  <span className={styles.icon}>
                    <UrnFigure
                      media={selectedUrn.photo}
                      shape={selectedUrn.shape}
                      tint={selectedUrn.tint}
                      ratio="square"
                      sizes="44px"
                    />
                  </span>
                )}
                <span className={styles.choiceText}>
                  <span className={styles.choiceTitle}>
                    {selectedUrn
                      ? `${selectedUrn.modelName} ${tCommon("urnNumber", { number: selectedUrn.number })} · ${selectedUrn.colour}`
                      : t("summary.noUrn")}
                  </span>
                  {(activeOptions.length > 0 || dateLabel) && (
                    <span className={classNames(styles.hint, styles.summaryItems)}>
                      {[
                        ...activeOptions.map((option) => option.name),
                        dateLabel ? t("summary.date", { date: dateLabel }) : null,
                      ]
                        .filter(Boolean)
                        .map((item) => (
                          <span key={item}>{item}</span>
                        ))}
                    </span>
                  )}
                </span>
                <span className={styles.summaryEstimate}>
                  <span className={styles.estimate}>
                    {t("estimate.title")} <strong>{formatPrice(locale, totalMin, totalMax)}</strong>
                  </span>
                  <span className={styles.hint}>{t("estimate.note")}</span>
                </span>
              </div>
            )}

            <div className={styles.three}>
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
                  className={styles.text}
                  aria-invalid={Boolean(errors.name)}
                  aria-describedby={describedBy("name", errors.name)}
                  {...register("name")}
                />
              </Field>
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
                  inputMode="email"
                  autoComplete="email"
                  className={styles.text}
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
                  className={styles.text}
                  aria-invalid={Boolean(errors.phone)}
                  aria-describedby={describedBy("phone", errors.phone)}
                  {...register("phone")}
                />
              </Field>
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
                rows={3}
                className={classNames(styles.text, styles.textarea)}
                aria-invalid={Boolean(errors.message)}
                aria-describedby={describedBy("message", errors.message)}
                {...register("message")}
              />
            </Field>
            {result === "error" && (
              <p className={styles.alert} role="alert">
                {t("errors.server", { phone })}
              </p>
            )}
          </fieldset>
        );
    }
  };

  // Only the multiple-choice and typed steps need a button; the others move on when answered.
  const button =
    step === "options"
      ? activeOptions.length > 0
        ? t("next")
        : t("skip")
      : step === "timing"
        ? preferredDate
          ? t("next")
          : t("skip")
        : step === "contact"
          ? isSubmitting
            ? t("sending")
            : t("submit")
          : null;

  return (
    <div ref={formRef} className={styles.wrap}>
      {/* One segment per question; answered ones can be revisited. */}
      <nav aria-label={t("progress", { current: index + 1, total: path.length })}>
        <ol className={styles.steps}>
          {path.map((id, i) => {
            const label = (
              <>
                <span className={styles.stepNumber}>{String(i + 1).padStart(2, "0")}</span>
                <span className={styles.stepName}>{t(`steps.${id}`)}</span>
              </>
            );
            return (
              <li
                key={id}
                className={classNames(
                  styles.stepItem,
                  i < index && styles.stepDone,
                  i === index && styles.stepCurrent
                )}
                aria-current={i === index ? "step" : undefined}
              >
                {i < index ? (
                  <button type="button" className={styles.stepLink} onClick={() => goTo(id)}>
                    {label}
                  </button>
                ) : (
                  <span className={styles.stepLink}>{label}</span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>

      <form className={styles.form} onSubmit={onFormSubmit} noValidate>
        <div key={step} className={styles.step}>
          {renderStep()}
        </div>

        <div className={styles.honeypot} aria-hidden="true">
          <label htmlFor="website">Website</label>
          <input id="website" type="text" tabIndex={-1} autoComplete="off" {...register("website")} />
        </div>

        <div className={styles.footer}>
          {index > 0 ? (
            <button type="button" className={styles.back} onClick={() => goTo(path[index - 1])}>
              <span aria-hidden="true">←</span> {t("back")}
            </button>
          ) : (
            <span />
          )}
          <div className={styles.footerEnd}>
            {step === "options" && (
              <span className={styles.estimate}>
                {t("estimate.title")} <strong>{formatPrice(locale, totalMin, totalMax)}</strong>
              </span>
            )}
            {button && (
              <Button type="submit" disabled={isSubmitting}>
                {button}
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default RequestForm;

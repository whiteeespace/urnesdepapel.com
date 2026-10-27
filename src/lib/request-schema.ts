import { z } from "zod";

// Error messages are translation keys under `request.errors`.
export const requestSchema = z
  .object({
    type: z.enum(["order", "customize", "question"]),
    urn: z.string(),
    options: z.array(z.string()),
    preferredDate: z.string(),
    name: z.string().trim().min(1, { error: "nameRequired" }).max(200),
    email: z.email({ error: "emailInvalid" }).max(320),
    phone: z.string().trim().max(40),
    contactPreference: z.enum(["email", "phone"]),
    message: z.string().trim().max(5000),
    // Honeypot: people never see this field, bots fill it in.
    website: z.string().max(0),
  })
  .superRefine((data, ctx) => {
    if (data.contactPreference === "phone" && data.phone.replace(/\D/g, "").length < 7) {
      ctx.addIssue({ code: "custom", path: ["phone"], message: "phoneRequired" });
    }
    if (data.type === "question" && !data.message) {
      ctx.addIssue({ code: "custom", path: ["message"], message: "messageRequired" });
    }
  });

export type RequestFormValues = z.infer<typeof requestSchema>;

export type RequestErrorKey = "nameRequired" | "emailInvalid" | "phoneRequired" | "messageRequired";

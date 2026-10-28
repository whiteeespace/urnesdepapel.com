import { z } from "zod";

// Fields the cross-field checks below read; they only run once these are well-formed.
const REFINED = ["type", "message"];

// Error messages are translation keys under `request.errors`.
export const requestSchema = z
  .object({
    type: z.enum(["order", "question"]),
    urn: z.string(),
    options: z.array(z.string()),
    preferredDate: z.string(),
    name: z.string().trim().min(1, { error: "nameRequired" }).max(200),
    email: z.email({ error: "emailInvalid" }).max(320),
    phone: z.string().trim().max(40),
    message: z.string().trim().max(5000),
    // Honeypot: people never see this field, bots fill it in.
    website: z.string().max(0),
  })
  .superRefine(
    (data, ctx) => {
      if (data.type === "question" && !data.message) {
        ctx.addIssue({ code: "custom", path: ["message"], message: "messageRequired" });
      }
    },
    {
      // Also runs when the name or email is invalid, so every missing field is flagged at once.
      when: (payload) =>
        payload.issues.every(
          (issue) =>
            issue.path !== undefined && issue.path.length > 0 && !REFINED.includes(String(issue.path[0]))
        ),
    }
  );

export type RequestFormValues = z.infer<typeof requestSchema>;

export type RequestErrorKey = "nameRequired" | "emailInvalid" | "messageRequired";

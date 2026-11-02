import { getTranslations } from "next-intl/server";

import { ButtonLink } from "@/components/Button";
import { Page, PageHeader } from "@/components/Page";

const NotFound = async () => {
  const t = await getTranslations("notFound");

  return (
    <Page fill>
      <PageHeader title={t("title")}>
        <p>{t("body")}</p>
      </PageHeader>
      <div>
        <ButtonLink href="/" variant="secondary">
          {t("back")}
        </ButtonLink>
      </div>
    </Page>
  );
};

export default NotFound;

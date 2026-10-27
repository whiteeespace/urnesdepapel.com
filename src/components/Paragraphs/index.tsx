import { toParagraphs } from "@/lib/content";

interface Props {
  text: string | null | undefined;
  className?: string;
}

const Paragraphs = ({ text, className }: Props) =>
  toParagraphs(text).map((paragraph, index) => (
    <p key={index} className={className}>
      {paragraph}
    </p>
  ));

export default Paragraphs;

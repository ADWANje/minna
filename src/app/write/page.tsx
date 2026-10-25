import type { Metadata } from "next";
import { WriteFlow } from "@/components/WriteFlow";

export const metadata: Metadata = {
  title: "اترك جملتك",
  description: "شو الجملة اللي ضلّت معك؟ اكتبها، وبتصير صفحة بكتاب منّا.",
};

export default function WritePage() {
  return <WriteFlow />;
}

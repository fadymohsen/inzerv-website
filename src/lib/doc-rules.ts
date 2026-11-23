import type { ServiceDocument } from "./types";

type RequestFor = "myself" | "another_person";
type Values = Record<string, string | undefined>;

const has = (k: string, ...parts: string[]) => parts.every((p) => k.includes(p));

/** Free-text country fields that should be a dropdown of every country. */
export function isCountryField(keyName: string): boolean {
  const k = keyName.toLowerCase();
  return k === "birth_country" || k === "event_country" || k === "death_country" || k === "country" || k.endsWith("_country");
}

/** Free-text nationality fields (shown as the same country list). */
export function isNationalityField(keyName: string): boolean {
  return keyName.toLowerCase().includes("nationality");
}

/** Age in years from a 14-digit Egyptian national ID, or null when it is not a valid ID yet. */
export function ageFromNationalId(id?: string): number | null {
  const m = /^([23])(\d{2})(\d{2})(\d{2})\d{7}$/.exec((id ?? "").trim());
  if (!m) return null;
  const year = (m[1] === "2" ? 1900 : 2000) + Number(m[2]);
  const born = new Date(year, Number(m[3]) - 1, Number(m[4]));
  if (Number.isNaN(born.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - year;
  if (now < new Date(now.getFullYear(), born.getMonth(), born.getDate())) age -= 1;
  return age;
}

/** Doc keyName helpers. Live keys come from the catalogue; match loosely so admin-edited rows still work. */
const isApplicantId = (k: string) => k === "applicant_id_copy" || k === "applicant_national_id_copy";
const isHolderId = (k: string) => k === "holder_id_copy" || k === "holder_national_id_copy";
const isKinship = (k: string) => k.includes("kinship");

/**
 * Per-service document rules from the client review. Runs after the backend's
 * own showForAnotherPerson filter, so it only removes, relabels or toggles
 * required on the documents the customer would otherwise see.
 */
export function applyDocRules(
  docs: ServiceDocument[],
  serviceType: string,
  requestFor: RequestFor,
  values: Values,
): ServiceDocument[] {
  const other = requestFor === "another_person";
  let out = docs.map((d) => ({ ...d }));
  const drop = (test: (k: string) => boolean) => {
    out = out.filter((d) => !test(d.keyName.toLowerCase()));
  };
  const patch = (test: (k: string) => boolean, p: Partial<ServiceDocument>) => {
    out = out.map((d) => (test(d.keyName.toLowerCase()) ? { ...d, ...p } : d));
  };

  switch (serviceType) {
    case "death_certificate":
      // The proof-of-kinship upload already carries the applicant's ID.
      drop(isApplicantId);
      break;

    case "family_record":
      if (other) drop((k) => isHolderId(k) || isApplicantId(k));
      else drop(isKinship);
      break;

    case "individual_civil_status_record":
      if (other) {
        drop((k) => isApplicantId(k) || isHolderId(k));
      } else {
        drop(isHolderId);
        patch(isApplicantId, {
          labelEn: "National ID card of the record holder (both sides)",
          labelAr: "صورة بطاقة صاحب القيد (الوجهان)",
          isRequired: true,
        });
      }
      break;

    case "marriage_certificate":
      if (other) drop(isApplicantId);
      break;

    case "birth_certificate": {
      const age = ageFromNationalId(values.holder_national_id);
      if (!other && (age === null || age < 15)) {
        patch(isApplicantId, {
          labelEn: age === null ? "National ID card, or birth certificate if under 15" : "National ID card or birth certificate",
          labelAr: age === null ? "صورة بطاقة الرقم القومي، أو شهادة الميلاد إذا كان العمر أقل من 15 سنة" : "صورة بطاقة الرقم القومي أو شهادة الميلاد",
        });
      }
      break;
    }

    case "overseas_birth_registration":
      patch((k) => has(k, "mother") && k.includes("id"), { isRequired: false });
      break;

    case "overseas_divorce_registration":
      patch((k) => has(k, "husband", "passport"), {
        labelEn: "First party passport copy",
        labelAr: "صورة جواز سفر الطرف الأول",
      });
      patch((k) => has(k, "wife", "passport"), {
        labelEn: "Other party passport copy",
        labelAr: "صورة جواز سفر الطرف الآخر",
      });
      break;

    case "passport": {
      const cat = values.holder_category ?? "";
      const minor = cat === "under_15" || cat === "student_below_id_age";
      const student = cat === "student_below_id_age" || cat === "male_18_student" || cat === "female_18_student";
      const maleAdult = cat === "male_18_student" || cat === "male_18_not_student";
      const gender = values.holder_gender ?? "";
      if (cat) {
        out = out.filter((d) => {
          const k = d.keyName.toLowerCase();
          if (k === "national_id_copy") return !minor;
          if (k === "birth_certificate_copy" || k === "parent_id_copy") return minor;
          if (k === "enrolment_statement") return student;
          if (k === "military_status_certificate") return maleAdult && gender !== "female";
          return true;
        });
        out = out.map((d) => {
          const k = d.keyName.toLowerCase();
          if (["national_id_copy", "birth_certificate_copy", "parent_id_copy", "enrolment_statement"].includes(k)) {
            return { ...d, isRequired: true };
          }
          if (k === "military_status_certificate") return { ...d, isRequired: true };
          return d;
        });
      }
      break;
    }
  }

  // Every service: "person's card" wording.
  out = out.map((d) =>
    /صورة بطاقة الشخص(?!\s*الرقم)/.test(d.labelAr)
      ? { ...d, labelAr: d.labelAr.replace(/صورة بطاقة الشخص/g, "صورة بطاقة الرقم القومي للشخص") }
      : d,
  );
  return out;
}

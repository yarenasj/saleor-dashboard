import { TaxClassRateInput } from "@dashboard/graphql";
import { FormsetData } from "@dashboard/hooks/useFormset";

export interface TaxClassesPageFormData {
  id: string;
  updateTaxClassRates: FormsetData<TaxClassRateInput>;
  name?: string;
}

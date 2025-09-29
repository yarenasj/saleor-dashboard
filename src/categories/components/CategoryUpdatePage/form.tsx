import { useExitFormDialog } from "@dashboard/components/Form/useExitFormDialog";
import { CategoryDetailsFragment } from "@dashboard/graphql";
import useForm, { CommonUseFormResult, FormChange } from "@dashboard/hooks/useForm";
import useHandleFormSubmit from "@dashboard/hooks/useHandleFormSubmit";
import { mapMetadataItemToInput } from "@dashboard/utils/maps";
import { RichTextContext, RichTextContextValues } from "@dashboard/utils/richText/context";
import useRichText from "@dashboard/utils/richText/useRichText";
import { OutputData } from "@editorjs/editorjs";
import React, { useEffect } from "react";

export interface CategoryUpdateFormData {
  backgroundImageAlt: string;
  name: string;
  slug: string;
  seoTitle: string;
  seoDescription: string;
}
export interface CategoryUpdateData extends CategoryUpdateFormData {
  description: OutputData | null;
}

interface CategoryUpdateHandlers {
  changeMetadata: FormChange;
}

export interface UseCategoryUpdateFormResult extends CommonUseFormResult<CategoryUpdateData> {
  handlers: CategoryUpdateHandlers;
}

export interface CategoryUpdateFormProps {
  children: (props: UseCategoryUpdateFormResult) => React.ReactNode;
  category: CategoryDetailsFragment | undefined | null;
  onSubmit: (data: CategoryUpdateData) => Promise<any[]>;
  disabled: boolean;
}

const getInitialData = (category: CategoryDetailsFragment | undefined | null) => ({
  backgroundImageAlt: category?.backgroundImage?.alt || "",
  metadata: category?.metadata?.map(mapMetadataItemToInput),
  name: category?.name || "",
  privateMetadata: category?.privateMetadata?.map(mapMetadataItemToInput),
  seoDescription: category?.seoDescription || "",
  seoTitle: category?.seoTitle || "",
  slug: category?.slug || "",
});

function useCategoryUpdateForm(
  category: CategoryDetailsFragment | undefined | null,
  onSubmit: (data: CategoryUpdateData) => Promise<any[]>,
  disabled: boolean,
): UseCategoryUpdateFormResult & { richText: RichTextContextValues } {
  const {
    handleChange,
    data: formData,
    triggerChange,
    formId,
    setIsSubmitDisabled,
  } = useForm(getInitialData(category), undefined, { confirmLeave: true });
  const handleFormSubmit = useHandleFormSubmit({
    formId,
    onSubmit,
  });
  const { setExitDialogSubmitRef } = useExitFormDialog({
    formId,
  });
  const richText = useRichText({
    initial: category?.description,
    loading: !category,
    triggerChange,
  });
  const data = {
    ...formData,
    description: null,
  } as CategoryUpdateData;
  // Need to make it function to always have description.current up to date
  const getData = async (): Promise<CategoryUpdateData> =>
    ({
      ...formData,
      description: await richText.getValue(),
    }) as CategoryUpdateData;
  const getSubmitData = async (): Promise<CategoryUpdateData> =>
    ({
      ...(await getData()),
    }) as CategoryUpdateData;
  const submit = async () => handleFormSubmit(await getSubmitData());

  useEffect(() => setExitDialogSubmitRef(submit), [submit]);
  setIsSubmitDisabled(disabled);

  return {
    change: handleChange,
    data,
    handlers: {} as any,
    submit,
    isSaveDisabled: disabled,
    richText,
  };
}

const CategoryUpdateForm = ({
  children,
  category,
  onSubmit,
  disabled,
}: CategoryUpdateFormProps) => {
  const { richText, ...props } = useCategoryUpdateForm(category!, onSubmit, disabled);

  return (
    <form onSubmit={props.submit}>
      <RichTextContext.Provider value={richText}>{children(props)}</RichTextContext.Provider>
    </form>
  );
};

CategoryUpdateForm.displayName = "CategoryUpdateForm";
export default CategoryUpdateForm;

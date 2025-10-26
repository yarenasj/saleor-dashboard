// @ts-strict-ignore
import { ChannelCollectionData } from "@dashboard/channels/utils";
import { createChannelsChangeHandler } from "@dashboard/collections/utils";
import { COLLECTION_DETAILS_FORM_ID } from "@dashboard/collections/views/consts";
import { useExitFormDialog } from "@dashboard/components/Form/useExitFormDialog";
import { CollectionDetailsFragment } from "@dashboard/graphql";
import useForm, { CommonUseFormResultWithHandlers, FormChange } from "@dashboard/hooks/useForm";
import useHandleFormSubmit from "@dashboard/hooks/useHandleFormSubmit";
import { mapMetadataItemToInput } from "@dashboard/utils/maps";
import { RichTextContext, RichTextContextValues } from "@dashboard/utils/richText/context";
import useRichText from "@dashboard/utils/richText/useRichText";
import { OutputData } from "@editorjs/editorjs";
import React, { useEffect } from "react";

export interface CollectionUpdateFormData {
  backgroundImageAlt: string;
  channelListings: ChannelCollectionData[];
  name: string;
  slug: string;
  seoDescription: string;
  seoTitle: string;
}
export interface CollectionUpdateData extends CollectionUpdateFormData {
  description: OutputData;
}

interface CollectionUpdateHandlers {
  changeMetadata: FormChange;
  changeChannels: (id: string, data: Omit<ChannelCollectionData, "name" | "id">) => void;
}
export type UseCollectionUpdateFormResult = CommonUseFormResultWithHandlers<
  CollectionUpdateData,
  CollectionUpdateHandlers
>;

export interface CollectionUpdateFormProps {
  children: (props: UseCollectionUpdateFormResult) => React.ReactNode;
  collection: CollectionDetailsFragment;
  currentChannels: ChannelCollectionData[];
  setChannels: (data: ChannelCollectionData[]) => void;
  onSubmit: (data: CollectionUpdateData) => Promise<any[]>;
  disabled: boolean;
}

const getInitialData = (
  collection: CollectionDetailsFragment,
  currentChannels: ChannelCollectionData[],
): CollectionUpdateFormData => ({
  backgroundImageAlt: collection?.backgroundImage?.alt || "",
  channelListings: currentChannels,
  name: collection?.name || "",
  seoDescription: collection?.seoDescription || "",
  seoTitle: collection?.seoTitle || "",
  slug: collection?.slug || "",
});

function useCollectionUpdateForm(
  collection: CollectionDetailsFragment,
  currentChannels: ChannelCollectionData[],
  setChannels: (data: ChannelCollectionData[]) => void,
  onSubmit: (data: CollectionUpdateData) => Promise<any[]>,
  disabled: boolean,
): UseCollectionUpdateFormResult & { richText: RichTextContextValues } {
  const {
    handleChange,
    data: formData,
    triggerChange,
    formId,
    setIsSubmitDisabled,
  } = useForm(getInitialData(collection, currentChannels), undefined, {
    confirmLeave: true,
    formId: COLLECTION_DETAILS_FORM_ID,
  });
  const handleFormSubmit = useHandleFormSubmit({
    formId,
    onSubmit,
  });
  const { setExitDialogSubmitRef } = useExitFormDialog({
    formId: COLLECTION_DETAILS_FORM_ID,
  });
  const richText = useRichText({
    initial: collection?.description,
    loading: !collection,
    triggerChange,
  });
  const data: CollectionUpdateData = {
    ...formData,
    description: null,
  };
  // Need to make it function to always have description.current up to date
  const getData = async (): Promise<CollectionUpdateData> => ({
    ...formData,
    description: await richText.getValue(),
  });
  const getSubmitData = async (): Promise<CollectionUpdateData> => ({
    ...(await getData()),
  });
  const handleChannelChange = createChannelsChangeHandler(
    currentChannels,
    setChannels,
    triggerChange,
  );
  const submit = async () => handleFormSubmit(await getSubmitData());

  useEffect(() => setExitDialogSubmitRef(submit), [submit]);
  setIsSubmitDisabled(disabled);

  return {
    change: handleChange,
    data,
    handlers: {
      changeChannels: handleChannelChange,
      changeMetadata: {} as any,
    },
    submit,
    richText,
  };
}

const CollectionUpdateForm = ({
  collection,
  currentChannels,
  setChannels,
  children,
  onSubmit,
  disabled,
}: CollectionUpdateFormProps) => {
  const { richText, ...props } = useCollectionUpdateForm(
    collection,
    currentChannels,
    setChannels,
    onSubmit,
    disabled,
  );

  return (
    <form onSubmit={props.submit}>
      <RichTextContext.Provider value={richText}>{children(props)}</RichTextContext.Provider>
    </form>
  );
};

CollectionUpdateForm.displayName = "CollectionUpdateForm";
export default CollectionUpdateForm;

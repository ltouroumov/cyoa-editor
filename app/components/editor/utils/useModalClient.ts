import { isNotNil } from 'ramda';

type ModalClient<TData, TOutput> = {
  data: Ref<TData | undefined>;
  close: (result: TOutput | undefined) => void;
};

export function useModalClient<TInput = any, TData = any, TOutput = any>(
  extract?: (input: TInput) => TData,
): ModalClient<TData, TOutput> {
  type DialogProps = {
    data: TInput;
    close(result: TOutput | undefined): void;
  };
  const dialogRef = inject<Ref<DialogProps>>('dialogRef');
  const data: Ref<TData | undefined> = ref(undefined);

  onMounted(() => {
    const inputData0 = dialogRef?.value?.data;
    if (isNotNil(extract)) {
      data.value = isNotNil(inputData0) ? extract(inputData0) : undefined;
    } else {
      data.value = inputData0 as TData;
    }
  });

  const close = (result: TOutput | undefined) => {
    dialogRef?.value?.close(result);
  };

  return { data, close };
}

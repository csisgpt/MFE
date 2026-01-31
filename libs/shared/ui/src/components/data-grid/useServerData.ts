import { ref, shallowRef } from "vue";
import allocationApi from "@/services/api/allocation-requests";
import type {
  RequestPayload,
  AllocationRequestDto,
  ApiResponse,
} from "./types";

export function useServerData() {
  const pageSize = ref(10);
  const aborter = shallowRef<AbortController | null>(null);
  const lastMeta = shallowRef<
    ApiResponse<AllocationRequestDto[]>["metadata"] | null
  >(null);

  function cancel() {
    aborter.value?.abort();
    aborter.value = null;
  }

  async function load(payload: RequestPayload) {
    aborter.value?.abort();
    const controller = new AbortController();

    aborter.value = controller;

    const data = await allocationApi.cardex(payload, {
      signal: controller.signal,
    });
    lastMeta.value = data.metadata;
    return data as ApiResponse<AllocationRequestDto[]>;
  }

  async function loadAllCardexByYear(payload: RequestPayload) {
    aborter.value?.abort();
    const controller = new AbortController();

    aborter.value = controller;

    const data = await allocationApi.cardexAllByYear(payload, {
      signal: controller.signal,
    });
    lastMeta.value = data.metadata;
    return data as ApiResponse<AllocationRequestDto[]>;
  }
  return { pageSize, load, lastMeta , loadAllCardexByYear };
}

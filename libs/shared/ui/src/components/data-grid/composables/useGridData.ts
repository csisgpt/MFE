import { ref, type Ref } from 'vue';

export function useGridData(
  props: any,
  gridApi: Ref<any>,
  buildTransportedFilters: any,
  buildSortBy: any
) {
  const buildPayload = (startRow: number, endRow: number, request?: any) => {
    const api = gridApi.value;
    const pageSize = Math.max(1, endRow - startRow);
    const pageIndex = Math.floor(startRow / pageSize) + 1;

    const sortModel = request?.sortModel || api?.getSortModel?.() || [];
    const filterModel = request?.filterModel || api?.getFilterModel?.() || {};

    const { searchFilters, simple } = buildTransportedFilters(
      filterModel,
      props.columnDefs as any,
      props.additionalFilters
    );

    return {
      pageSize,
      pageIndex,
      searchFilters,
      sortBy: buildSortBy(sortModel, props.columnDefs as any, 'sign') || '-id',
      ...simple
    };
  };

  const fetchServerData = async (payload: any, signal?: AbortSignal) => {
    return false;
    if (!props.apiUrl) {
      throw new Error('apiUrl required for server mode');
    }

    const finalPayload = props.requestTransformer ? props.requestTransformer(payload) : payload;

    const mergedPayload = {
      ...finalPayload,
      ...props.additionalPayload
    };

    try {
      return;
      // const mainApi = await import('@/services/api/main-api').then((m) => m.default);

      // let response;
      // if (props.apiMethod === 'get') {
      //   response = await mainApi.get(props.apiUrl, {
      //     params: mergedPayload,
      //     signal
      //   });
      // } else {
      //   response = await mainApi.post(props.apiUrl, mergedPayload, { signal });
      // }

      // if (props.responseTransformer) {
      //   return props.responseTransformer(response);
      // }

      let data: any[] = [];
      let total = 0;

      // if (response?.data?.data) {
      //   data = Array.isArray(response.data.data) ? response.data.data : [];
      //   total = Number(response.data.metadata?.totalCount || response.data.total || 0);
      // } else if (Array.isArray(response?.data)) {
      //   data = response.data;
      //   total = data.length;
      // } else if (Array.isArray(response)) {
      //   data = response;
      //   total = data.length;
      // }

      // if (total === 0 && data.length > 0) total = data.length;

      return { data, totalCount: total };
    } catch (error: any) {
      if (error?.code === 'ERR_CANCELED' || error?.name === 'CanceledError') {
        throw error;
      }
      throw error;
    }
  };

  return {
    buildPayload,
    fetchServerData
  };
}

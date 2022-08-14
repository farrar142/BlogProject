import { AxiosResponse } from "axios";
import { useEffect, useState } from "react";
import { Paginated } from "../../api/types";

type QueryBase = {
  id: number;
};

export type PaginatedRequestArgs = {
  page: number;
  perPage: number;
};

export function usePaginatedQuery<
  T extends PaginatedRequestArgs,
  D extends QueryBase
>(params: T, query: (params: T) => Promise<AxiosResponse<Paginated<D>>>) {
  const [datas, setDatas] = useState<D[]>([]);
  const [page, setPage] = useState(1);
  const [maxPage, setMaxPage] = useState(10);
  const [lastId, setLastId] = useState(0);
  const getPage = (page: number) => {
    query({ ...params, page }).then(({ data }) => {
      setPage(data.curPage);
      setMaxPage(data.maxPage);
      setDatas(data.results);
      if (data.results.length >= 1) {
        setLastId(data.results[data.results.length - 1].id);
      }
    });
  };
  return { queryset: datas, getPage, page, maxPage };
}

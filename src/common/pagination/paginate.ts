export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Captures only the identical mechanical part of pagination (skip math,
// running count + find together, shaping the result). The caller supplies
// its own count/find functions with whatever where/include/orderBy that
// specific entity needs -- filtering and sorting are deliberately not part
// of this helper.
export async function paginate<T>(
  countFn: () => Promise<number>,
  findFn: (skip: number, take: number) => Promise<T[]>,
  page: number,
  limit = 20,
): Promise<PaginatedResult<T>> {
  const skip = (page - 1) * limit;
  const [total, data] = await Promise.all([countFn(), findFn(skip, limit)]);
  return {
    data,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

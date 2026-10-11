const parsePagination = (query = {}, fallbackLimit = 10) => {
  const page = Math.max(1, Number.parseInt(query.page ?? '1', 10) || 1)
  const limit = Math.min(
    100,
    Math.max(1, Number.parseInt(query.limit ?? String(fallbackLimit), 10) || fallbackLimit)
  )

  return {
    page,
    limit,
    skip: (page - 1) * limit,
  }
}

const withPagination = (items, total, page, limit) => ({
  data: items,
  meta: {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  },
})

module.exports = {
  parsePagination,
  withPagination,
}

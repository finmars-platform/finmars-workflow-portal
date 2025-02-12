export default function usePagination() {
	const currentPage = ref(1)
	const totalPages = ref(1)
	const pageSize = ref(8)

	return {
		currentPage, totalPages, pageSize
	}
}

export const formatDate = (dateString: Date | string | null | undefined): string | null => {
    if (!dateString) return "-"
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })
}
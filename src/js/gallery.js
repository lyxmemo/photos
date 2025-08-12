function photoGallery() {
    return {
        allPhotos: [],
        filteredPhotos: [],
        searchQuery: '',
        selectedTags: [],
        uniqueTags: [],
        fuse: null,
        expandedPhoto: null,
        showModal: false,

        init() {
            fetch('/search-index.json')
                .then(response => response.json())
                .then(data => {
                    this.allPhotos = data;
                    this.filteredPhotos = data;
                    this.uniqueTags = [...new Set(data.flatMap(p => p.tags))].filter(t => t !== 'photos');
                    this.fuse = new Fuse(data, {
                        keys: ['name', 'location', 'tags'],
                        threshold: 0.4,
                    });
                });
        },

        filterPhotos() {
            let photos = this.allPhotos;

            if (this.searchQuery.trim() !== '') {
                photos = this.fuse.search(this.searchQuery).map(result => result.item);
            }

            if (this.selectedTags.length > 0) {
                photos = photos.filter(photo =>
                    this.selectedTags.every(tag => photo.tags.includes(tag))
                );
            }

            this.filteredPhotos = photos;
        },

        toggleTag(tag) {
            if (this.selectedTags.includes(tag)) {
                this.selectedTags = this.selectedTags.filter(t => t !== tag);
            } else {
                this.selectedTags.push(tag);
            }
            this.filterPhotos();
        },

        expandPhoto(photo) {
            this.expandedPhoto = photo;
            this.showModal = true;
            // Prevent body scroll when modal is open
            document.body.style.overflow = 'hidden';
        },

        closeModal() {
            this.showModal = false;
            this.expandedPhoto = null;
            // Restore body scroll
            document.body.style.overflow = 'auto';
        },

        // Close modal when clicking outside the image or pressing Escape
        handleModalClick(event) {
            if (event.target === event.currentTarget) {
                this.closeModal();
            }
        },

        handleKeydown(event) {
            if (event.key === 'Escape' && this.showModal) {
                this.closeModal();
            }
        }
    };
}

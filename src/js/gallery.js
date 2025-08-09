function photoGallery() {
    return {
        allPhotos: [],
        filteredPhotos: [],
        searchQuery: '',
        selectedTags: [],
        uniqueTags: [],
        fuse: null,

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
        }
    };
}

import axios from 'axios';

axios.defaults.baseURL = `https://pixabay.com/api`;

export const fetchImages = async (inputValue, pageNr) => {
    const response = await axios.get(
        `/?q=${inputValue}&page=${pageNr}&key=37467612-79de9f8a423604a3d52625054&image_type=photo&orientation=horizontal&per_page=12`
    );

    const totalHits = response.data.totalHits;
    const imagesData = response.data.hits.map((image) => ({
        id: image.id,
        webformatURL: image.webformatURL,
        largeImageURL: image.largeImageURL,
        tags: image.tags,
    }));

    return { totalHits, imagesData };
}
import React, { Component } from 'react';
import { Searchbar } from './Searchbar/Searchbar';
import { fetchImages } from './api/fetchImages';
import { ImageGallery } from './ImageGallery/ImageGallery';
import { Button } from './Button/Button';
import { Loader } from './Loader/Loader';
import { Modal } from './Modal/Modal';
import Notiflix from 'notiflix';

export class App extends Component {
  state = {
    images: [],
    isLoading: false,
    currentSearch: '',
    pageNr: 1,
    modalOpen: false,
    modalImg: '',
    modalAlt: '',    
  };

  handleSubmit = async (e) => {
    e.preventDefault();
    const inputForSearch = e.target.elements.inputForSearch;
    const searchValue = inputForSearch.value.trim();

    if (searchValue === '') {
      Notiflix.Notify.info('You cannot search by an empty field, try again.');
      return;
    }

    this.setState({ isLoading: true });

    try {
    const { totalHits, imagesData } = await fetchImages(searchValue, 1);

    if (imagesData.length < 1) {
      this.setState({ images: [], currentSearch: searchValue, pageNr: 1 });
      Notiflix.Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
    } else {
      this.setState({
        images: imagesData,
        currentSearch: searchValue,
        pageNr: 1,
        totalHits: totalHits, 
      });
    }
  } catch (error)  {
      console.error('Error fetching images:', error);
      Notiflix.Notify.failure('An error occurred while fetching images.');
    }

    this.setState({ isLoading: false });
  };

  loadMoreImages = async () => {
  this.setState({ isLoading: true });

  try {
    const nextPageNr = this.state.pageNr + 1;
    
    const response = await fetchImages(
      this.state.currentSearch,
      nextPageNr
    );

    this.setState((prevState) => ({
      images: [...prevState.images, ...response.imagesData],
      pageNr: nextPageNr, 
      totalHits: response.totalHits, 
    }));
  } catch (error) {
    console.error('Error fetching images:', error);
    Notiflix.Notify.failure('An error occurred while fetching images.');
  }

  this.setState({ isLoading: false });
};


  handleImageClick = e => {
    this.setState({
      modalOpen: true,
      modalAlt: e.target.alt,
      modalImg: e.target.name,
    });
  };

  handleModalClose = () => {
    this.setState({
      modalOpen: false,
      modalImg: '',
      modalAlt: '',
    });
  };

  handleKeyDown = event => {
    if (event.code === 'Escape') {
      this.handleModalClose();
    }
  };

  componentDidMount() {
    this.timeout = setTimeout(() => this.setState({ isLoading: false }), 5000);
    window.addEventListener('keydown', this.handleKeyDown);
  }

  componentWillUnmount() {
    clearTimeout(this.timeout);
    window.removeEventListener('keydown', this.handleKeyDown);
  }

  render() {
    const { isLoading, images, modalOpen, modalImg, modalAlt, totalHits } = this.state;

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr',
        gridGap: '16px',
        paddingBottom: '24px',
      }}
    >
        {isLoading ? (
        <Loader />
      ) : (
        <React.Fragment>
          <Searchbar onSubmit={this.handleSubmit} />
          <ImageGallery
            onImageClick={this.handleImageClick}
            images={images}
          />
          {images.length < totalHits ? (
            <Button onClick={this.loadMoreImages} />
          ) : null}
        </React.Fragment>
      )}
      {modalOpen ? (
        <Modal
          src={modalImg}
          alt={modalAlt}
          handleClose={this.handleModalClose}
        />
      ) : null}
    </div>
    );
  }
}
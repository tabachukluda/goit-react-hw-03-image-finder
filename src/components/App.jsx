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
      const response = await fetchImages(searchValue, 1);

      if (response.length < 1) {
        this.setState({ images: [], currentSearch: searchValue, pageNr: 1 });
        Notiflix.Notify.failure(
          'Sorry, there are no images matching your search query. Please try again.'
        );
      } else {
        this.setState({ images: response, currentSearch: searchValue, pageNr: 1 });
      }
    } catch (error) {
      console.error('Error fetching images:', error);
      Notiflix.Notify.failure('An error occurred while fetching images.');
    }

    this.setState({ isLoading: false });
  };

  loadMoreImages = async () => {
  this.setState({ isLoading: true });

  try {
    const response = await fetchImages(
      this.state.currentSearch,
      this.state.pageNr + 1
    );

    this.setState((prevState) => ({
      images: [...prevState.images, ...response],
      pageNr: prevState.pageNr + 1,
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
    return (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gridGap: '16px',
          paddingBottom: '24px',
        }}
      >
        {this.state.isLoading ? (
          <Loader />
        ) : (
          <React.Fragment>
            <Searchbar onSubmit={this.handleSubmit} />
            <ImageGallery
              onImageClick={this.handleImageClick}
              images={this.state.images}
            />
            {this.state.images.length > 0 ? (
              <Button onClick={this.loadMoreImages} />
            ) : null}
          </React.Fragment>
        )}
        {this.state.modalOpen ? (
          <Modal
            src={this.state.modalImg}
            alt={this.state.modalAlt}
            handleClose={this.handleModalClose}
          />
        ) : null}
      </div>
    );
  }
}
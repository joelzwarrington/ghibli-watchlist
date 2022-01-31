import React, { useEffect, useState } from 'react';
import {
  Checkbox,
  Rating as RatingComponent,
  RatingProps as RatingDataValue,
  Input,
} from 'semantic-ui-react';

enum Rating {
  '1_STARS' = 1,
  '2_STARS' = 2,
  '3_STARS' = 3,
  '4_STARS' = 4,
  '5_STARS' = 5,
}

interface Film extends GhibliFilm {
  viewed: boolean;
  rating?: Rating;
}

const LOCAL_STORAGE_KEY = 'GHIBLI_FILMS';

export function App() {
  const [films, setFilms] = useState<Film[]>([]);
  const [search, setSearch] = useState<string>('');

  // On component mount, get data
  useEffect(() => {
    // get movies from API
    getFilms().then((ghibliFilms) => {
      const filmsToBeLoadedIntoState = new Map<string, Film>();

      for (const { id, title, description } of ghibliFilms) {
        filmsToBeLoadedIntoState.set(id, {
          id,
          title,
          description,
          viewed: false,
        });
      }

      const savedFilms = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedFilms) {
        const savedFilmsJSON = JSON.parse(savedFilms) as Film[];
        for (const film of savedFilmsJSON) {
          if (film.viewed) console.log(film);
          filmsToBeLoadedIntoState.set(film.id, film);
        }
      }
      setFilms(Array.from(filmsToBeLoadedIntoState, ([_key, value]) => value));
    });
  }, []);

  // when films are updated, store them in local storage
  useEffect(() => {
    if (films.length > 0) {
      console.log('saving films', films);

      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(films));
    }
  }, [films]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        margin: '8px',
        alignItems: 'flex-start',
      }}
    >
      <Input
        onChange={(_e, data) => {
          setSearch(data.value);
        }}
      />
      <ul style={{ listStyle: 'none', marginLeft: 0, paddingLeft: 0 }}>
        {films
          .filter((film) =>
            film.title.toLowerCase().startsWith(search.toLowerCase())
          )
          .map(({ id, title, viewed, rating }) => {
            function handleCheckboxClick() {
              setFilms(
                films.map((film) =>
                  id == film.id ? { ...film, viewed: !viewed } : film
                )
              );
            }
            function handleRatingChange(
              _event: React.MouseEvent<HTMLDivElement, MouseEvent>,
              { rating }: RatingDataValue
            ) {
              const ratingNumber =
                typeof rating == 'number' ? rating : Number.parseInt(rating);
              setFilms(
                films.map((film) =>
                  id == film.id ? { ...film, rating: ratingNumber } : film
                )
              );
            }
            return (
              <li key={id}>
                <div
                  style={{
                    display: 'flex',
                    gap: '8px',
                    alignItems: 'center',
                  }}
                >
                  <Checkbox checked={viewed} onClick={handleCheckboxClick} />
                  {title}
                  <RatingComponent
                    icon='star'
                    rating={rating}
                    maxRating={5}
                    clearable
                    onRate={handleRatingChange}
                  />
                </div>
              </li>
            );
          })}
      </ul>
    </div>
  );
}

interface GhibliFilm extends Record<string, any> {
  id: string;
  title: string;
  description: string;
}

const GHIBLI_API = 'https://ghibliapi.herokuapp.com';

async function getFilms() {
  const response = await fetch(`${GHIBLI_API}/films`);
  const films: GhibliFilm[] = await response.json();
  return films;
}
